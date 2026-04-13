export interface OpenProjectConfig {
  baseUrl: string;
  apiToken: string;
}

export interface HalLink {
  href: string;
  title?: string;
  method?: string;
}

export interface HalLinks {
  self?: HalLink;
  [key: string]: HalLink | undefined;
}

export interface HalResource {
  _type?: string;
  _links?: HalLinks;
  _embedded?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface Project extends HalResource {
  id: number;
  identifier: string;
  name: string;
}

export interface WorkPackage extends HalResource {
  id: number;
  subject: string;
  lockVersion: number;
  description?: { raw: string } | string;
  startDate?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Status extends HalResource {
  id: number;
  name: string;
  isClosed?: boolean;
}

export interface Type extends HalResource {
  id: number;
  name: string;
  isMilestone?: boolean;
}

export interface Priority extends HalResource {
  id: number;
  name: string;
  position?: number;
}

export interface User extends HalResource {
  id: number;
  name?: string;
  login?: string;
  firstName?: string;
  lastName?: string;
}

export interface Relation extends HalResource {
  id: number;
  type: string;
  description?: string;
  lag?: number;
}

export interface ResolvedEntity {
  name: string;
  href: string;
}
