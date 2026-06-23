import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ballLogo = path.join(rootDir, "assets/ball_only.png");
const trophySource = path.join(rootDir, "assets/trophy-source.png");
const outputDir = path.join(rootDir, "public/images");

function copy(input, output) {
  execFileSync("cp", [input, output], { stdio: "ignore" });
}

function resize(input, output, size) {
  execFileSync("sips", ["-z", String(size), String(size), input, "--out", output], {
    stdio: "ignore",
  });
}

async function main() {
  if (!existsSync(ballLogo)) {
    throw new Error(`Missing logo source: ${ballLogo}`);
  }

  if (!existsSync(trophySource)) {
    throw new Error(`Missing trophy source: ${trophySource}`);
  }

  await mkdir(outputDir, { recursive: true });

  const heroLogo = path.join(outputDir, "logo-hero.png");

  copy(ballLogo, heroLogo);
  copy(trophySource, path.join(outputDir, "trophy.png"));
  resize(heroLogo, path.join(outputDir, "logo-mark.png"), 44);
  resize(heroLogo, path.join(outputDir, "golf-ball-decor.png"), 56);

  console.log("Landing assets built from assets/ball_only.png (direct copy, no crop)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
