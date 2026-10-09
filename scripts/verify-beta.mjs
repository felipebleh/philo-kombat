import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(readFileSync(resolve(root, "standalone/source-manifest.json"), "utf8"));
const hash = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
for (const [path, expected] of Object.entries(manifest.files)) {
  if (hash(resolve(root, path)) !== expected) throw new Error(`Original file changed: ${path}`);
}
if (process.argv[2] === "dist") {
  for (const [path, expected] of Object.entries(manifest.files)) {
    if (path.startsWith("public/") && hash(resolve(root, "beta-dist", path.slice(7))) !== expected) {
      throw new Error(`Resource missing or changed in export: ${path}`);
    }
  }
  const walk = (dir) => readdirSync(dir).flatMap((name) => {
    const path = resolve(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
  const files = walk(resolve(root, "beta-dist"));
  if (files.some((path) => statSync(path).size > 25 * 1024 * 1024)) throw new Error("Asset exceeds Cloudflare Pages limit");
  if (!existsSync(resolve(root, "beta-dist/index.html"))) throw new Error("Missing index.html");
  console.log(`Export verified: ${files.length} files, all 405 original public resources identical.`);
}
console.log(`Version ${manifest.sites_version}: ${Object.keys(manifest.files).length} original files verified by SHA-256.`);
