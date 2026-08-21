#!/usr/bin/env node

const { readFileSync } = require("node:fs");
const { dirname, join } = require("node:path");
const { verifyClaudeShimExample } = require("./verify-claude-shim-example.cjs");

const repoRoot = dirname(__dirname);
const source = readFileSync(join(repoRoot, "examples", "claude-code-agent", "warranty.md"), "utf8");

if (verifyClaudeShimExample(source).length !== 0) {
  throw new Error("the checked-in Claude Code example must satisfy the trusted-shim contract");
}

const missingExecutionShim = source.replace(
  "## execution_limits\nmax_tool_calls_per_task: 50\nrequire_shim: true",
  "## execution_limits\nmax_tool_calls_per_task: 50",
);
if (missingExecutionShim === source || !verifyClaudeShimExample(missingExecutionShim).includes("Claude Code example requires execution_limits.require_shim: true")) {
  throw new Error("missing execution_limits.require_shim was not rejected");
}

const falseRepositoryShim = source.replace(
  "git_providers: generic, github\nrequire_shim: true",
  "git_providers: generic, github\nrequire_shim: false",
);
if (falseRepositoryShim === source || !verifyClaudeShimExample(falseRepositoryShim).includes("Claude Code example requires repository.require_shim: true")) {
  throw new Error("false repository.require_shim was not rejected");
}

process.stdout.write("Verified planted missing and false trusted-shim declarations are rejected.\n");
