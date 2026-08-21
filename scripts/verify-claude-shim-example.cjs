#!/usr/bin/env node

const { readFileSync } = require("node:fs");
const { dirname, join } = require("node:path");

const repoRoot = dirname(__dirname);
const examplePath = join(repoRoot, "examples", "claude-code-agent", "warranty.md");

const policySection = (policy, name) => {
  const marker = `## ${name}\n`;
  const start = policy.indexOf(marker);
  if (start === -1) return null;
  const contentStart = start + marker.length;
  const end = policy.indexOf("\n## ", contentStart);
  return policy.slice(contentStart, end === -1 ? undefined : end);
};

const verifyClaudeShimExample = (markdown) => {
  const fencedPolicy = markdown.match(/```markdown\n([\s\S]*?)\n```/);
  if (!fencedPolicy) return ["Claude Code example has no fenced warranty.md policy"];

  const failures = [];
  const policy = fencedPolicy[1];
  if (!/^version:\s*2\.1\.0\s*$/m.test(policy)) {
    failures.push("Claude Code example must remain Policy 2.1.0");
  }
  for (const name of ["repository", "execution_limits"]) {
    const section = policySection(policy, name);
    if (section === null || !/^require_shim:\s*true\s*$/m.test(section)) {
      failures.push(`Claude Code example requires ${name}.require_shim: true`);
    }
  }
  return failures;
};

if (require.main === module) {
  const failures = verifyClaudeShimExample(readFileSync(examplePath, "utf8"));
  if (failures.length > 0) {
    process.stderr.write(`Claude Code trusted-shim example verification failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write("Verified the Claude Code repository and execution-limit trusted-shim declarations.\n");
  }
}

module.exports = { verifyClaudeShimExample };
