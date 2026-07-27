#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const PACKAGE = "@sigilcore/warrant-core";
const VERSION = "0.2.1";
const START = "{/* BEGIN GENERATED POLICY 2.1 CAPABILITY MATRIX */}";
const END = "{/* END GENERATED POLICY 2.1 CAPABILITY MATRIX */}";
const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const targetPath = join(repoRoot, "developer-toolkit", "policy-2-1.md");

const status = (capability) => {
  const dimensions = [
    ["A", capability.author],
    ["I", capability.import],
    ["P", capability.preserve],
    ["D", capability.deploy],
  ];
  return dimensions.filter(([, available]) => available).map(([label]) => label).join("/") || "none";
};

const renderSurface = (entries, surface) => {
  const grouped = new Map();
  for (const [path, capability] of entries) {
    const label = status(capability.surfaces[surface]);
    grouped.set(label, [...(grouped.get(label) ?? []), path]);
  }
  return [...grouped.entries()]
    .map(([label, paths]) => `\`${label}\`: ${paths.map((path) => `\`${path}\``).join(", ")}`)
    .join("<br />");
};

const loadManifest = async () => {
  const packageDir = mkdtempSync(join(tmpdir(), "sigil-warrant-core-"));
  try {
    const packed = JSON.parse(execFileSync("npm", ["pack", `${PACKAGE}@${VERSION}`, "--pack-destination", packageDir, "--json"], { encoding: "utf8" }));
    const tarball = join(packageDir, packed[0].filename);
    if (!existsSync(tarball)) throw new Error(`npm did not produce ${tarball}`);
    execFileSync("tar", ["-xzf", tarball, "-C", packageDir]);
    return await import(pathToFileURL(join(packageDir, "package", "dist", "index.js")).href);
  } finally {
    rmSync(packageDir, { recursive: true, force: true });
  }
};

const packageModule = await loadManifest();
const byFeature = new Map();
for (const [path, capability] of Object.entries(packageModule.AUTHORING_CAPABILITY_MANIFEST)) {
  const entries = byFeature.get(capability.deploy_feature_key) ?? [];
  entries.push([path, capability]);
  byFeature.set(capability.deploy_feature_key, entries);
}

const rows = packageModule.DEPLOY_FEATURE_KEYS.map((feature) => {
  const entries = byFeature.get(feature) ?? [];
  return `| \`${feature}\` | ${renderSurface(entries, "manual-form")} | ${renderSurface(entries, "manual-advanced")} | ${renderSurface(entries, "builder")} |`;
});

const generated = [
  START,
  `Source: \`${PACKAGE}@${VERSION}\`, \`AUTHORING_CAPABILITY_MANIFEST\` (capability schema v${packageModule.SIGN_CAPABILITIES_SCHEMA_VERSION}).`,
  "",
  "Legend: A = author, I = import, P = preserve without loss, D = deploy. `none` means the surface rejects that field before mutating policy state.",
  "",
  "| Deploy feature | Manual Form | Manual Advanced | Warrant Builder |",
  "| --- | --- | --- | --- |",
  ...rows,
  END,
].join("\n");

if (process.argv.includes("--print")) {
  process.stdout.write(`${generated}\n`);
  process.exit(0);
}

const source = readFileSync(targetPath, "utf8");
const start = source.indexOf(START);
const end = source.indexOf(END);
if (start === -1 || end === -1 || end < start) {
  throw new Error(`Missing generated-matrix markers in ${targetPath}`);
}
const current = source.slice(start, end + END.length);
if (process.argv.includes("--check")) {
  if (current !== generated) {
    process.stderr.write("Policy 2.1 capability matrix is stale. Run: node scripts/generate-policy-2-1-capabilities.mjs --write\n");
    process.exitCode = 1;
  } else {
    process.stdout.write(`Policy 2.1 capability matrix matches ${PACKAGE}@${VERSION}.\n`);
  }
} else if (process.argv.includes("--write")) {
  writeFileSync(targetPath, `${source.slice(0, start)}${generated}${source.slice(end + END.length)}`);
  process.stdout.write(`Updated ${targetPath} from ${PACKAGE}@${VERSION}.\n`);
} else {
  process.stderr.write("Use --check, --print, or --write.\n");
  process.exitCode = 2;
}
