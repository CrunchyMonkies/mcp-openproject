import { z } from "zod";
import { OpenProjectError, extractErrorMessage } from "../errors.js";
import {
  extractEmbeddedElements,
  nestedGet,
} from "../helpers.js";
import type { HalResource, OpenProjectConfig } from "../types.js";

export const API_PREFIX = "/api/v3";
export const MAX_PAGE_SIZE = 200;
export const REQUEST_TIMEOUT_MS = 30_000;

export const RELATION_TYPES = new Set([
  "relates", "duplicates", "duplicated", "blocks", "blocked",
  "precedes", "follows", "includes", "partof", "requires", "required",
]);

export class OpenProjectClientBase {
  private baseUrl: string;
  private authHeader: string;

  constructor(config: OpenProjectConfig) {
    let base = config.baseUrl.trim().replace(/\/+$/, "");
    if (base.endsWith(API_PREFIX)) {
      base = base.slice(0, -API_PREFIX.length);
    }
    if (!base) {
      throw new OpenProjectError("OPENPROJECT_BASE_URL is required.");
    }
    this.baseUrl = base;

    if (!config.apiToken) {
      throw new OpenProjectError("OPENPROJECT_API_TOKEN is required.");
    }
    this.authHeader = "Basic " + Buffer.from(`apikey:${config.apiToken}`).toString("base64");
  }

  protected async request(
    method: string,
    path: string,
    options: {
      params?: Record<string, string | number>;
      payload?: unknown;
      expectedStatuses?: number[];
    } = {},
  ): Promise<unknown> {
    const { params, payload, expectedStatuses = [200] } = options;

    let normalizedPath = path;
    if (!normalizedPath.startsWith("/")) {
      normalizedPath = `/${normalizedPath}`;
    }

    const url = new URL(`${this.baseUrl}${API_PREFIX}${normalizedPath}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, String(value));
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: {
          Authorization: this.authHeader,
          Accept: "application/hal+json",
          "Content-Type": "application/json",
        },
        body: payload !== undefined ? JSON.stringify(payload) : undefined,
        signal: controller.signal,
      });

      if (expectedStatuses.includes(response.status)) {
        if (response.status === 204 || response.headers.get("content-length") === "0") {
          return {};
        }
        try {
          return await response.json();
        } catch {
          return {};
        }
      }

      const detail = await extractErrorMessage(response);

      if (response.status === 401 || response.status === 403) {
        throw new OpenProjectError(
          "Authentication failed. Check OPENPROJECT_BASE_URL, OPENPROJECT_API_TOKEN, and token permissions.",
          response.status,
        );
      }

      throw new OpenProjectError(
        `OpenProject API error ${response.status} for ${method.toUpperCase()} ${normalizedPath}: ${detail}`,
        response.status,
      );
    } catch (err) {
      if (err instanceof OpenProjectError) throw err;
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new OpenProjectError("Request timed out after 30 seconds.");
      }
      throw new OpenProjectError(`Network error: ${err}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  protected async collectCollection(
    path: string,
    params?: Record<string, string | number>,
    limit = 50,
  ): Promise<HalResource[]> {
    if (limit <= 0) return [];

    const baseParams = { ...params };
    const pageSize = Math.max(1, Math.min(limit, MAX_PAGE_SIZE));
    delete baseParams.pageSize;

    const collected: HalResource[] = [];
    let offset = 1;

    while (collected.length < limit) {
      const remaining = limit - collected.length;
      const requestParams: Record<string, string | number> = {
        ...baseParams,
        offset,
        pageSize: Math.min(pageSize, remaining),
      };

      const data = await this.request("GET", path, {
        params: requestParams,
        expectedStatuses: [200],
      });

      const elements = extractEmbeddedElements(data);
      if (elements.length === 0) break;

      collected.push(...elements.slice(0, remaining));

      const count = ((data as Record<string, unknown>).count as number) || elements.length;
      if (count <= 0) break;

      const links = nestedGet(data, ["_links", "nextByOffset"], null);
      if (!links || typeof links !== "object") break;

      offset += count;
    }

    return collected.slice(0, limit);
  }

  protected parseResponse<T>(schema: z.ZodType<T>, data: unknown, label: string): T {
    const result = schema.safeParse(data);
    if (result.success) return result.data;
    console.error(`[schema-warn] ${label}:`, z.prettifyError(result.error));
    return data as T;
  }

  protected toApiPath(urlOrPath: string): string {
    let value = (urlOrPath || "").trim();
    if (!value) return "/";
    if (value.includes("://")) {
      try {
        const parsed = new URL(value);
        value = parsed.pathname;
      } catch {
        return "/";
      }
    }
    if (value.startsWith(API_PREFIX)) {
      value = value.slice(API_PREFIX.length) || "/";
    }
    if (!value.startsWith("/")) {
      value = `/${value}`;
    }
    return value;
  }
}
