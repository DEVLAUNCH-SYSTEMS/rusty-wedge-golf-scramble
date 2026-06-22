CREATE TYPE "public"."payment_status" AS ENUM('not_submitted', 'submitted', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('pending_review', 'confirmed', 'waitlisted', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."skill_level" AS ENUM('A', 'B', 'C', 'D');--> statement-breakpoint
CREATE TYPE "public"."waitlist_status" AS ENUM('active', 'promoted', 'removed');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"neon_auth_user_id" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_neon_auth_user_id_unique" UNIQUE("neon_auth_user_id")
);
--> statement-breakpoint
CREATE TABLE "registration_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" uuid NOT NULL,
	"registration_id" uuid,
	"waitlist_entry_id" uuid,
	"team_id" uuid,
	"event_type" text NOT NULL,
	"admin_user_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"skill_level" "skill_level" NOT NULL,
	"notes" text,
	"preferred_players" text,
	"registration_status" "registration_status" DEFAULT 'pending_review' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'not_submitted' NOT NULL,
	"payment_proof_path" text,
	"payment_proof_content_type" text,
	"payment_submitted_at" timestamp with time zone,
	"payment_review_notes" text,
	"admin_notes" text,
	"verified_at" timestamp with time zone,
	"verified_by_admin_id" uuid,
	"rejected_at" timestamp with time zone,
	"rejection_reason" text,
	"source_waitlist_entry_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waitlist_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"skill_level" "skill_level" NOT NULL,
	"preferred_players" text,
	"notes" text,
	"status" "waitlist_status" DEFAULT 'active' NOT NULL,
	"promoted_registration_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"registration_id" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_by_admin_id" uuid NOT NULL,
	CONSTRAINT "team_members_registration_id_unique" UNIQUE("registration_id")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournaments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"year" integer NOT NULL,
	"event_date" date NOT NULL,
	"tee_time" time,
	"location_name" text NOT NULL,
	"entry_fee_cents" integer DEFAULT 8500 NOT NULL,
	"confirmed_capacity_limit" integer DEFAULT 68 NOT NULL,
	"venmo_handle" text NOT NULL,
	"registration_enabled" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tournaments_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "registration_events" ADD CONSTRAINT "registration_events_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_events" ADD CONSTRAINT "registration_events_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_events" ADD CONSTRAINT "registration_events_waitlist_entry_id_waitlist_entries_id_fk" FOREIGN KEY ("waitlist_entry_id") REFERENCES "public"."waitlist_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_events" ADD CONSTRAINT "registration_events_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_events" ADD CONSTRAINT "registration_events_admin_user_id_admin_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_verified_by_admin_id_admin_users_id_fk" FOREIGN KEY ("verified_by_admin_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_source_waitlist_entry_id_waitlist_entries_id_fk" FOREIGN KEY ("source_waitlist_entry_id") REFERENCES "public"."waitlist_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_promoted_registration_id_registrations_id_fk" FOREIGN KEY ("promoted_registration_id") REFERENCES "public"."registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_assigned_by_admin_id_admin_users_id_fk" FOREIGN KEY ("assigned_by_admin_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "registrations_tournament_status_created_idx" ON "registrations" USING btree ("tournament_id","registration_status","created_at");--> statement-breakpoint
CREATE INDEX "registrations_tournament_payment_status_idx" ON "registrations" USING btree ("tournament_id","payment_status");--> statement-breakpoint
CREATE INDEX "waitlist_entries_tournament_status_idx" ON "waitlist_entries" USING btree ("tournament_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "registrations_active_email_unique" ON "registrations" ("tournament_id", lower("email")) WHERE "registration_status" IN ('pending_review', 'confirmed');--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_entries_active_email_unique" ON "waitlist_entries" ("tournament_id", lower("email")) WHERE "status" = 'active';