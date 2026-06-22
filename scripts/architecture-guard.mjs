import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const publicSourceRoots = ["app", "components"];

const forbiddenPublicPatterns = [
  {
    id: "no-db-import-in-public-ui",
    pattern: /@\/lib\/db/,
    message: "Public UI must not import @/lib/db — use server pages and services.",
  },
  {
    id: "no-confirmed-count-in-public-ui",
    pattern: /getConfirmedCount/,
    message: "Public UI must not reference getConfirmedCount().",
  },
  {
    id: "no-capacity-limit-field-in-public-ui",
    pattern: /confirmedCapacityLimit|confirmed_capacity_limit/,
    message: "Public UI must not reference confirmed capacity limit fields.",
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

function isPublicUiFile(relativePath) {
  if (relativePath.startsWith("app/admin")) {
    return false;
  }

  if (relativePath.startsWith("components/")) {
    return true;
  }

  if (relativePath === "app/page.tsx") {
    return true;
  }

  if (relativePath.startsWith("app/") && relativePath.endsWith("/page.tsx")) {
    return !relativePath.includes("/admin/");
  }

  return false;
}

function scanPublicUi() {
  const violations = [];

  for (const root of publicSourceRoots) {
    for (const filePath of collectSourceFiles(path.join(rootDir, root))) {
      const relativePath = path.relative(rootDir, filePath);

      if (!isPublicUiFile(relativePath)) {
        continue;
      }

      const content = readFileSync(filePath, "utf8");

      for (const rule of forbiddenPublicPatterns) {
        if (rule.pattern.test(content)) {
          violations.push(`${relativePath}: ${rule.message} (${rule.id})`);
        }
      }
    }
  }

  return violations;
}

function scanAdminRouteGuards() {
  const adminAppDir = path.join(rootDir, "app/admin");

  if (!existsSync(adminAppDir)) {
    return [];
  }

  const violations = [];
  const adminFiles = collectSourceFiles(adminAppDir).filter((filePath) =>
    filePath.endsWith(".ts") || filePath.endsWith(".tsx"),
  );

  for (const filePath of adminFiles) {
    const relativePath = path.relative(rootDir, filePath);
    const content = readFileSync(filePath, "utf8");
    const isServerEntry =
      relativePath.endsWith("/page.tsx") ||
      relativePath.includes("/route.ts") ||
      relativePath.includes("/actions.ts");

    if (!isServerEntry) {
      continue;
    }

    if (!content.includes("requireAdminSession")) {
      violations.push(
        `${relativePath}: admin server entry must call requireAdminSession().`,
      );
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

const violations = [...scanPublicUi(), ...scanAdminRouteGuards()];

if (violations.length > 0) {
  reportViolations("Architecture guard failed:", violations);
  process.exit(1);
}

console.log("Architecture guard passed.");
