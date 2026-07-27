CREATE TYPE "public"."created_source" AS ENUM('public', 'admin', 'waitlist_promote');--> statement-breakpoint
CREATE TYPE "public"."tournament_lifecycle_status" AS ENUM('draft', 'registration_open', 'registration_closed', 'completed', 'archived');--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "created_source" "created_source" DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "created_by_admin_id" uuid;--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD COLUMN "created_source" "created_source" DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD COLUMN "created_by_admin_id" uuid;--> statement-breakpoint
ALTER TABLE "tournaments" ADD COLUMN "lifecycle_status" "tournament_lifecycle_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "tournaments" ADD COLUMN "registration_opens_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tournaments" ADD COLUMN "registration_closes_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tournaments" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tournaments" ADD COLUMN "archived_by_admin_id" uuid;--> statement-breakpoint
UPDATE "tournaments"
SET "lifecycle_status" = CASE
	WHEN "is_active" = true AND "registration_enabled" = true THEN 'registration_open'::"tournament_lifecycle_status"
	WHEN "is_active" = true AND "registration_enabled" = false THEN 'registration_closed'::"tournament_lifecycle_status"
	ELSE 'archived'::"tournament_lifecycle_status"
END;--> statement-breakpoint
UPDATE "registrations" SET "created_source" = 'public';--> statement-breakpoint
UPDATE "waitlist_entries" SET "created_source" = 'public';--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_created_by_admin_id_admin_users_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_created_by_admin_id_admin_users_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_archived_by_admin_id_admin_users_id_fk" FOREIGN KEY ("archived_by_admin_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "tournaments_single_active_unique" ON "tournaments" ((true)) WHERE "is_active" = true;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "registrations_active_email_unique" ON "registrations" ("tournament_id", lower("email")) WHERE "registration_status" IN ('pending_review', 'confirmed');--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "waitlist_entries_active_email_unique" ON "waitlist_entries" ("tournament_id", lower("email")) WHERE "status" = 'active';
