#!/usr/bin/env node

const { execFileSync } = require("node:child_process");
const { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { dirname, join } = require("node:path");
const { pathToFileURL } = require("node:url");

const PACKAGE = "@sigilcore/warrant-core";
const VERSION = "0.3.0";
const FAMILY = "2.2.x";
const START = "{/* BEGIN GENERATED CURRENT POLICY CAPABILITY MATRIX */}";
const END = "{/* END GENERATED CURRENT POLICY CAPABILITY MATRIX */}";
const repoRoot = dirname(__dirname);
const targetPath = join(repoRoot, "developer-toolkit", "policy-2-2.md");

const packageSpec = () => {
  const index = process.argv.indexOf("--package-spec");
  if (index === -1) return `${PACKAGE}@${VERSION}`;
  const spec = process.argv[index + 1];
  if (!spec || spec.startsWith("--")) {
    throw new Error("--package-spec requires a package name, tarball, or directory");
  }
  return spec;
};

const capabilityStatus = (capability) => {
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
    const label = capabilityStatus(capability.surfaces[surface]);
    grouped.set(label, [...(grouped.get(label) ?? []), path]);
  }
  return [...grouped.entries()]
    .map(([label, paths]) => `\`${label}\`: ${paths.map((path) => `\`${path}\``).join(", ")}`)
    .join("<br />");
};

const loadManifest = async () => {
  const packageDir = mkdtempSync(join(tmpdir(), "sigil-warrant-core-"));
  try {
    const packed = JSON.parse(execFileSync("npm", ["pack", packageSpec(), "--pack-destination", packageDir, "--json"], { encoding: "utf8" }));
    if (packed[0].name !== PACKAGE || packed[0].version !== VERSION) {
      throw new Error(`Expected ${PACKAGE}@${VERSION}, received ${packed[0].name}@${packed[0].version}`);
    }
    const tarball = join(packageDir, packed[0].filename);
    if (!existsSync(tarball)) throw new Error(`npm did not produce ${tarball}`);
    execFileSync("tar", ["-xzf", tarball, "-C", packageDir]);
    return await import(pathToFileURL(join(packageDir, "package", "dist", "index.js")).href);
  } finally {
    rmSync(packageDir, { recursive: true, force: true });
  }
};

const groupCapabilitiesByFeature = (packageModule) => {
  const byFeature = new Map();
  for (const [path, capability] of Object.entries(packageModule.AUTHORING_CAPABILITY_MANIFEST)) {
    if (!capability.versions.includes(FAMILY)) continue;
    const entries = byFeature.get(capability.deploy_feature_key) ?? [];
    entries.push([path, capability]);
    byFeature.set(capability.deploy_feature_key, entries);
  }
  return byFeature;
};

const generateMatrix = (packageModule) => {
  const byFeature = groupCapabilitiesByFeature(packageModule);
  const rows = packageModule.DEPLOY_FEATURE_KEYS
    .filter((feature) => byFeature.has(feature))
    .map((feature) => {
      const entries = byFeature.get(feature);
      return `| \`${feature}\` | ${renderSurface(entries, "manual-form")} | ${renderSurface(entries, "manual-advanced")} | ${renderSurface(entries, "builder")} |`;
    });

  return [
    START,
    `Source: \`${PACKAGE}@${VERSION}\`, \`AUTHORING_CAPABILITY_MANIFEST\`, filtered to \`${FAMILY}\` (capability schema v${packageModule.SIGN_CAPABILITIES_SCHEMA_VERSION}).`,
    "",
    "Legend: A = author, I = import, P = preserve without loss, D = deploy. `none` means the surface rejects that field before mutating policy state.",
    "",
    "| Deploy feature | Manual Form | Manual Advanced | Warrant Builder |",
    "| --- | --- | --- | --- |",
    ...rows,
    END,
  ].join("\n");
};

const currentMatrix = () => {
  const source = readFileSync(targetPath, "utf8");
  const start = source.indexOf(START);
  const end = source.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Missing generated-matrix markers in ${targetPath}`);
  }
  return { source, start, end, matrix: source.slice(start, end + END.length) };
};

const checkMatrix = (generated) => {
  if (currentMatrix().matrix !== generated) {
    process.stderr.write("Current Policy 2.2 capability matrix is stale. Run: node scripts/generate-current-policy-capabilities.cjs --write\n");
    process.exitCode = 1;
    return;
  }
  process.stdout.write(`Current Policy 2.2 capability matrix matches ${PACKAGE}@${VERSION}.\n`);
};

const writeMatrix = (generated) => {
  const { source, start, end } = currentMatrix();
  writeFileSync(targetPath, `${source.slice(0, start)}${generated}${source.slice(end + END.length)}`);
  process.stdout.write(`Updated ${targetPath} from ${PACKAGE}@${VERSION}.\n`);
};

const runCommand = (generated) => {
  if (process.argv.includes("--print")) {
    process.stdout.write(`${generated}\n`);
    return;
  }
  if (process.argv.includes("--check")) {
    checkMatrix(generated);
    return;
  }
  if (process.argv.includes("--write")) {
    writeMatrix(generated);
    return;
  }
  process.stderr.write("Use --check, --print, or --write. Development may add --package-spec <spec>; CI uses the released package.\n");
  process.exitCode = 2;
};

const main = async () => {
  runCommand(generateMatrix(await loadManifest()));
};

main().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
