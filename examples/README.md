# Examples

Each subfolder here is a ready-to-use `warranty.md` for a common agent type, with a short README that explains what the agent does, what could go wrong without policy, and what the policy blocks, bounds, or requires. Use them as starting points: copy the one closest to your agent, then adjust the recipients, paths, chains, job types, and limits to fit your deployment.

To deploy any of these, copy the policy body from the example's `warranty.md` into Sigil Warrant at [sigilcore.com/tools/warrant](https://sigilcore.com/tools/warrant), sign it, and deploy the signed file with the API key used by that agent. The `sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL` placeholder is filled in by the signing step.

## Available examples

- **cms-publisher-agent**: A policy-format 2.0 publisher for a Supabase-backed CMS. Allows typed HTTP `POST`/`PATCH` requests to post rows and category-scoped cover objects, blocks `DELETE`, and keeps adjacent administrative paths out of scope.
- **api-agent**: An autonomous API agent for LangChain or ELIZA pipelines. Blocks SSRF and credential leakage, bounds email recipients, and requires an allowlisted job type.
- **defi-agent**: An autonomous DeFi yield agent. Caps ETH and USDC per transaction, allowlists chains, requires human countersignature above a threshold, and blocks sanctioned addresses.
- **claude-code-agent**: Protect Your Repository. A coding agent policy that blocks destructive shell and Git commands, denies writes to named sensitive paths, and rejects known credential strings.
- **mcp-server-agent**: An agent that calls external tools through MCP servers. Blocks destructive shell and SSRF, bounds email recipients, denies credential leakage, and requires an allowlisted job type.
- **customer-support-agent**: An agent that answers tickets, fetches knowledge-base pages, and sends email. Holds email for approval, bounds recipients, blocks refunds and PII exfiltration, and blocks mass-send.
- **data-etl-agent**: A high-volume batch data pipeline agent. Blocks destructive SQL and shell, restricts file writes to safe paths, blocks SSRF and mass exfiltration, and requires an allowlisted pipeline stage.
- **read-only-auditor**: A strictly read-only audit agent. Permits web fetch only, denies any write or mutate intent, blocks SSRF, and sets very low execution limits. The most locked-down example.
- **stablecoin-treasury-agent**: An autonomous treasury agent managing stablecoin reserves across USDC, PYUSD, and USDT. Pins issuer addresses, caps per-token amounts, requires countersignature above a threshold, and blocks sanctioned addresses.
- **rwa-rebalancing-agent**: An agent rebalancing a tokenized real-world-asset portfolio (BUIDL, BENJI, USDY). Contract calls only, per-issuer caps, a jurisdictional allowlist on every rebalance, and countersignature above a threshold.

## Pending policy corpus cases

Google Ads bid management, Meta Ads budget operations, and Buffer social scheduling are tracked under [`conformance/pending/`](../conformance/pending/README.md). They become copyable examples only after the aggregate-cap, Buffer count-cap, and MCP provenance runtime phases ship and their conformance vectors pass.

For the full schema, see [`developer-toolkit/warranty-policy.md`](../developer-toolkit/warranty-policy.md).
