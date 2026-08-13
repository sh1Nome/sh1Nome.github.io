import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";

interface Link {
  label: string;
  url: string;
  description?: string;
}

interface Category {
  name: string;
  links: Link[];
}

interface Site {
  title: string;
  subtitle: string;
  categories: Category[];
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA_FILE = path.join(ROOT, "data", "site.yaml");
const STYLE_SRC = path.join(ROOT, "src", "style.css");
const OUT_DIR = path.join(ROOT, "dist");

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderLink(link: Link): string {
  const description = link.description
    ? `\n            <p class="description">${escapeHtml(link.description)}</p>`
    : "";
  return `          <li>
            <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a>${description}
          </li>`;
}

function renderCategory(category: Category): string {
  const links = category.links.map(renderLink).join("\n");
  return `      <section class="category">
        <h2>${escapeHtml(category.name)}</h2>
        <ul class="links">
${links}
        </ul>
      </section>`;
}

function renderPage(site: Site): string {
  const categories = site.categories.map(renderCategory).join("\n");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(site.title)}</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <main>
      <h1>${escapeHtml(site.title)}</h1>
      <p class="subtitle">${escapeHtml(site.subtitle)}</p>
${categories}
    </main>
  </body>
</html>
`;
}

function main(): void {
  const site = yaml.load(fs.readFileSync(DATA_FILE, "utf8")) as Site;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "index.html"), renderPage(site));
  fs.copyFileSync(STYLE_SRC, path.join(OUT_DIR, "style.css"));

  console.log(`Built ${OUT_DIR}`);
}

main();
