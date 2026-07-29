import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { adminUsers } from "@/lib/db/schema/admin-users";
import { tournamentLifecycleStatusEnum } from "@/lib/db/schema/enums";

export const tournaments = pgTable("tournaments", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  year: integer("year").notNull(),
  eventDate: date("event_date").notNull(),
  teeTime: time("tee_time"),
  locationName: text("location_name").notNull(),
  entryFeeCents: integer("entry_fee_cents").notNull().default(8500),
  confirmedCapacityLimit: integer("confirmed_capacity_limit").notNull().default(68),
  venmoHandle: text("venmo_handle").notNull(),
  registrationEnabled: boolean("registration_enabled").notNull().default(true),
  isActive: boolean("is_active").notNull().default(false),
  lifecycleStatus: tournamentLifecycleStatusEnum("lifecycle_status")
    .notNull()
    .default("draft"),
  registrationOpensAt: timestamp("registration_opens_at", { withTimezone: true }),
  registrationClosesAt: timestamp("registration_closes_at", {
    withTimezone: true,
  }),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  archivedByAdminId: uuid("archived_by_admin_id").references(() => adminUsers.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
