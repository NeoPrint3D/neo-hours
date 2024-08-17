import {
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { createId } from "../utils";
import { generateRandomString, alphabet } from "oslo/crypto";
import {
  OrganizationAdditionalInfo,
  OrganizationMemberAdditionalInfo,
  ContactVerificationInfo,
} from "../types";

export const organizationsTable = sqliteTable(
  "organizations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId("org")),
    name: text("name").notNull(),
    description: text("description"),
    slug: text("slug").notNull().unique(),
    joinCode: text("join_code")
      .unique()
      .$defaultFn(() => generateRandomString(6, alphabet("A-Z", "0-9"))),
    createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at").$onUpdateFn(() => new Date().toISOString()),
    isPublic: integer("is_public", { mode: "boolean" }).default(true),
    additionalInfo: text("additional_info", { mode: "json" })
      .notNull()
      .$type<OrganizationAdditionalInfo>()
      .default({
        type: "consistent",
        details: {},
      }),
    requireMembershipApproval: integer("require_membership_approval", {
      mode: "boolean",
    }).default(false),
  },
  (table) => ({
    slugIndex: index("org_slug_index").on(table.slug),
  })
);

export const organizationMembersTable = sqliteTable(
  "organization_members",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId("orgm")),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizationsTable.id, { onDelete: "cascade" }),
    createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at").$onUpdateFn(() => new Date().toISOString()),
    displayName: text("display_name").notNull(),
    role: text("role", { enum: ["owner", "admin", "member"] }).notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    status: text("status", {
      enum: ["active", "pending", "rejected", "inactive"],
    }).default("pending"),
    additionalInfo: text("additional_info", {
      mode: "json",
    }).$type<OrganizationMemberAdditionalInfo>(),
  },
  (table) => ({
    memberUserIdIndex: index("orgm_member_user_id_index").on(table.userId),
    organizationIdIndex: index("orgm_member_organization_id_index").on(
      table.organizationId
    ),
  })
);

export const organizationPeriodsTable = sqliteTable(
  "organization_periods",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId("orgp")),
    name: text("name").notNull(),
    createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at").$onUpdateFn(() => new Date().toISOString()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizationsTable.id, { onDelete: "cascade" }),
    hourRequirement: integer("hour_requirement").notNull(),
    startDate: text("start_date").notNull(), // Changed to text for ISO 8601 format
    endDate: text("end_date").notNull(), // Changed to text for ISO 8601 format
    additionalInfo: text("additional_info", { mode: "json" }),
  },
  (table) => ({
    organizationIdIndex: index("orgp_organization_id_index").on(
      table.organizationId
    ),
  })
);

export const activitiesTable = sqliteTable(
  "activities",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId("act")),
    createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at").$onUpdateFn(() => new Date().toISOString()),
    name: text("name").notNull(),
    description: text("description"),
    scheduledStartDatetime: text("scheduled_start_datetime")
      .notNull()
      .$type<"TBD" | string>(),
    scheduledEndDatetime: text("scheduled_end_datetime"),
    hours: integer("hours").notNull(),
    location: text("location"),
    organizationPeriodId: text("organization_period_id")
      .notNull()
      .references(() => organizationPeriodsTable.id),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizationsTable.id, { onDelete: "cascade" }),
    contactVerificationInfo: text("contact_verification_info", { mode: "json" })
      .$type<ContactVerificationInfo>()
      .notNull(),
    isPublished: integer("is_published", { mode: "boolean" }).default(false),
    lastReminderSentAt: text("last_reminder_sent_at"),
  },
  (table) => ({
    scheduledDateIndex: index("act_scheduled_date_index").on(
      table.scheduledStartDatetime
    ),
    organizationPeriodIdIndex: index("act_organization_period_id_index").on(
      table.organizationPeriodId
    ),
    organizationIdIndex: index("act_organization_id_index").on(
      table.organizationId
    ),
  })
);

export const activityAttendancesTable = sqliteTable(
  "activity_attendances",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId("acta")),
    activityId: text("activity_id")
      .notNull()
      .references(() => activitiesTable.id, { onDelete: "cascade" }),
    organizationMemberId: text("organization_member_id")
      .notNull()
      .references(() => organizationMembersTable.id, { onDelete: "cascade" }),
    status: text("status", {
      enum: ["pending", "approved", "rejected"],
    }).default("pending"),
    hours: real("hours").notNull(),
    createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at").$onUpdateFn(() => new Date().toISOString()),
  },
  (table) => ({
    activityIdIndex: index("acta_activity_id_index").on(table.activityId),
    organizationMemberIdIndex: index("acta_organization_member_id_index").on(
      table.organizationMemberId
    ),
  })
);
export const usersTable = sqliteTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId("usr")),
    displayName: text("display_name"),
    email: text("email").notNull().unique(),
    createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
    verifiedAt: text("verified_at"),
    finishedOnboarding: integer("finished_onboarding", {
      mode: "boolean",
    }).default(true), // Might change to false if future onboarding steps are added
  },
  (table) => ({
    emailIndex: index("usr_email_index").on(table.email),
  })
);

export const sessionsTable = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at").notNull(),
  },
  (table) => ({
    userIdIndex: index("ses_user_id_index").on(table.userId),
  })
);

export const verificationTokensTable = sqliteTable(
  "verification_tokens",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId("vft")),
    email: text("email").notNull(),
    token: text("token").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at").notNull(),
  },
  (table) => ({
    tokenIndex: index("vft_token_index").on(table.token),
    userIdIndex: index("vft_user_id_index").on(table.userId),
  })
);

// export const accountsTable = sqliteTable(
//   "accounts",
//   {
//     userId: text("user_id")
//       .notNull()
//       .references(() => usersTable.id, { onDelete: "cascade" }),
//     type: text("type", {
//       enum: ["email", "google"],
//     }).notNull(),
//     provider: text("provider").notNull(),
//     providerAccountId: text("provider_account_id").notNull(),
//     refreshToken: text("refresh_token"),
//     accessToken: text("access_token"),
//     expiresAt: integer("expires_at"),
//     tokenType: text("token_type"),
//     scope: text("scope"),
//     idToken: text("id_token"),
//     sessionState: text("session_state"),
//   },
//   (table) => ({
//     providerAccountIdIndex: index("acc_provider_account_id_index").on(
//       table.providerAccountId
//     ),
//     userIdIndex: index("acc_user_id_index").on(table.userId),
//   })
// );
