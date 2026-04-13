import { OpenProjectError } from "../errors.js";
import { extractEmbeddedElements, nestedGet } from "../helpers.js";
import {
  ProjectSchema,
  type Project,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "../schemas/index.js";
import { API_PREFIX } from "./base.js";
import type { OpenProjectClient } from "./index.js";

export function registerProjectMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.getProjects = async function(this: OpenProjectClient, limit = 500): Promise<Project[]> {
    const elements = await this.collectCollection("/projects", undefined, limit);
    return elements.map(e => this.parseResponse(ProjectSchema, e, "getProjects[]"));
  };

  Client.prototype.getProject = async function(this: OpenProjectClient, id: number): Promise<Project> {
    const data = await this.request("GET", `/projects/${id}`);
    return this.parseResponse(ProjectSchema, data, "getProject");
  };

  Client.prototype.createProject = async function(this: OpenProjectClient, input: CreateProjectInput): Promise<Project> {
    const payload: Record<string, unknown> = { name: input.name };
    if (input.identifier !== undefined) payload.identifier = input.identifier;
    if (input.description !== undefined) payload.description = input.description;
    if (input.public !== undefined) payload.public = input.public;
    if (input.parent !== undefined) {
      payload._links = { parent: { href: input.parent } };
    }
    const data = await this.request("POST", "/projects", {
      payload,
      expectedStatuses: [200, 201],
    });
    return this.parseResponse(ProjectSchema, data, "createProject");
  };

  Client.prototype.updateProject = async function(this: OpenProjectClient, id: number, input: UpdateProjectInput): Promise<Project> {
    const data = await this.request("PATCH", `/projects/${id}`, {
      payload: input,
      expectedStatuses: [200],
    });
    return this.parseResponse(ProjectSchema, data, "updateProject");
  };

  Client.prototype.deleteProject = async function(this: OpenProjectClient, id: number): Promise<void> {
    await this.request("DELETE", `/projects/${id}`, {
      expectedStatuses: [200, 204],
    });
  };

  Client.prototype.resolveProject = async function(this: OpenProjectClient, projectRef: string): Promise<Project> {
    const target = projectRef.trim();
    if (!target) throw new OpenProjectError("Project value is empty.");

    const projects = await this.getProjects();
    if (projects.length === 0) {
      throw new OpenProjectError("No projects were returned by OpenProject.");
    }

    const lowered = target.toLowerCase();
    for (const project of projects) {
      const id = String(project.id || "").trim();
      const identifier = String(project.identifier || "").trim();
      const name = String(project.name || "").trim();

      if (/^\d+$/.test(target) && id === target) return project;
      if (identifier && identifier.toLowerCase() === lowered) return project;
      if (name && name.toLowerCase() === lowered) return project;
    }

    throw new OpenProjectError(
      "Could not resolve project. Provide a valid project ID or identifier, or set OPENPROJECT_DEFAULT_PROJECT.",
    );
  };

  Client.prototype.resolveProjectIdentifier = async function(this: OpenProjectClient, projectRef: string): Promise<string> {
    const project = await this.resolveProject(projectRef);
    const identifier = String(project.identifier || "").trim();
    if (identifier) return identifier;
    if (project.id !== undefined) return String(project.id);
    throw new OpenProjectError("Resolved project does not include identifier or id.");
  };
}
