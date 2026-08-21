# Decision vocabulary Wave 0 evidence

Baseline: `origin/main` at `f47a90c70d61afa8c09c6242b8200abc46cb46f8`.

Method: case-sensitive `APPROVED` substring search across tracked product and documentation files. Repository agent-history files are governance mirrors and are outside this repository gate. The baseline has 44 occurrences in 30 files.

| Baseline path | Lines | Classification |
| --- | --- | --- |
| `agent-hooks/codex.md` | 162 | gate-decision |
| `agent-hooks/hermes.md` | 106 | gate-decision |
| `agent-hooks/openrouter.md` | 105 | gate-decision |
| `agent-hooks/overview.md` | 33, 141 | gate-decision |
| `agent-hooks/rust.md` | 167 | gate-decision |
| `api-reference.md` | 140 | hold-status |
| `api-reference/openapi.json` | 369, 379, 1293, 1303, 2521, 2538, 3592 | gate-decision and hold-status |
| `architecture.md` | 26, 122 | gate-decision |
| `components/sigil-command.md` | 31 | gate-decision |
| `conformance/pending/google-ads-bid-manager.md` | 15 | gate-decision |
| `conformance/pending/meta-ads-budget-operator.md` | 15 | gate-decision |
| `conformance/vectors/README.md` | 10 | gate-decision |
| `conformance/vectors/aggregate-v2.json` | 10 | gate-decision |
| `conformance/vectors/custom-case-sensitivity-v2.json` | 27 | gate-decision |
| `conformance/vectors/evm-amount-legacy-lenient-v1.json` | 11 | gate-decision |
| `conformance/vectors/evm-amount-required-engine-v2-1.json` | 24, 30 | gate-decision |
| `conformance/vectors/evm-amount-required-v2.json` | 21 | gate-decision |
| `conformance/vectors/evm-calldata-enrichment-v2-1.json` | 112 | gate-decision |
| `conformance/vectors/evm-calldata-legacy-passthrough-v2.json` | 16 | gate-decision |
| `conformance/vectors/http-method-rules-v2-1.json` | 10, 44 | gate-decision |
| `conformance/vectors/http-readonly-methods-v2.json` | 9, 15 | gate-decision |
| `conformance/vectors/http-v2.json` | 9 | gate-decision |
| `conformance/vectors/mcp-gateway-v2.json` | 9 | gate-decision |
| `demo/README.md` | 15 | gate-decision |
| `demo/demo.ts` | 4, 73 | gate-decision |
| `developer-toolkit/testing.md` | 96, 178, 179 | gate-decision |
| `faq.md` | 337 | gate-decision |
| `mcp-proxy/overview.md` | 26 | gate-decision |
| `pre-execution-enforcement-gap.md` | 341, 373 | gate-decision, sealed v1.4 paper source |

Totals: gate-decision 43; hold-status 1; foreign-domain 0. Active documentation and vectors move to `ALLOWED`. The two sealed v1.4 paper occurrences remain under exact expression allowances because this program does not issue an erratum. The gate scans 106 declared text and machine-readable files after the sweep.

Execution-authorizing entry points: 0. This repository publishes contracts and documentation. It does not execute an authorized action. Capability and import-architecture gates are not applicable.
