#!/usr/bin/env node
/**
 * Simple static-site build for Armila Design Studio.
 *
 * What it does:
 *   1. Reads every *.src.html page in /pages
 *   2. Replaces <!-- @include navbar --> and <!-- @include footer -->
 *      with the shared partials in /partials
 *   3. Writes the final, ready-to-deploy HTML files to the project root
 *
 * Run with: npm run build
 * (Tailwind CSS compilation is a separate step, see package.json)
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PAGES_DIR = path.join(ROOT, "pages");
const PARTIALS_DIR = path.join(ROOT, "partials");

const navbar = fs.readFileSync(path.join(PARTIALS_DIR, "navbar.html"), "utf8");
const footer = fs.readFileSync(path.join(PARTIALS_DIR, "footer.html"), "utf8");

if (!fs.existsSync(PAGES_DIR)) {
  console.error(`Missing pages directory: ${PAGES_DIR}`);
  process.exit(1);
}

const sourceFiles = fs
  .readdirSync(PAGES_DIR)
  .filter((f) => f.endsWith(".src.html"));

if (!sourceFiles.length) {
  console.error("No .src.html files found in /pages");
  process.exit(1);
}

for (const file of sourceFiles) {
  const srcPath = path.join(PAGES_DIR, file);
  let html = fs.readFileSync(srcPath, "utf8");

  html = html.replace(/<!--\s*@include navbar\s*-->/g, navbar);
  html = html.replace(/<!--\s*@include footer\s*-->/g, footer);

  const outName = file.replace(".src.html", ".html");
  const outPath = path.join(ROOT, outName);
  fs.writeFileSync(outPath, html, "utf8");
  console.log(`Built ${outName}`);
}

console.log("\nDone. Run `npm run build:css` (or `npm run build` which does both) to compile Tailwind.");
