#!/usr/bin/env node
/**
 * Scans the repo for legacy / orphaned PixelSocialSim game artifacts.
 *
 * Allowed (current) references:
 *   - src/components/artoy/PixelSocialSim.tsx        (the component)
 *   - src/components/artoy/TryItNow.tsx              (the only consumer)
 *   - src/assets/artoy/sim/{nova,mochi,hexx}-paint-bg.png
 *   - src/assets/artoy/sim/{nova,mochi,hexx}-seeker.png
 *
 * Anything else mentioning PixelSocialSim, or any leftover sim asset
 * outside the allowlist, is flagged as legacy.
 *
 * Exit codes: 0 = clean, 1 = legacy found.
 */
import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["src"];
const IGNORE_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next", ".turbo", ".vite"]);

const ALLOWED_REF_FILES = new Set([
  "src/components/artoy/PixelSocialSim.tsx",
  "src/components/artoy/TryItNow.tsx",
]);

const ALLOWED_SIM_ASSETS = new Set([
  "nova-paint-bg.png", "nova-seeker.png",
  "mochi-paint-bg.png", "mochi-seeker.png",
  "hexx-paint-bg.png", "hexx-seeker.png",
]);

const SIM_ASSET_DIR = "src/assets/artoy/sim";
const TEXT_EXT = /\.(tsx?|jsx?|mjs|cjs|md|json|css|html)$/i;

/** @param {string} dir @param {string[]} out */
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (IGNORE_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const norm = (p) => relative(ROOT, p).split(sep).join("/");

const legacyRefs = [];
const legacyAssets = [];

for (const base of SCAN_DIRS) {
  for (const file of walk(join(ROOT, base))) {
    const rel = norm(file);

    // 1. Orphan sim assets
    if (rel.startsWith(SIM_ASSET_DIR + "/")) {
      const name = rel.slice(SIM_ASSET_DIR.length + 1);
      if (!ALLOWED_SIM_ASSETS.has(name)) legacyAssets.push(rel);
      continue;
    }

    // 2. Stray PixelSocialSim mentions in source/text
    if (!TEXT_EXT.test(rel)) continue;
    if (ALLOWED_REF_FILES.has(rel)) continue;
    let body;
    try { body = readFileSync(file, "utf8"); } catch { continue; }
    if (!body.includes("PixelSocialSim")) continue;
    const lines = body.split("\n");
    lines.forEach((line, i) => {
      if (line.includes("PixelSocialSim")) {
        legacyRefs.push({ file: rel, line: i + 1, text: line.trim().slice(0, 160) });
      }
    });
  }
}

const ok = legacyRefs.length === 0 && legacyAssets.length === 0;

if (ok) {
  console.log("✓ No legacy PixelSocialSim references or orphan sim assets found.");
  process.exit(0);
}

console.warn("⚠ Legacy PixelSocialSim artifacts detected:\n");
if (legacyRefs.length) {
  console.warn("  Stray references (outside allowlist):");
  for (const r of legacyRefs) console.warn(`   • ${r.file}:${r.line}  ${r.text}`);
  console.warn("");
}
if (legacyAssets.length) {
  console.warn("  Orphan sim assets (not in allowlist):");
  for (const a of legacyAssets) console.warn(`   • ${a}`);
  console.warn("");
}
console.warn("Remove the files above or update scripts/check-legacy-pixelsim.mjs if they are intentional.");
process.exit(1);
