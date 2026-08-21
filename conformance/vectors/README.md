# SOF Policy 2.0 and 2.1 Conformance Vectors

These vectors are portable fixtures for a signer implementation's policy parser and evaluator. They intentionally omit a live operator signature. A harness must sign each policy with its test key, submit the listed intents, and compare the decision, public error code, and relevant violated rule.

Each vector records:

- the exact unsigned policy body;
- a canonical policy hash after parsing;
- request intents with trusted provenance and metadata where required;
- expected `ALLOWED`, `DENIED`, or `PENDING` decisions;
- the public error code and violated rule for non-approved decisions.

Promotion criteria for a new connector-specific vector remain stricter. Capture the installed connector's real server ID, tool names, argument schema, policy hash, and audit records. Run the fixture once in OBSERVE mode, assert the projected decision and redaction fields, terminate the canary, then repeat the assertions in ENFORCE mode.

Policy 2.1 resource vectors use stable claim IDs from `conformance/corpus.yaml`. A Policy 2.1 implementation must deny missing or untrusted effect metadata, outside-root paths, protected sensitive files, unsafe Git topology, blocked provider operations, and unreviewed production database effects. The vector corpus does not grant runtime capability to an adapter that only performs a preflight check.
