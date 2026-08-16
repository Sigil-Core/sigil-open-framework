#!/usr/bin/env node

const { existsSync, readFileSync, readdirSync } = require("node:fs");
const { dirname, join } = require("node:path");
const { verifyPolicy23SourceAttribution } = require("./policy-source-attribution.cjs");

const repoRoot = dirname(__dirname);
const examplesRoot = join(repoRoot, "examples");
const policy23Docs = [
  "developer-toolkit/policy-2-3.md",
  "developer-toolkit/warranty-policy.md",
];
const policyV1Line = /^version:\s*1\./m;
const policy21Line = /^version:\s*2\.1\.0\s*$/m;
const policy22Line = /^version:\s*2\.2\.0\s*$/m;
const policy23Line = /^version:\s*2\.3\.0\s*$/m;
const responseKey = /^response\.(?:web_fetch_tools|http_tools|deterministic_ruleset|block_classes|redact_classes|scanner\.(?:required|profile|classes|min_confidence)|observe_classes|observe_until|deny_string):/m;
const failures = [];
const examples = [];

for (const entry of readdirSync(examplesRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const policyPath = join(examplesRoot, entry.name, "warranty.md");
  if (!existsSync(policyPath)) continue;
  const content = readFileSync(policyPath, "utf8");
  examples.push({ name: entry.name, content });
  if (policyV1Line.test(content)) {
    failures.push(`${entry.name}/warranty.md still declares Policy 1.x`);
  }
}

for (const relativePath of policy23Docs) {
  const content = readFileSync(join(repoRoot, relativePath), "utf8");
  if (policyV1Line.test(content)) {
    failures.push(`${relativePath} still contains a current Policy 1.x snippet`);
  }
  if (!policy23Line.test(content)) {
    failures.push(`${relativePath} does not contain the current Policy 2.3.0 snippet`);
  }
  failures.push(...verifyPolicy23SourceAttribution(relativePath, content));
}

const responseExamples = examples.filter(({ content }) => responseKey.test(content));
if (responseExamples.length !== 1 || responseExamples[0].name !== "mcp-server-agent") {
    failures.push("only examples/mcp-server-agent/warranty.md may declare current response keys");
}

const policy23Examples = examples.filter(({ content }) => policy23Line.test(content));
if (policy23Examples.length !== 1 || policy23Examples[0].name !== "mcp-server-agent") {
  failures.push("only examples/mcp-server-agent/warranty.md may opt into Policy 2.3");
}

for (const relativePath of ["getting-started.md", "pre-execution-enforcement-gap.md"]) {
  const content = readFileSync(join(repoRoot, relativePath), "utf8");
  if (policyV1Line.test(content)) {
    failures.push(`${relativePath} still contains a current Policy 1.x snippet`);
  }
  if (!policy21Line.test(content) && !policy22Line.test(content) && !policy23Line.test(content)) {
    failures.push(`${relativePath} contains no supported current-family snippet`);
  }
}

if (failures.length > 0) {
  process.stderr.write(`Current policy-version verification failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("Verified current Policy 2.3 docs and the single MCP response-inspection example without rewriting the other canonical examples.\n");
}
