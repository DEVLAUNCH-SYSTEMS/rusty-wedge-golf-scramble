import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { adminUsers } from "@/lib/db/schema/admin-users";
import {
  registrations,
  waitlistEntries,
} from "@/lib/db/schema/registrations";
import { teams } from "@/lib/db/schema/teams";
import { tournaments } from "@/lib/db/schema/tournaments";

export const registrationEvents = pgTable("registration_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  tournamentId: uuid("tournament_id")
    .notNull()
    .references(() => tournaments.id),
  registrationId: uuid("registration_id").references(() => registrations.id),
  waitlistEntryId: uuid("waitlist_entry_id").references(() => waitlistEntries.id),
  teamId: uuid("team_id").references(() => teams.id),
  eventType: text("event_type").notNull(),
  adminUserId: uuid("admin_user_id").references(() => adminUsers.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
