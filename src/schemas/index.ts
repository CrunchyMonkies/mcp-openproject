// HAL base
export { HalLinkSchema, HalLinksSchema, HalResourceSchema } from "./hal.js";
export type { HalLink, HalLinks, HalResource } from "./hal.js";
export { CollectionSchema } from "./collection.js";
export type { Collection } from "./collection.js";

// Resources
export { ProjectSchema, CreateProjectInputSchema, UpdateProjectInputSchema } from "./project.js";
export type { Project, CreateProjectInput, UpdateProjectInput } from "./project.js";

export { WorkPackageSchema, CreateWorkPackageInputSchema, UpdateWorkPackageInputSchema } from "./work-package.js";
export type { WorkPackage, CreateWorkPackageInput, UpdateWorkPackageInput } from "./work-package.js";

export { StatusSchema } from "./status.js";
export type { Status } from "./status.js";

export { TypeSchema } from "./type.js";
export type { Type } from "./type.js";

export { PrioritySchema } from "./priority.js";
export type { Priority } from "./priority.js";

export { UserSchema, CreateUserInputSchema, UpdateUserInputSchema } from "./user.js";
export type { User, CreateUserInput, UpdateUserInput } from "./user.js";

export { RelationSchema, CreateRelationInputSchema } from "./relation.js";
export type { Relation, CreateRelationInput } from "./relation.js";

export { TimeEntrySchema, CreateTimeEntryInputSchema, UpdateTimeEntryInputSchema } from "./time-entry.js";
export type { TimeEntry, CreateTimeEntryInput, UpdateTimeEntryInput } from "./time-entry.js";

export { VersionSchema, CreateVersionInputSchema, UpdateVersionInputSchema } from "./version.js";
export type { Version, CreateVersionInput, UpdateVersionInput } from "./version.js";

export { ActivitySchema } from "./activity.js";
export type { Activity } from "./activity.js";

export { NotificationSchema } from "./notification.js";
export type { Notification } from "./notification.js";

export { AttachmentSchema } from "./attachment.js";
export type { Attachment } from "./attachment.js";

export { MembershipSchema, CreateMembershipInputSchema, UpdateMembershipInputSchema } from "./membership.js";
export type { Membership, CreateMembershipInput, UpdateMembershipInput } from "./membership.js";

export { GroupSchema, CreateGroupInputSchema, UpdateGroupInputSchema } from "./group.js";
export type { Group, CreateGroupInput, UpdateGroupInput } from "./group.js";

export { RoleSchema } from "./role.js";
export type { Role } from "./role.js";

export { NewsSchema, CreateNewsInputSchema, UpdateNewsInputSchema } from "./news.js";
export type { News, CreateNewsInput, UpdateNewsInput } from "./news.js";

export { QuerySchema, CreateQueryInputSchema } from "./query.js";
export type { Query, CreateQueryInput } from "./query.js";

export { DocumentSchema, UpdateDocumentInputSchema } from "./document.js";
export type { Document, UpdateDocumentInput } from "./document.js";

export { CustomActionSchema } from "./custom-action.js";
export type { CustomAction } from "./custom-action.js";

export { DaySchema, WeekDaySchema, NonWorkingDaySchema } from "./days.js";
export type { Day, WeekDay, NonWorkingDay } from "./days.js";

export { FileLinkSchema, CreateFileLinkInputSchema } from "./file-link.js";
export type { FileLink, CreateFileLinkInput } from "./file-link.js";

export { ViewSchema, CreateViewInputSchema } from "./view.js";
export type { View, CreateViewInput } from "./view.js";

export { BudgetSchema } from "./budget.js";
export type { Budget } from "./budget.js";

export { CategorySchema } from "./category.js";
export type { Category } from "./category.js";

export { RevisionSchema } from "./revision.js";
export type { Revision } from "./revision.js";

export { PrincipalSchema } from "./principal.js";
export type { Principal } from "./principal.js";

export { ConfigurationSchema, RootSchema } from "./configuration.js";
export type { Configuration, Root } from "./configuration.js";
