import { OpenProjectClientBase, RELATION_TYPES, API_PREFIX, MAX_PAGE_SIZE, REQUEST_TIMEOUT_MS } from "./base.js";
import type {
  Project, CreateProjectInput, UpdateProjectInput,
  WorkPackage,
  Status, Type, Priority, Role, Category,
  User, CreateUserInput, UpdateUserInput,
  Relation,
  TimeEntry, CreateTimeEntryInput, UpdateTimeEntryInput,
  Version, CreateVersionInput, UpdateVersionInput,
  Activity,
  Notification,
  Attachment,
  Membership, CreateMembershipInput, UpdateMembershipInput,
  Group, CreateGroupInput, UpdateGroupInput,
  News, CreateNewsInput, UpdateNewsInput,
  Query, CreateQueryInput,
  Document, UpdateDocumentInput,
  CustomAction,
  Day, WeekDay, NonWorkingDay,
  FileLink, CreateFileLinkInput,
  View, CreateViewInput,
  Budget,
  Revision,
  Principal,
  Configuration, Root,
} from "../schemas/index.js";
import type { ResolvedEntity, OpenProjectConfig } from "../types.js";

// Import register functions
import { registerProjectMethods } from "./projects.js";
import { registerWorkPackageMethods } from "./work-packages.js";
import { registerUserMethods } from "./users.js";
import { registerMetadataMethods } from "./metadata.js";
import { registerRelationMethods } from "./relations.js";
import { registerTimeEntryMethods } from "./time-entries.js";
import { registerVersionMethods } from "./versions.js";
import { registerActivityMethods } from "./activities.js";
import { registerNotificationMethods } from "./notifications.js";
import { registerAttachmentMethods } from "./attachments.js";
import { registerMembershipMethods } from "./memberships.js";
import { registerGroupMethods } from "./groups.js";
import { registerNewsMethods } from "./news.js";
import { registerQueryMethods } from "./queries.js";
import { registerDocumentMethods } from "./documents.js";
import { registerCustomActionMethods } from "./custom-actions.js";
import { registerDayMethods } from "./days.js";
import { registerFileLinkMethods } from "./file-links.js";
import { registerViewMethods } from "./views.js";
import { registerBudgetMethods } from "./budgets.js";
import { registerRevisionMethods } from "./revisions.js";
import { registerPrincipalMethods } from "./principals.js";
import { registerConfigurationMethods } from "./configuration.js";

export class OpenProjectClient extends OpenProjectClientBase {
  // Projects
  declare getProjects: (limit?: number) => Promise<Project[]>;
  declare getProject: (id: number) => Promise<Project>;
  declare createProject: (input: CreateProjectInput) => Promise<Project>;
  declare updateProject: (id: number, input: UpdateProjectInput) => Promise<Project>;
  declare deleteProject: (id: number) => Promise<void>;
  declare resolveProject: (projectRef: string) => Promise<Project>;
  declare resolveProjectIdentifier: (projectRef: string) => Promise<string>;

  // Work packages
  declare listWorkPackages: (projectId: number, options?: { limit?: number; statusFilter?: string; assigneeFilter?: string }) => Promise<WorkPackage[]>;
  declare getWorkPackage: (id: number) => Promise<WorkPackage>;
  declare createWorkPackage: (project: Project, subject: string, typeName?: string, description?: string) => Promise<WorkPackage>;
  declare deleteWorkPackage: (id: number) => Promise<void>;
  declare updateWorkPackageStatus: (id: number, statusName: string) => Promise<WorkPackage>;
  declare updateWorkPackage: (id: number, fields: { subject?: string; description?: string; statusName?: string; assigneeRef?: string; priorityName?: string; typeName?: string; startDate?: string; dueDate?: string }) => Promise<WorkPackage>;
  declare addComment: (id: number, comment: string) => Promise<unknown>;

  // Metadata
  declare getStatuses: () => Promise<Status[]>;
  declare getPriorities: () => Promise<Priority[]>;
  declare getTypes: (projectId?: number) => Promise<Type[]>;
  declare getRoles: (limit?: number) => Promise<Role[]>;
  declare getRole: (id: number) => Promise<Role>;
  declare getCategories: (projectId: number) => Promise<Category[]>;
  declare getCategory: (id: number) => Promise<Category>;
  declare getWorkPackageSchema: (projectId?: number) => Promise<unknown>;
  declare getProjectSchema: () => Promise<unknown>;
  declare resolveStatus: (statusName: string) => Promise<ResolvedEntity>;
  declare resolveAllowedTransitionStatus: (workPackage: WorkPackage, statusName: string) => Promise<ResolvedEntity>;
  declare resolveType: (projectId: number | null, typeName: string) => Promise<ResolvedEntity>;
  declare resolvePriority: (priorityName: string) => Promise<ResolvedEntity>;

  // Users
  declare getUsers: (limit?: number) => Promise<User[]>;
  declare getUser: (id: number) => Promise<User>;
  declare createUser: (input: CreateUserInput) => Promise<User>;
  declare updateUser: (id: number, input: UpdateUserInput) => Promise<User>;
  declare deleteUser: (id: number) => Promise<void>;
  declare resolveUser: (userRef: string) => Promise<ResolvedEntity>;

  // Relations
  declare listWorkPackageRelations: (wpId: number, limit?: number) => Promise<Relation[]>;
  declare getRelation: (id: number) => Promise<Relation>;
  declare createRelation: (fromId: number, toId: number, relationType: string, description?: string, lag?: number) => Promise<Relation>;
  declare deleteRelation: (id: number) => Promise<void>;

  // Time entries
  declare listTimeEntries: (options?: { projectId?: number; workPackageId?: number; limit?: number }) => Promise<TimeEntry[]>;
  declare getTimeEntry: (id: number) => Promise<TimeEntry>;
  declare createTimeEntry: (input: CreateTimeEntryInput) => Promise<TimeEntry>;
  declare updateTimeEntry: (id: number, input: UpdateTimeEntryInput) => Promise<TimeEntry>;
  declare deleteTimeEntry: (id: number) => Promise<void>;

  // Versions
  declare listVersions: (projectId: number) => Promise<Version[]>;
  declare getVersion: (id: number) => Promise<Version>;
  declare createVersion: (input: CreateVersionInput) => Promise<Version>;
  declare updateVersion: (id: number, input: UpdateVersionInput) => Promise<Version>;
  declare deleteVersion: (id: number) => Promise<void>;

  // Activities
  declare listActivities: (wpId: number) => Promise<Activity[]>;
  declare getActivity: (id: number) => Promise<Activity>;

  // Notifications
  declare listNotifications: (options?: { limit?: number }) => Promise<Notification[]>;
  declare getNotification: (id: number) => Promise<Notification>;
  declare markNotificationRead: (id: number) => Promise<Notification>;

  // Attachments
  declare getAttachment: (id: number) => Promise<Attachment>;
  declare deleteAttachment: (id: number) => Promise<void>;

  // Memberships
  declare listMemberships: (options?: { projectId?: number; limit?: number }) => Promise<Membership[]>;
  declare getMembership: (id: number) => Promise<Membership>;
  declare createMembership: (input: CreateMembershipInput) => Promise<Membership>;
  declare updateMembership: (id: number, input: UpdateMembershipInput) => Promise<Membership>;
  declare deleteMembership: (id: number) => Promise<void>;

  // Groups
  declare listGroups: (limit?: number) => Promise<Group[]>;
  declare getGroup: (id: number) => Promise<Group>;
  declare createGroup: (input: CreateGroupInput) => Promise<Group>;
  declare updateGroup: (id: number, input: UpdateGroupInput) => Promise<Group>;
  declare deleteGroup: (id: number) => Promise<void>;

  // News
  declare listNews: (options?: { projectId?: number; limit?: number }) => Promise<News[]>;
  declare getNews: (id: number) => Promise<News>;
  declare createNews: (input: CreateNewsInput) => Promise<News>;
  declare updateNews: (id: number, input: UpdateNewsInput) => Promise<News>;
  declare deleteNews: (id: number) => Promise<void>;

  // Queries
  declare listQueries: (options?: { projectId?: number; limit?: number }) => Promise<Query[]>;
  declare getQuery: (id: number) => Promise<Query>;
  declare createQuery: (input: CreateQueryInput) => Promise<Query>;
  declare updateQuery: (id: number, input: Partial<CreateQueryInput>) => Promise<Query>;
  declare deleteQuery: (id: number) => Promise<void>;

  // Documents
  declare listDocuments: (options?: { projectId?: number; limit?: number }) => Promise<Document[]>;
  declare getDocument: (id: number) => Promise<Document>;
  declare updateDocument: (id: number, input: UpdateDocumentInput) => Promise<Document>;

  // Custom actions
  declare getCustomAction: (id: number) => Promise<CustomAction>;
  declare executeCustomAction: (id: number, wpId: number, lockVersion: number) => Promise<unknown>;

  // Days
  declare listDays: (from: string, to: string) => Promise<Day[]>;
  declare listWeekDays: () => Promise<WeekDay[]>;
  declare listNonWorkingDays: () => Promise<NonWorkingDay[]>;

  // File links
  declare listFileLinks: (wpId: number) => Promise<FileLink[]>;
  declare getFileLink: (id: number) => Promise<FileLink>;
  declare createFileLink: (wpId: number, input: CreateFileLinkInput) => Promise<FileLink>;
  declare deleteFileLink: (id: number) => Promise<void>;

  // Views
  declare listViews: (options?: { limit?: number }) => Promise<View[]>;
  declare getView: (id: number) => Promise<View>;
  declare createView: (type: string, input: CreateViewInput) => Promise<View>;
  declare updateView: (id: number, input: Partial<CreateViewInput>) => Promise<View>;
  declare deleteView: (id: number) => Promise<void>;

  // Budgets
  declare getBudget: (id: number) => Promise<Budget>;

  // Revisions
  declare listRevisions: (projectId: number) => Promise<Revision[]>;
  declare getRevision: (id: number) => Promise<Revision>;

  // Principals
  declare listPrincipals: (options?: { projectId?: number; limit?: number }) => Promise<Principal[]>;

  // Configuration
  declare getConfiguration: () => Promise<Configuration>;
  declare getServerInfo: () => Promise<Root>;
}

// Register all domain methods onto the prototype
registerProjectMethods(OpenProjectClient);
registerWorkPackageMethods(OpenProjectClient);
registerUserMethods(OpenProjectClient);
registerMetadataMethods(OpenProjectClient);
registerRelationMethods(OpenProjectClient);
registerTimeEntryMethods(OpenProjectClient);
registerVersionMethods(OpenProjectClient);
registerActivityMethods(OpenProjectClient);
registerNotificationMethods(OpenProjectClient);
registerAttachmentMethods(OpenProjectClient);
registerMembershipMethods(OpenProjectClient);
registerGroupMethods(OpenProjectClient);
registerNewsMethods(OpenProjectClient);
registerQueryMethods(OpenProjectClient);
registerDocumentMethods(OpenProjectClient);
registerCustomActionMethods(OpenProjectClient);
registerDayMethods(OpenProjectClient);
registerFileLinkMethods(OpenProjectClient);
registerViewMethods(OpenProjectClient);
registerBudgetMethods(OpenProjectClient);
registerRevisionMethods(OpenProjectClient);
registerPrincipalMethods(OpenProjectClient);
registerConfigurationMethods(OpenProjectClient);

export { RELATION_TYPES, API_PREFIX, MAX_PAGE_SIZE, REQUEST_TIMEOUT_MS };
