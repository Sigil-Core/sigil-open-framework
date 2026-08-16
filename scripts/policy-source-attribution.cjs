const CURRENT_POLICY_23_SOURCE = "@sigilcore/warrant-core@0.4.0";
const STALE_POLICY_23_SOURCE = "@sigilcore/warrant-core@0.3.0";

function verifyPolicy23SourceAttribution(relativePath, content) {
  const failures = [];
  if (content.includes(STALE_POLICY_23_SOURCE)) {
    failures.push(`${relativePath} still attributes Policy 2.3 to ${STALE_POLICY_23_SOURCE}`);
  }
  if (!content.includes(CURRENT_POLICY_23_SOURCE)) {
    failures.push(`${relativePath} does not attribute Policy 2.3 to ${CURRENT_POLICY_23_SOURCE}`);
  }
  return failures;
}

module.exports = {
  CURRENT_POLICY_23_SOURCE,
  STALE_POLICY_23_SOURCE,
  verifyPolicy23SourceAttribution,
};
