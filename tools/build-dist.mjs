// Build a deployable dist/ from the static site (vite build would drop non-module assets).
import { cpSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const items = [
  "index.html", "privacy.html", "robots.txt", "sitemap.xml",
  "css", "js", "vendor", "frames",
];
for (const item of items) {
  cpSync(join(root, item), join(dist, item), { recursive: true });
}
// assets: only what the site uses at runtime (source clips stay local)
mkdirSync(join(dist, "assets"), { recursive: true });
for (const f of ["poster.jpg", "trailer.mp4"]) {
  cpSync(join(root, "assets", f), join(dist, "assets", f));
}
// GitHub Pages: skip Jekyll processing
writeFileSync(join(dist, ".nojekyll"), "");

console.log("dist/ ready:", items.join(", "));
