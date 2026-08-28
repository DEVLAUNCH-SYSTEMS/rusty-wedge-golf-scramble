# Production Gate A — Target verification, Phase A, precheck

**Status:** PRECHECK COMPLETE — **operator cleanup required before Phase C**  
**Date:** 2026-08-27  
**Prerequisite:** Slice 12 OPERATOR APPROVED — [`slice-12-approval.md`](slice-12-approval.md)

**Not executed:** Phase C (`0003_teams_phase_c`), production deploy, production Gate B.

---

## Verified production database target

| Field | Value |
|-------|-------|
| Hostname | `<production-db-host>` |
| Database | `neondb` |
| Pooled | **no** (direct/unpooled endpoint) |
| Development target | **Confirmed NOT targeted** |
| Active local `DATABASE_URL` | `<development-db-host>` (unchanged) |
| Verification tooling | `npm run db:verify-target` — **valid** (prod URL via `CI_GATE_DATABASE_URL` override) |

---

## Phase A migration status

**Applied:** `drizzle/migrations/0002_teams_phase_a.sql` (**Phase A only**)

| Check | Before | After |
|-------|--------|-------|
| `teams.team_number` | absent | **nullable `integer`** |
| `tournaments.teams_published` | absent | **`boolean DEFAULT false NOT NULL`** |
| `teams_tournament_number_unique` (Phase C) | absent | **absent** (correct) |
| `drizzle.__drizzle_migrations` | `0000`, `0001` | **`0002` recorded** (`hash`: `daadce56719882b0d1491fbeed146aad72da5ad6ed3563df642e4d86531ac411`) |

**Method:** Selective Phase A SQL only — **not** `npm run db:migrate` (would have applied `0003` Phase C).

**Backfill rule honored:** Only unambiguous `Team #N` names within each tournament received `team_number`. Composite legacy names (`Team #N- Player names…`) backfilled when **unique** parsed number; duplicate parsed numbers left **NULL** for operator review.

**Tournament flag:** Active tournament `2026-rusty-wedge` → `teams_published = false` (default).

---

## Production precheck results

**Command:** `npm run db:team-number-precheck` (production URL)  
**Exit code:** **1** (expected — NULL blockers remain)

### Summary counts

| Metric | Count |
|--------|------:|
| Total teams | 18 |
| Successfully numbered | 11 |
| NULL `team_number` | **7** |
| Unparseable names | 0 |
| Parseable but NULL (ambiguous duplicates) | **7** |
| Duplicate `team_number` groups | 0 |
| Zero-member teams | 4 |
| Populated teams | 14 |
| Fixture artifact teams | 0 |

### By tournament

| Tournament | Active | Teams | Numbered | NULL | Zero-member | Populated | `teams_published` |
|------------|--------|------:|---------:|-----:|------------:|----------:|:-----------------:|
| `2026-rusty-wedge` | yes | 18 | 11 | 7 | 4 | 14 | false |

---

## Production team-number mapping (all rows)

Tournament: **2026 Rusty Wedge** (`2026-rusty-wedge`, active)

### Successfully numbered (11) — preserve

| team_number | team id | legacy `teams.name` | members | parsed #N |
|------------:|---------|---------------------|--------:|----------:|
| 2 | `4a360395-9fed-4b57-8c77-bcbdf255dc78` | Team #2-Tyler Url, Quintin Url, Chris Gingrich, Seth McGrath | 4 | 2 |
| 3 | `1b701bfd-56ef-4ea0-be57-a297c2c69585` | Team #3- Robert Bolton, Paul Bolton, Marcus Bolton, Jake Sage | 4 | 3 |
| 5 | `d6b4280f-aeac-4632-9576-f30a02e598c2` | Team #5- Phil Esteves, Jesse Ledbetter, Casey VanBuskirk, Dave Kailey | 4 | 5 |
| 6 | `7d869105-d1ea-42cc-b387-704c59c4f36e` | Team #6- Raffy Gutierrez, Chad Brown, Ethan Gurney, Jon Medaris | 4 | 6 |
| 7 | `162f597b-6e9c-469f-b0a7-c4b0378a3baf` | Team #7- Richard Thorgeirson, Dave Zwarg, Troy Crossman, Ahira Crossman | 4 | 7 |
| 8 | `9dc22834-c5c7-48bf-86f9-1b073ea16a3b` | Team #8- Barry Trout, Scott Elvedge, Malakhi Hart, Jared Hart | 4 | 8 |
| 9 | `b2194dae-bd50-443b-930e-5e878d1651ff` | Team #9- Joe Davis, Randy Eberle, Branden Parli, Mike Allen | 4 | 9 |
| 10 | `db567970-4ff2-4497-8127-c53cde6939b5` | Team #10- Todd Gillingham, Rex Neher, Greg Graham, Travis Tumlinson | 4 | 10 |
| 11 | `5816ecf5-a00f-4907-b5c3-f8ba5f2dce64` | Team #11- Mike McConnell, Anthony Hernandez, Scott Carlson, Paul Paradiso | 4 | 11 |
| 12 | `78c8436a-d30e-402c-a23a-3eccd873291e` | Team #12- Charlie Cox, Ed Davis, Levi O'Bleness, Kyle Hogan | 4 | 12 |
| 13 | `489d5a37-7ad5-4b5f-9d27-b296b1bf0801` | Team #13- Dane Fredericks, Scott Wenzel, Sean Gillie, Jeremy Reynolds | 4 | 13 |

### NULL blockers — ambiguous duplicate parsed numbers (7)

| parsed #N | team id | legacy `teams.name` | members | blocker reason |
|----------:|---------|---------------------|--------:|----------------|
| 1 | `233beac1-aa18-4e31-bf98-3cfcf48d6906` | Team #1 | 0 | 3 rows parse to **#1** |
| 1 | `c161972f-1c17-4c37-a21d-6811c75038a2` | Team #1-Mike Gilbert, Brenden Steiner, Ian Dierks, Skyler Cantrell | 0 | duplicate of populated row |
| 1 | `aff85a94-311d-4dea-87de-07267d88d9b5` | Team #1-Mike Gilbert, Brenden Steiner, Ian Dierks, Skyler Cantrell | **4** | **canonical populated team** |
| 4 | `4ea64176-c65f-45b9-9cc6-23c6564b7155` | Team #4- | 0 | 2 rows parse to **#4** |
| 4 | `ad1eca65-0721-4d0d-84c0-41ccd4f63c9d` | Team #4- Joe Holcomb, Clyde Abrahamson, Troy Haberkorn, Matt Dirstine | **4** | **canonical populated team** |
| 14 | `d91a15dc-e4f9-48ac-b553-99f1d1d6281a` | Team #14- Rusty Williams, Gene Blessen, Tom Belestra, Mark Lange | 0 | 2 rows parse to **#14** |
| 14 | `5680291e-0e9b-4085-88db-9d2a8ffd0f62` | Team #14- Rusty Williams, Gene Blessen, Tom Belestra, Mark Lange | **4** | **canonical populated team** |

**Note:** Production legacy names embed roster text after `Team #N-` or `Team #N- `. Phase A backfill correctly numbered unique composites (e.g. `#2`–`#13` above) and withheld numbering where multiple rows share the same parsed number.

---

## Likely junk / empty duplicate rows (4)

Operator should confirm no hidden registrations, then delete via admin **Delete team** (empty) or reviewed SQL:

| team id | name | members | assessment |
|---------|------|--------:|------------|
| `233beac1-aa18-4e31-bf98-3cfcf48d6906` | Team #1 | 0 | Empty stub; duplicate of #1 group |
| `c161972f-1c17-4c37-a21d-6811c75038a2` | Team #1-Mike Gilbert… | 0 | Empty duplicate of populated #1 |
| `4ea64176-c65f-45b9-9cc6-23c6564b7155` | Team #4- | 0 | Empty stub; duplicate of #4 group |
| `d91a15dc-e4f9-48ac-b553-99f1d1d6281a` | Team #14- Rusty Williams… | 0 | Empty duplicate of populated #14 |

---

## Populated rows requiring preservation (14 total)

**Already numbered (11):** teams #2, #3, #5–#13 (see table above).

**NULL but populated — assign number after duplicate cleanup (3):**

| team id | assign `team_number` | legacy name | members |
|---------|----------------------:|-------------|--------:|
| `aff85a94-311d-4dea-87de-07267d88d9b5` | **1** | Team #1-Mike Gilbert… | 4 |
| `ad1eca65-0721-4d0d-84c0-41ccd4f63c9d` | **4** | Team #4- Joe Holcomb… | 4 |
| `5680291e-0e9b-4085-88db-9d2a8ffd0f62` | **14** | Team #14- Rusty Williams… | 4 |

---

## Recommended operator cleanup sequence

1. **Review** the four zero-member rows above — confirm no registrations reference them (precheck shows 0 members; operator visual check in admin recommended).
2. **Delete empty duplicates** (4 rows) — admin Delete team or operator-approved SQL. **Do not** delete populated rows.
3. **Assign `team_number`** on the three canonical populated rows (#1, #4, #14) — either:
   - Re-run the Phase A backfill UPDATE (safe once duplicates removed), or
   - Explicit operator `UPDATE teams SET team_number = N WHERE id = '…'` with audit note.
4. **Re-run** `npm run db:team-number-precheck` on production — target exit **0**.
5. **STOP** — await separate operator approval for **production Phase C** and **Gate B**. Do not deploy application code until Gate B passes.

**Forbidden without operator review:** sequential fallback numbering, automatic duplicate renumbering, bulk delete of populated teams, `npm run db:migrate` (includes Phase C).

---

## Production Gate A readiness status

| Criterion | Status |
|-----------|--------|
| Production target verified (not dev) | **Pass** |
| Phase A schema applied | **Pass** |
| Phase C **not** applied | **Pass** |
| Precheck executed on production | **Pass** |
| `nullTeamNumber = 0` | **Fail** (7 remaining) |
| `duplicateNumberGroups = 0` | **Pass** |
| Fixture artifacts | **Pass** (0) |
| Ready for production Phase C | **No** — operator cleanup required |
| Ready for deploy | **No** |

**Gate A precheck phase:** **COMPLETE**  
**Gate A clearance for Phase C:** **BLOCKED** pending operator cleanup

---

## Operator decisions required

1. **Approve deletion** of four zero-member duplicate team rows (ids listed above).
2. **Confirm canonical team** for each conflicted number (#1, #4, #14) — populated rows identified; empty duplicates are not canonical.
3. **Approve manual `team_number` assignment** (#1, #4, #14) after duplicate removal — or approve re-running backfill SQL only.
4. **Re-run precheck** and confirm exit 0 before any Phase C discussion.
5. **Separate approval** required for: production Phase C, production Gate B, application deploy, publication to public `/teams`.

---

## Tooling reference

```bash
# Verify target (override env to prod unpooled URL — never the development host)
CI_GATE_DATABASE_URL="$PROD_UNPOOLED_URL" DATABASE_URL="$PROD_UNPOOLED_URL" npm run db:verify-target

# Read-only precheck
CI_GATE_DATABASE_URL="$PROD_UNPOOLED_URL" DATABASE_URL="$PROD_UNPOOLED_URL" npm run db:team-number-precheck
```

Dev Gate A evidence: [`gate-a-approval.md`](gate-a-approval.md) — **does not substitute** for this production record.
