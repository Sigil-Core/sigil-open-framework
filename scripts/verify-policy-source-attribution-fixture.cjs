#!/usr/bin/env node

const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const {
  STALE_POLICY_23_SOURCE,
  verifyPolicy23SourceAttribution,
} = require("./policy-source-attribution.cjs");

const fixturePath = join(__dirname, "fixtures", "stale-policy-2-3-source.md");
const failures = verifyPolicy23SourceAttribution(
  "scripts/fixtures/stale-policy-2-3-source.md",
  readFileSync(fixturePath, "utf8"),
);

if (failures.length !== 2 || !failures[0].includes(STALE_POLICY_23_SOURCE)) {
  process.stderr.write(`Forced-failure fixture was not rejected as expected:\n${failures.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("Verified the stale Policy 2.3 source fixture is rejected by both attribution guards.\n");
}
