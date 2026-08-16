#!/usr/bin/env node

const { existsSync, readFileSync, readdirSync, statSync } = require("node:fs");
const { dirname, extname, join, relative, resolve, sep } = require("node:path");

const repoRoot = dirname(__dirname);
const failures = [];

const markdownFiles = (directory) => readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if ([".git", "node_modules"].includes(entry.name)) return [];
      return markdownFiles(path);
    }
    return entry.isFile() && entry.name.endsWith(".md") ? [path] : [];
  });

const routeCandidates = (route) => {
  const clean = route.replace(/^\/+/, "");
  const path = join(repoRoot, clean);
  if (extname(path)) return [path];
  return [`${path}.md`, join(path, "index.md")];
};

const resolveLocalTarget = (sourcePath, target) => {
  const withoutTitle = target.trim().replace(/\s+(?:"[^"]*"|'[^']*')$/, "");
  const decoded = decodeURI(withoutTitle.replace(/^<|>$/g, ""));
  const [pathPart] = decoded.split(/[?#]/, 1);
  if (!pathPart) return null;
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(pathPart)) return null;
  const absolute = pathPart.startsWith("/")
    ? resolve(repoRoot, `.${pathPart}`)
    : resolve(dirname(sourcePath), pathPart);
  if (absolute !== repoRoot && !absolute.startsWith(`${repoRoot}${sep}`)) {
    failures.push(`${relative(repoRoot, sourcePath)}: local link escapes the repository: ${target}`);
    return null;
  }
  return absolute;
};

for (const sourcePath of markdownFiles(repoRoot)) {
  const source = readFileSync(sourcePath, "utf8");
  const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g;
  for (const match of source.matchAll(linkPattern)) {
    const target = resolveLocalTarget(sourcePath, match[1]);
    if (!target) continue;
    const candidates = extname(target) ? [target] : [target, `${target}.md`, join(target, "index.md")];
    if (!candidates.some((candidate) => existsSync(candidate))) {
      failures.push(`${relative(repoRoot, sourcePath)}: missing local link target: ${match[1]}`);
    }
  }
}

const docsConfig = JSON.parse(readFileSync(join(repoRoot, "docs.json"), "utf8"));
const pages = [];
const collectPages = (value) => {
  if (Array.isArray(value)) {
    for (const item of value) collectPages(item);
    return;
  }
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value.pages)) pages.push(...value.pages);
  for (const nested of Object.values(value)) collectPages(nested);
};
collectPages(docsConfig.navigation);

for (const page of pages) {
  if (typeof page !== "string") continue;
  const candidates = routeCandidates(page);
  if (!candidates.some((candidate) => existsSync(candidate) && statSync(candidate).isFile())) {
    failures.push(`docs.json: missing navigation page: ${page}`);
  }
}

if (failures.length > 0) {
  process.stderr.write(`Documentation link verification failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Verified ${markdownFiles(repoRoot).length} Markdown files and ${pages.length} Mintlify navigation entries have local targets.\n`);
}
