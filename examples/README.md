# Examples

Each subfolder here is a ready-to-use `warranty.md` for a common agent type, with a short README that explains what the agent does, what could go wrong without policy, and what the policy blocks, bounds, or requires. Use them as starting points: copy the one closest to your agent, then adjust the recipients, paths, chains, job types, and limits to fit your deployment.

To deploy any of these, copy the policy body from the example's `warranty.md` into Sigil Warrant at [sigilcore.com/tools/warrant](https://sigilcore.com/tools/warrant), sign it, and deploy the signed file with the API key used by that agent. The `sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL` placeholder is filled in by the signing step.

## Available examples

- **cms-publisher-agent**: A policy-format 2.0 publisher for a Supabase-backed CMS. Allows typed HTTP `POST`/`PATCH` requests to post rows and category-scoped cover objects, blocks `DELETE`, and keeps adjacent administrative paths out of scope.
- **api-agent**: An autonomous API agent for LangChain or ELIZA pipelines. Restricts requests to allowlisted hosts and methods (fail-closed), denies listed private-network hostnames and credential strings as defense in depth, bounds email recipients, and requires a declared job type.
- **defi-agent**: An autonomous DeFi yield agent. Caps ETH and USDC per transaction on pinned addresses, allowlists chains, requires a parseable amount on every EVM intent, requires human countersignature above a threshold, and denies listed sanctioned address forms.
- **claude-code-agent**: Protect Your Repository. A coding agent policy that blocks destructive shell and Git commands, denies writes to named sensitive paths, and rejects known credential strings.
- **mcp-server-agent**: An agent that calls external tools through MCP servers. Allowlists MCP servers and tools, blocks destructive tool patterns, holds email for approval, and requires a declared job type.
- **customer-support-agent**: An agent that answers tickets, fetches knowledge-base pages, and sends email. Holds every outbound reply for human approval, restricts recipients to customer and support domains (fail-closed), denies listed PII marker strings as defense in depth, and routes refunds to humans via the approval hold.
- **outbound-email-agent**: An SDR-style outreach agent sending through a provider API. Holds every send for human approval, forces a recipient on every send intent, denies internal broadcast lists, requires a declared campaign and job type, and caps daily send volume per campaign.
- **data-etl-agent**: A high-volume batch data pipeline agent. Denies listed destructive SQL and shell strings (case-sensitive substrings), denies file writes to listed sensitive paths, denies listed private-network hostnames, and requires a declared pipeline stage.
- **read-only-auditor**: An audit agent that is read-only at the transport layer: only GET and HEAD are authorized (fail-closed), requests are pinned to placeholder audited hosts (replace with your audited surfaces), listed private-network hostnames are denied, and execution limits are very low. The most locked-down example.
- **stablecoin-treasury-agent**: An autonomous treasury agent managing stablecoin reserves across USDC, PYUSD, and USDT. Pins issuer addresses, caps per-token amounts on token-declared intents, requires a parseable amount on every EVM intent, requires countersignature above a threshold, and denies listed sanctioned address forms.
- **rwa-rebalancing-agent**: An agent rebalancing a tokenized real-world-asset portfolio (BENJI, USDY, and BUIDL once pinned). Contract calls only, per-issuer caps on pinned addresses, a required parseable amount on every EVM intent, a declared jurisdiction on every rebalance, and countersignature above a threshold.

## Pending policy corpus cases

Google Ads bid management, Meta Ads budget operations, and Buffer social scheduling are tracked under [`conformance/pending/`](../conformance/pending/README.md). They become copyable examples only after the aggregate-cap, Buffer count-cap, and MCP provenance runtime phases ship and their conformance vectors pass.

For the full schema, see [`developer-toolkit/warranty-policy.md`](../developer-toolkit/warranty-policy.md). For Policy 2.1 examples that add resource profiles or advanced controls, use Manual Warrant Advanced Mode so the signed source round-trips without field loss. The supported Form and Builder subsets are listed in the [generated capability matrix](../developer-toolkit/policy-2-1.md).
