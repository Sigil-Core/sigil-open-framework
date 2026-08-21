#!/usr/bin/env node

const { readFileSync } = require("node:fs");
const { dirname, join } = require("node:path");
const { verifyClaudeShimExample } = require("./verify-claude-shim-example.cjs");

const repoRoot = dirname(__dirname);
const source = readFileSync(join(repoRoot, "examples", "claude-code-agent", "warranty.md"), "utf8");

if (verifyClaudeShimExample(source).length !== 0) {
  throw new Error("the checked-in Claude Code example must satisfy the trusted-shim contract");
}

const replaceSectionRequireShim = (markdown, section, replacement) => markdown.replace(
  new RegExp(`(^## ${section}\\s*$\\n(?:(?!^## ).*\\n)*?)^require_shim:\\s*true\\s*$`, "m"),
  replacement === null ? "$1" : `$1require_shim: ${replacement}`,
);

const missingExecutionShim = replaceSectionRequireShim(source, "execution_limits", null);
if (missingExecutionShim === source || !verifyClaudeShimExample(missingExecutionShim).includes("Claude Code example requires execution_limits.require_shim: true")) {
  throw new Error("missing execution_limits.require_shim was not rejected");
}

const falseRepositoryShim = replaceSectionRequireShim(source, "repository", "false");
if (falseRepositoryShim === source || !verifyClaudeShimExample(falseRepositoryShim).includes("Claude Code example requires repository.require_shim: true")) {
  throw new Error("false repository.require_shim was not rejected");
}

const withIntroductoryMarkdownFence = `\`\`\`markdown\nThis is explanatory prose, not a policy.\n\`\`\`\n\n${source}`;
if (verifyClaudeShimExample(withIntroductoryMarkdownFence).length !== 0) {
  throw new Error("an introductory markdown fence must not replace the warranty.md policy identity");
}

process.stdout.write("Verified planted missing and false trusted-shim declarations are rejected.\n");
