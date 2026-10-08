import { readdir, stat, readFile } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";

// Explicit submission inventory. Inputs, VCS metadata, dependencies and scratch are never walked.
const roots = [
  "src",
  "public",
  "scripts",
  "artifacts",
  "dist",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "vite.config.js",
  "index.html",
  "README.md",
  "DESIGN.md",
  "THIRD_PARTY_NOTICES.md",
];
const limit = 8388608;
const files = [];
async function walk(file) {
  const info = await stat(file);
  if (info.isDirectory()) {
    assert.ok(
      !["node_modules", ".cache", ".vite"].includes(path.basename(file)),
      `Generated dependency/cache directory: ${file}`,
    );
    for (const child of await readdir(file)) await walk(path.join(file, child));
  } else {
    assert.ok(
      !/\.(tgz|map)$/.test(file),
      `Unnecessary archive or source map: ${file}`,
    );
    files.push({ file, bytes: info.size });
  }
}
for (const root of roots) await walk(root);
const html = await readFile("dist/index.html", "utf8");
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const url = match[1];
  if (/^https:/.test(url)) continue;
  assert.ok(url.startsWith("./"), `Nonrelative export URL: ${url}`);
  await stat(path.join("dist", url));
}
const bytes = files.reduce((total, item) => total + item.bytes, 0);
assert.ok(bytes < limit, `Submission ${bytes} exceeds ${limit} bytes`);
console.log(
  JSON.stringify(
    {
      files: files.length,
      bytes,
      limit,
      remaining: limit - bytes,
      distBytes: files
        .filter((item) => item.file.startsWith("dist/"))
        .reduce((total, item) => total + item.bytes, 0),
    },
    null,
    2,
  ),
);
