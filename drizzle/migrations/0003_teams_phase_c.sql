ALTER TABLE "teams" ALTER COLUMN "team_number" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "teams_tournament_number_unique" ON "teams" USING btree ("tournament_id","team_number");
