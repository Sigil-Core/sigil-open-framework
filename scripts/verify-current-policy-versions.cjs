#!/usr/bin/env node

const { existsSync, readFileSync, readdirSync } = require("node:fs");
const { dirname, join } = require("node:path");

const repoRoot = dirname(__dirname);
const examplesRoot = join(repoRoot, "examples");
const currentDocs = [
  "developer-toolkit/warranty-policy.md",
  "getting-started.md",
  "pre-execution-enforcement-gap.md",
];
const policyV1Line = /^version:\s*1\./m;
const policy21Line = /^version:\s*2\.1\.0\s*$/m;
const failures = [];

for (const entry of readdirSync(examplesRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const policyPath = join(examplesRoot, entry.name, "warranty.md");
  if (!existsSync(policyPath)) continue;
  if (policyV1Line.test(readFileSync(policyPath, "utf8"))) {
    failures.push(`${entry.name}/warranty.md still declares Policy 1.x`);
  }
}

for (const relativePath of currentDocs) {
  const content = readFileSync(join(repoRoot, relativePath), "utf8");
  if (policyV1Line.test(content)) {
    failures.push(`${relativePath} still contains a current Policy 1.x snippet`);
  }
  if (!policy21Line.test(content)) {
    failures.push(`${relativePath} does not contain the current Policy 2.1.0 snippet`);
  }
}

if (failures.length > 0) {
  console.error("Current policy-version verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Verified canonical examples are off Policy 1.x and current documentation snippets use Policy 2.1.0.");
}
