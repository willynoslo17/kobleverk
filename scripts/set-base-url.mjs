#!/usr/bin/env node
/**
 * Manual helper (not a build step).
 * Usage: node scripts/set-base-url.mjs https://kobleverk.no
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const configPath = join(root, "site.config.json");
const config = JSON.parse(readFileSync(configPath, "utf8"));
const oldBase = String(config.BASE_URL || "").replace(/\/$/, "");
const next = process.argv[2];

if (!next || !/^https?:\/\//i.test(next)) {
  console.error("Usage: node scripts/set-base-url.mjs https://example.com");
  process.exit(1);
}

const newBase = next.replace(/\/$/, "");
if (oldBase === newBase) {
  console.log("BASE_URL unchanged:", newBase);
  process.exit(0);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === "functions") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const targets = walk(root).filter((p) => {
  const ext = extname(p);
  const base = p.split("/").pop();
  return (
    ext === ".html" ||
    base === "sitemap.xml" ||
    base === "robots.txt" ||
    base === "site.config.json"
  );
});

let changed = 0;
for (const file of targets) {
  const before = readFileSync(file, "utf8");
  if (!before.includes(oldBase)) continue;
  const after = before.split(oldBase).join(newBase);
  if (after !== before) {
    writeFileSync(file, after);
    changed += 1;
    console.log("updated", file.replace(root + "/", ""));
  }
}

config.BASE_URL = newBase;
writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
console.log(`BASE_URL: ${oldBase} → ${newBase} (${changed} files)`);
