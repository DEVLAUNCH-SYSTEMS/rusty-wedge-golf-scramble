import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "package.json"),
);
const dotenv = require("dotenv");
const { Client } = require("pg");

dotenv.config({ path: ".env.local" });
dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const host = new URL(url).hostname;
if (!host.includes("steep-block")) {
  console.error("Refusing to run: expected CI/dev steep-block host, got", host);
  process.exit(1);
}

const TEST_EMAIL = `email ~* '^[a-z0-9._+-]+-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}@example\\.com$'`;
const TEST_ADMIN = `neon_auth_user_id LIKE 'test-admin-%' OR email ~* '^[a-z0-9._+-]+-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}@example\\.com$'`;

const client = new Client({ connectionString: url });
await client.connect();

async function count(label, sql) {
  const { rows } = await client.query(sql);
  console.log(`${label}: ${rows[0].n}`);
  return Number(rows[0].n);
}

console.log("Host:", host);
console.log("--- before ---");
await count(
  "test registrations",
  `SELECT count(*)::int AS n FROM registrations WHERE ${TEST_EMAIL}`,
);
await count(
  "test waitlist",
  `SELECT count(*)::int AS n FROM waitlist_entries WHERE ${TEST_EMAIL}`,
);
await count(
  "test admins",
  `SELECT count(*)::int AS n FROM admin_users WHERE ${TEST_ADMIN}`,
);
await count(
  "all confirmed",
  `SELECT count(*)::int AS n FROM registrations WHERE registration_status = 'confirmed'`,
);
await count(
  "all pending",
  `SELECT count(*)::int AS n FROM registrations WHERE registration_status = 'pending_review'`,
);
await count(
  "all waitlist active",
  `SELECT count(*)::int AS n FROM waitlist_entries WHERE status = 'active'`,
);

await client.query("BEGIN");
try {
  await client.query(`
    UPDATE waitlist_entries w
    SET promoted_registration_id = NULL
    WHERE w.email ~* '^[a-z0-9._+-]+-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}@example\\.com$'
       OR promoted_registration_id IN (
         SELECT id FROM registrations r
         WHERE r.email ~* '^[a-z0-9._+-]+-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}@example\\.com$'
       )
  `);

  await client.query(`
    UPDATE registrations r
    SET source_waitlist_entry_id = NULL
    WHERE r.email ~* '^[a-z0-9._+-]+-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}@example\\.com$'
       OR source_waitlist_entry_id IN (
         SELECT id FROM waitlist_entries w
         WHERE w.email ~* '^[a-z0-9._+-]+-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}@example\\.com$'
       )
  `);

  await client.query(`
    UPDATE registrations
    SET verified_by_admin_id = NULL,
        created_by_admin_id = NULL
    WHERE ${TEST_EMAIL}
       OR verified_by_admin_id IN (SELECT id FROM admin_users WHERE ${TEST_ADMIN})
       OR created_by_admin_id IN (SELECT id FROM admin_users WHERE ${TEST_ADMIN})
  `);

  await client.query(`
    UPDATE waitlist_entries
    SET created_by_admin_id = NULL
    WHERE ${TEST_EMAIL}
       OR created_by_admin_id IN (SELECT id FROM admin_users WHERE ${TEST_ADMIN})
  `);

  await client.query(`
    UPDATE tournaments
    SET archived_by_admin_id = NULL
    WHERE archived_by_admin_id IN (SELECT id FROM admin_users WHERE ${TEST_ADMIN})
  `);

  const teamMembers = await client.query(`
    DELETE FROM team_members
    WHERE registration_id IN (SELECT id FROM registrations WHERE ${TEST_EMAIL})
       OR assigned_by_admin_id IN (SELECT id FROM admin_users WHERE ${TEST_ADMIN})
    RETURNING id
  `);

  const events = await client.query(`
    DELETE FROM registration_events
    WHERE registration_id IN (SELECT id FROM registrations WHERE ${TEST_EMAIL})
       OR waitlist_entry_id IN (SELECT id FROM waitlist_entries WHERE ${TEST_EMAIL})
       OR admin_user_id IN (SELECT id FROM admin_users WHERE ${TEST_ADMIN})
    RETURNING id
  `);

  const waitlist = await client.query(`
    DELETE FROM waitlist_entries WHERE ${TEST_EMAIL} RETURNING id
  `);

  const regs = await client.query(`
    DELETE FROM registrations WHERE ${TEST_EMAIL} RETURNING id, registration_status
  `);

  const emptyTeams = await client.query(`
    DELETE FROM teams t
    WHERE NOT EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = t.id)
      AND (t.name ILIKE 'H-edit%' OR t.name ILIKE '%integration%' OR t.name ILIKE 'Test%')
    RETURNING id, name
  `);

  const admins = await client.query(`
    DELETE FROM admin_users WHERE ${TEST_ADMIN} RETURNING id, email
  `);

  await client.query("COMMIT");

  console.log("--- deleted ---");
  console.log("team_members:", teamMembers.rowCount);
  console.log("registration_events:", events.rowCount);
  console.log("waitlist_entries:", waitlist.rowCount);
  console.log("registrations:", regs.rowCount);
  console.log(
    "  confirmed:",
    regs.rows.filter((r) => r.registration_status === "confirmed").length,
  );
  console.log(
    "  pending_review:",
    regs.rows.filter((r) => r.registration_status === "pending_review").length,
  );
  console.log(
    "  other:",
    regs.rows.filter(
      (r) =>
        r.registration_status !== "confirmed" &&
        r.registration_status !== "pending_review",
    ).length,
  );
  console.log("empty test teams:", emptyTeams.rowCount);
  console.log("admin_users:", admins.rowCount);

  console.log("--- after ---");
  await count(
    "test registrations left",
    `SELECT count(*)::int AS n FROM registrations WHERE ${TEST_EMAIL}`,
  );
  await count(
    "test waitlist left",
    `SELECT count(*)::int AS n FROM waitlist_entries WHERE ${TEST_EMAIL}`,
  );
  await count(
    "test admins left",
    `SELECT count(*)::int AS n FROM admin_users WHERE ${TEST_ADMIN}`,
  );
  await count(
    "all confirmed",
    `SELECT count(*)::int AS n FROM registrations WHERE registration_status = 'confirmed'`,
  );
  await count(
    "all pending",
    `SELECT count(*)::int AS n FROM registrations WHERE registration_status = 'pending_review'`,
  );
  await count(
    "all waitlist active",
    `SELECT count(*)::int AS n FROM waitlist_entries WHERE status = 'active'`,
  );
  await count(
    "capacity limit",
    `SELECT confirmed_capacity_limit::int AS n FROM tournaments WHERE is_active = true LIMIT 1`,
  );
} catch (error) {
  await client.query("ROLLBACK");
  console.error("Cleanup failed, rolled back:", error);
  process.exitCode = 1;
} finally {
  await client.end();
}
