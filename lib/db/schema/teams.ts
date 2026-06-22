import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { adminUsers } from "@/lib/db/schema/admin-users";
import { registrations } from "@/lib/db/schema/registrations";
import { tournaments } from "@/lib/db/schema/tournaments";

export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  tournamentId: uuid("tournament_id")
    .notNull()
    .references(() => tournaments.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teamMembers = pgTable(
  "team_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    registrationId: uuid("registration_id")
      .notNull()
      .references(() => registrations.id),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
    assignedByAdminId: uuid("assigned_by_admin_id")
      .notNull()
      .references(() => adminUsers.id),
  },
  (table) => [unique("team_members_registration_id_unique").on(table.registrationId)],
);
