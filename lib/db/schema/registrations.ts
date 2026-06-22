import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";


import { adminUsers } from "@/lib/db/schema/admin-users";
import {
  paymentStatusEnum,
  registrationStatusEnum,
  skillLevelEnum,
  waitlistStatusEnum,
} from "@/lib/db/schema/enums";
import { tournaments } from "@/lib/db/schema/tournaments";

import type { AnyPgColumn } from "drizzle-orm/pg-core";

export const waitlistEntries = pgTable(
  "waitlist_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    skillLevel: skillLevelEnum("skill_level").notNull(),
    preferredPlayers: text("preferred_players"),
    notes: text("notes"),
    status: waitlistStatusEnum("status").notNull().default("active"),
    promotedRegistrationId: uuid("promoted_registration_id").references(
      (): AnyPgColumn => registrations.id,
    ),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("waitlist_entries_tournament_status_idx").on(
      table.tournamentId,
      table.status,
    ),
  ],
);

export const registrations = pgTable(
  "registrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tournamentId: uuid("tournament_id")
      .notNull()
      .references(() => tournaments.id),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    skillLevel: skillLevelEnum("skill_level").notNull(),
    notes: text("notes"),
    preferredPlayers: text("preferred_players"),
    registrationStatus: registrationStatusEnum("registration_status")
      .notNull()
      .default("pending_review"),
    paymentStatus: paymentStatusEnum("payment_status")
      .notNull()
      .default("not_submitted"),
    paymentProofPath: text("payment_proof_path"),
    paymentProofContentType: text("payment_proof_content_type"),
    paymentSubmittedAt: timestamp("payment_submitted_at", { withTimezone: true }),
    paymentReviewNotes: text("payment_review_notes"),
    adminNotes: text("admin_notes"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    verifiedByAdminId: uuid("verified_by_admin_id").references(() => adminUsers.id),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    sourceWaitlistEntryId: uuid("source_waitlist_entry_id").references(
      () => waitlistEntries.id,
    ),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("registrations_tournament_status_created_idx").on(
      table.tournamentId,
      table.registrationStatus,
      table.createdAt,
    ),
    index("registrations_tournament_payment_status_idx").on(
      table.tournamentId,
      table.paymentStatus,
    ),
  ],
);
