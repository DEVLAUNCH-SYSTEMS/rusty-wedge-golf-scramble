import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const checklists = [
  {
    title: "Pre-launch checklist",
    file: "docs/qa/prelaunch-checklist.md",
  },
  {
    title: "Post-event checklist",
    file: "docs/qa/post-event-checklist.md",
  },
];

console.log("Rusty Wedge QA checklists\n");

for (const checklist of checklists) {
  const fullPath = path.join(rootDir, checklist.file);
  console.log(`=== ${checklist.title} ===`);
  console.log(fullPath);
  console.log("");
  console.log(readFileSync(fullPath, "utf8"));
  console.log("");
}

console.log("Complete manual items above before production launch and after the event.");
