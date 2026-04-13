import { OpenProjectError } from "../errors.js";
import { nestedGet, userDisplayName, userIdentityKeys } from "../helpers.js";
import {
  UserSchema,
  type User,
  type CreateUserInput,
  type UpdateUserInput,
} from "../schemas/index.js";
import type { ResolvedEntity } from "../types.js";
import { API_PREFIX } from "./base.js";
import type { OpenProjectClient } from "./index.js";

export function registerUserMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.getUsers = async function(this: OpenProjectClient, limit = 200): Promise<User[]> {
    const elements = await this.collectCollection("/users", undefined, limit);
    return elements.map(e => this.parseResponse(UserSchema, e, "getUsers[]"));
  };

  Client.prototype.getUser = async function(this: OpenProjectClient, id: number): Promise<User> {
    const data = await this.request("GET", `/users/${id}`);
    return this.parseResponse(UserSchema, data, "getUser");
  };

  Client.prototype.createUser = async function(this: OpenProjectClient, input: CreateUserInput): Promise<User> {
    const data = await this.request("POST", "/users", {
      payload: input,
      expectedStatuses: [200, 201],
    });
    return this.parseResponse(UserSchema, data, "createUser");
  };

  Client.prototype.updateUser = async function(this: OpenProjectClient, id: number, input: UpdateUserInput): Promise<User> {
    const data = await this.request("PATCH", `/users/${id}`, {
      payload: input,
      expectedStatuses: [200],
    });
    return this.parseResponse(UserSchema, data, "updateUser");
  };

  Client.prototype.deleteUser = async function(this: OpenProjectClient, id: number): Promise<void> {
    await this.request("DELETE", `/users/${id}`, {
      expectedStatuses: [200, 204],
    });
  };

  Client.prototype.resolveUser = async function(this: OpenProjectClient, userRef: string): Promise<ResolvedEntity> {
    const target = userRef.trim();
    if (!target) throw new OpenProjectError("Assignee value is empty.");

    if (/^\d+$/.test(target)) {
      const userId = parseInt(target, 10);
      const user = await this.getUser(userId);
      const name = userDisplayName(user);
      return { name, href: `${API_PREFIX}/users/${userId}` };
    }

    let users: User[];
    try {
      users = await this.getUsers(500);
    } catch (err) {
      if (err instanceof OpenProjectError && err.statusCode === 403) {
        throw new OpenProjectError(
          "Cannot resolve assignee by name because user listing is not permitted. Use numeric user ID.",
        );
      }
      throw err;
    }

    const lowered = target.toLowerCase();
    let exactMatch: User | null = null;
    let partialMatch: User | null = null;

    for (const user of users) {
      const keys = userIdentityKeys(user);
      const loweredKeys = keys.map((k) => k.toLowerCase());
      if (loweredKeys.includes(lowered)) {
        exactMatch = user;
        break;
      }
      if (!partialMatch && loweredKeys.some((k) => k.includes(lowered))) {
        partialMatch = user;
      }
    }

    const selected = exactMatch || partialMatch;
    if (!selected) {
      const names = [...new Set(users.map(userDisplayName).filter((n) => n !== "-" && n !== ""))].sort();
      const hint = names.length > 0 ? names.slice(0, 12).join(", ") : "No visible users found.";
      throw new OpenProjectError(
        `Unknown user '${userRef}'. Use numeric user ID, login, or exact display name. Known users: ${hint}`,
      );
    }

    const href =
      (nestedGet(selected, ["_links", "self", "href"], "") as string) ||
      (selected.id !== undefined ? `${API_PREFIX}/users/${selected.id}` : "");
    if (!href) throw new OpenProjectError("Resolved user did not include a self href or id.");
    return { name: userDisplayName(selected), href };
  };
}
