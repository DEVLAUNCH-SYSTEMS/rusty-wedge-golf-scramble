CREATE TYPE "public"."results_announcement_status" AS ENUM('not_sent', 'sending', 'sent', 'partial', 'ambiguous');--> statement-breakpoint
ALTER TABLE "tournaments" ADD COLUMN "results_announcement_status" "results_announcement_status" DEFAULT 'not_sent' NOT NULL;--> statement-breakpoint
ALTER TABLE "tournaments" ADD COLUMN "results_announcement_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tournaments" ADD COLUMN "results_announcement_sent_by_admin_id" uuid;--> statement-breakpoint
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_results_announcement_sent_by_admin_id_admin_users_id_fk" FOREIGN KEY ("results_announcement_sent_by_admin_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;