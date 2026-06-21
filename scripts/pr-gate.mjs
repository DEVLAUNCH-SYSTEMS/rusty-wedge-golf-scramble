import { execSync } from "node:child_process";

const commands = ["npm run lint", "npm run typecheck"];

try {
  for (const command of commands) {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: "inherit" });
  }

  console.log("PR gate passed.");
} catch {
  console.error("PR gate failed.");
  process.exit(1);
}
