# SOF Policy 2.0 Conformance Vectors

These vectors are portable fixtures for a signer implementation's policy parser and evaluator. They intentionally omit a live operator signature. A harness must sign each policy with its test key, submit the listed intents, and compare the decision, public error code, and relevant violated rule.

Each vector records:

- the exact unsigned policy body;
- a canonical policy hash after parsing;
- request intents with trusted provenance and metadata where required;
- expected `APPROVED`, `DENIED`, or `PENDING` decisions;
- the public error code and violated rule for non-approved decisions.

Promotion criteria for a new connector-specific vector remain stricter. Capture the installed connector's real server ID, tool names, argument schema, policy hash, and audit records. Run the fixture once in OBSERVE mode, assert the projected decision and redaction fields, terminate the canary, then repeat the assertions in ENFORCE mode.
