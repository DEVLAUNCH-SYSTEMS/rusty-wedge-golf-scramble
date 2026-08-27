ALTER TABLE "teams" ADD COLUMN "team_number" integer;--> statement-breakpoint
ALTER TABLE "tournaments" ADD COLUMN "teams_published" boolean DEFAULT false NOT NULL;--> statement-breakpoint
WITH parsed AS (
  SELECT
    id,
    tournament_id,
    (regexp_match(name, '^Team\s*#\s*(\d+)'))[1]::integer AS parsed_number
  FROM teams
  WHERE name ~ '^Team\s*#\s*(\d+)'
),
unique_parsed AS (
  SELECT id, parsed_number
  FROM parsed p
  WHERE NOT EXISTS (
    SELECT 1
    FROM parsed p2
    WHERE p2.tournament_id = p.tournament_id
      AND p2.parsed_number = p.parsed_number
      AND p2.id <> p.id
  )
)
UPDATE teams t
SET team_number = u.parsed_number
FROM unique_parsed u
WHERE t.id = u.id;