import { integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { adminUsers } from "@/lib/db/schema/admin-users";
import { registrations } from "@/lib/db/schema/registrations";
import { tournaments } from "@/lib/db/schema/tournaments";

export const teams = pgTable(
  "teams",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id),
    name: text("name").notNull(),
    teamNumber: integer("team_number").notNull(),
    finishingPlacement: integer("finishing_placement"),
    scoreRelativeToPar: integer("score_relative_to_par"),
    scoreTotalStrokes: integer("score_total_strokes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("teams_tournament_number_unique").on(table.tournamentId, table.teamNumber)],
);

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
