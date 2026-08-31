ALTER TABLE "teams" ADD COLUMN "finishing_placement" integer;--> statement-breakpoint
ALTER TABLE "tournaments" ADD COLUMN "results_published" boolean DEFAULT false NOT NULL;