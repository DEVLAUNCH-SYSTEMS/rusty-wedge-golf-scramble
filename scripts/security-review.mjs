import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const serviceRoots = ["lib/actions", "lib/services", "app/api/admin"];

const structuralChecks = [
  {
    id: "security-headers-configured",
    file: "lib/security/http-headers.ts",
    patterns: [
      /source:\s*"\/admin\/:path\*"/,
      /source:\s*"\/api\/admin\/payment-proofs\/:path\*"/,
      /Cache-Control/,
      /noindex, nofollow/,
    ],
    message: "Admin and proof routes must define no-store and noindex headers.",
  },
  {
    id: "registration-rate-limit",
    file: "lib/actions/registration-submit-flow.ts",
    patterns: [/checkRateLimit\(\s*"registration_submit"/],
    message: "Registration submit must call checkRateLimit.",
  },
  {
    id: "waitlist-rate-limit",
    file: "lib/actions/submit-waitlist.ts",
    patterns: [/checkRateLimit\(\s*"waitlist_submit"/],
    message: "Waitlist submit must call checkRateLimit.",
  },
  {
    id: "csv-export-auth",
    file: "lib/services/admin-csv-export.ts",
    patterns: [/requireAdminSession\(\)/],
    message: "CSV export must require admin session.",
  },
  {
    id: "csv-formula-escape",
    file: "lib/services/csv-export.ts",
    patterns: [/formatCsvRow/],
    message: "CSV export rows must use formatCsvRow for formula injection escape.",
  },
  {
    id: "proof-viewer-auth",
    file: "lib/services/payment-proof-viewer.ts",
    patterns: [/requireAdminSession\(\)/, /assertTournamentScope/],
    message: "Payment proof viewer must require admin session and tournament scope.",
  },
];

const forbiddenLogPatterns = [
  {
    id: "no-email-in-logs",
    pattern: /console\.(log|error|warn|info|debug)\([^)]*\.email\b/,
    message: "Do not log registration email fields.",
  },
  {
    id: "no-phone-in-logs",
    pattern: /console\.(log|error|warn|info|debug)\([^)]*\.phone\b/,
    message: "Do not log registration phone fields.",
  },
  {
    id: "no-formdata-email-in-logs",
    pattern: /console\.(log|error|warn|info|debug)\([^)]*formData\.get\(\s*["']email["']\)/,
    message: "Do not log raw form email values.",
  },
];

function collectSourceFiles(dirPath) {
  const files = [];

  if (!existsSync(dirPath)) {
    return files;
  }

  for (const entry of readdirSync(dirPath)) {
    const fullPath = path.join(dirPath, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") {
        continue;
      }

      files.push(...collectSourceFiles(fullPath));
      continue;
    }

    if (/\.(tsx?|jsx?)$/.test(entry)) {
      files.push(fullPath);
    }
  }

  return files;
}

function runStructuralChecks() {
  const violations = [];

  for (const check of structuralChecks) {
    const fullPath = path.join(rootDir, check.file);

    if (!existsSync(fullPath)) {
      violations.push(`${check.file}: missing required file (${check.id})`);
      continue;
    }

    const content = readFileSync(fullPath, "utf8");

    for (const pattern of check.patterns) {
      if (!pattern.test(content)) {
        violations.push(`${check.file}: ${check.message} (${check.id})`);
        break;
      }
    }
  }

  return violations;
}

function scanLogging() {
  const violations = [];

  for (const root of serviceRoots) {
    for (const filePath of collectSourceFiles(path.join(rootDir, root))) {
      const relativePath = path.relative(rootDir, filePath);
      const content = readFileSync(filePath, "utf8");

      for (const rule of forbiddenLogPatterns) {
        if (rule.pattern.test(content)) {
          violations.push(`${relativePath}: ${rule.message} (${rule.id})`);
        }
      }
    }
  }

  return violations;
}

function reportViolations(title, violations) {
  if (violations.length === 0) {
    return;
  }

  console.error(`\n${title}`);
  for (const violation of violations) {
    console.error(`  - ${violation}`);
  }
}

const violations = [...runStructuralChecks(), ...scanLogging()];

if (violations.length > 0) {
  reportViolations("Security review failed:", violations);
  process.exit(1);
}

console.log("Security review passed.");
