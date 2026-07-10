# Pending Policy Corpus Cases

These cases are release-gating requirements for Policy Primitives v2 phases that have not shipped yet. They are intentionally not copyable `warranty.md` examples and do not carry policy hashes.

A case moves into `conformance/vectors/` only after its required runtime phase ships. Promotion requires a signed policy, canonical policy hash, exact request intents, expected decisions and public error codes, plus one controlled OBSERVE-to-ENFORCE run.

| Case | Runtime dependency | Promotion gate |
|---|---|---|
| Google Ads bid manager | Phase 2 aggregates and Phase 3 MCP provenance | Bid adjustments remain inside a daily USD cap; campaign create, pause, and delete remain denied |
| Meta Ads budget operator | Phase 2 aggregates and Phase 3 MCP provenance | Budget changes remain account- and campaign-scoped; campaign and audience mutation remain denied |
| Buffer social scheduler | Phase 2 count caps and Phase 3 MCP taxonomy | `create_post` requires approval, channel caps deny N+1, and destructive tools remain denied |
