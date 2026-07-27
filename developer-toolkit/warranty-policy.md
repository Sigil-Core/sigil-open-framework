---
title: "Sigil Warrant & warranty.md"
description: "Define your agent's execution policy using Sigil Warrant. Every agent action is evaluated against this policy before it executes."
---

## Overview

A `warranty.md` file is a signed, operator-defined policy that tells Sigil Sign what your agent is and isn't allowed to do. It is the contract between you and your agent's execution layer.

Sigil Sign evaluates every agent intent against this file before allowing any action to proceed. If the action violates policy, it is denied before it executes, not audited after.

## Generate Your Policy

Use **Sigil Warrant** at [sigilcore.com/tools/warrant](https://sigilcore.com/tools/warrant) to generate, sign, and download your `warranty.md`. Two paths are available:

- **Warrant Builder:** guided step-by-step flow. No policy syntax required. Recommended for first-time operators.
- **Manual Warrant:** choose the structured Form for common policies or Advanced Mode to edit the complete `warranty.md` source. Advanced Mode validates, signs, downloads, re-imports, and deploys the exact policy bytes.

Both paths produce an identical signed `warranty.md` that Sigil Sign accepts at boot.

<Note>
  **Policy 2.1 authoring contract.** `@sigilcore/warrant-core@0.2.1` is the shared parser, canonicalizer, signer-envelope validator, and authoring-capability source. Manual Advanced covers every field that the deployed Sign contract accepts. Manual Form and Warrant Builder expose their supported subsets and route unsupported fields to Advanced Mode or reject them before changing policy state. See [Policy 2.1 authoring capabilities](/developer-toolkit/policy-2-1) for the generated field matrix.
</Note>

## File Format

`warranty.md` uses a plain-text, typed-block format. Blocks are defined by `##` headers. A 1.x policy requires an enforceable EVM, tool-call, custom, or model-budget rule. A 2.0 or profileless 2.1 policy may also consist of enforced `## soft_limits`. A 2.1 resource profile adds a trusted execution-shim boundary only when the policy declares one of the resource-profile blocks.

> **Policy format 2.0.0:** 1.x policies keep their existing semantics. New 2.0 syntax is opt-in through the version line and requires a Sign build that supports the field. Policy format 2.0 adds typed HTTP intents, allow-rule operators, enforced named caps, MCP-native actions, approval patterns, and provenance gates. Existing signed 1.x files remain unchanged.

For a controlled upgrade, follow the [1.x to 2.0 migration guide](/developer-toolkit/migrating-1x-to-2). The guide includes the re-sign, rollback, and conformance-vector checks required before activation.

```markdown
version: 2.1.0

## evm
max_transaction_eth: 5.0
allowed_chains: 1, 8453, 42161
allowed_actions: wallet.transfer, contract.call
consensus_threshold_eth: 3.0
consensus_require_hold: true
token.USDC.max_transaction: 10000
token.USDC.decimals: 6
token.USDC.addresses: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

## tool_calls
allowed: bash, web_fetch, file_write, wallet_sign, email.send
bash.blocked_commands: rm -rf, curl, wget
web_fetch.blocked_domains: evil.com, malicious.io
file_write.blocked_paths: /etc, /root, ~/.ssh
email.require_approval: true
email.allowed_recipients: *@yourcompany.com, partner@example.com
email.blocked_recipients: noreply@yourcompany.com

## custom
# Operator-defined rules, evaluated FIRST before all other checks
allow_only.intent.metadata.job_type: research, data_labeling
deny_if.intent.metadata.email_to contains "@competitor.com"
deny_string: "DROP TABLE"
deny_string: "OPENAI_API_KEY"

## soft_limits
daily_evm_limit_eth: 20.0
daily_tool_calls: 500

## execution_limits
max_tool_calls_per_task: 50

## signature
sigil-sig: <base64url>
```

This current reference uses profileless Policy 2.1. It keeps the EVM and tool-call fields shown here without asserting a repository, filesystem, Git, or database execution boundary.

## Policy Sections

### `## evm`

Controls EVM transaction execution, including spend limits, allowed chains, allowed actions, and consensus hold thresholds.

| Field | Description |
| --- | --- |
| `max_transaction_eth` | Maximum ETH value per transaction |
| `allowed_chains` | Comma-separated chain IDs |
| `allowed_actions` | Permitted EVM actions |
| `chain_actions` | Optional per-chain action overrides (takes precedence over `allowed_actions`) |
| `consensus_threshold_eth` | Transactions above this require human approval |
| `consensus_require_hold` | Set `true` to enable the hold |
| `token.<SYM>.max_transaction` | Maximum per-transaction amount for that ERC-20 token, in human units (e.g. `10000` = 10,000 USDC) |
| `token.<SYM>.decimals` | **Required.** Token decimals (USDC/USDT are 6, most ERC-20s are 18). There is no default: a wrong implicit default would mis-scale the limit by orders of magnitude |
| `token.<SYM>.addresses` | Optional pinned contract addresses; repeat the line to add addresses across chains (entries merge) |

**Token semantics:** an intent carrying `token` is governed only by the matching `token.<SYM>.*` rule. `max_transaction_eth` and `consensus_threshold_eth` are ETH-denominated and never apply to token amounts. A token intent with no matching rule, including a policy with no token rules at all, is `DENIED` fail-closed with `SIGIL_POLICY_VIOLATION_TOKEN_NOT_ALLOWED`. Symbols match case-insensitively; address-form intents match only pinned `addresses`. **When a rule pins `addresses`, the intent's `targetAddress` must be one of them.** An ERC-20 transfer's transaction target is the token contract, and this binding prevents a native ETH transfer labelled with a token symbol from skipping the ETH limit. Pinning addresses is strongly recommended; rules without them accept the declared symbol at face value. Amount comparisons are exact: all-digit amounts are base units compared via BigInt at the rule's `decimals`, decimal amounts are scaled exactly via string math with no float rounding, and the limit itself is kept as the decimal string you wrote. A token intent whose `amount` is missing or unparseable is `DENIED` fail-closed with `SIGIL_POLICY_VIOLATION_TOKEN_AMOUNT_INVALID`.

### `## tool_calls`

Controls non-EVM agent tool execution.

| Field | Description |
| --- | --- |
| `allowed` | Permitted tool types |
| `bash.blocked_commands` | Substrings that trigger denial in bash |
| `web_fetch.blocked_domains` | Hostnames blocked for web requests |
| `file_write.blocked_paths` | Path prefixes blocked for file writes |
| `email.require_approval` | Hold all email.send for human approval |
| `email.allowed_recipients` | Recipients permitted for email.send, using exact addresses or `*@domain` wildcards |
| `email.blocked_recipients` | Recipients always denied for email.send, using the same entry forms |
| `http.allowed_methods` | HTTP methods permitted for typed `http` intents |
| `http.blocked_methods` | HTTP methods denied before the allowlist is evaluated |
| `http.allowed_hosts` | Exact hosts, or `*.example.com` subdomain patterns, permitted for typed `http` intents |
| `require_approval` | Generic action patterns that create a durable approval hold after the base profile allows the action |
| `require_shim` | Require `provenance: shim`, derived from the API-key record, for actions governed by this block |

**Recipient semantics:** `email.send` intents carry recipients in `intent.to` (string or array). Checks run in order: denylist, allowlist, approval hold. A blocked recipient is `DENIED` (`SIGIL_POLICY_VIOLATION_BLOCKED_RECIPIENT`) before any hold is created, and an off-allowlist recipient returns `SIGIL_POLICY_VIOLATION_RECIPIENT_NOT_ALLOWED`. Every recipient in an array must pass. A missing `to` while either list is declared is `DENIED` fail-closed. Each recipient list must contain at least one entry; empty recipient lists reject the policy. `*@domain` matches that exact domain only; subdomains do not match. Matching is case-insensitive.

### `## custom`

Operator-defined rules evaluated before all other checks. Three rule types:

```text
# Allow ONLY these values for a field. Anything else, or a missing field, is denied.
allow_only.<field_path>: <value>, <value>, ...

# Block a specific field value
deny_if.<field_path> <operator> <value>

# Block any intent containing a string in any field
deny_string: <literal>

# Require shim-derived metadata for an affirmative allowlist.
allow_only[action=mcp.buffer.create_post].metadata.arguments.channelId attested equals: linkedin-company
```

Operators: `contains`, `starts_with`, `ends_with`, `equals`, `not_equals`, `matches` (regex)

**Allowlist semantics:** `allow_only` is an affirmative allowlist. In 1.x it keeps exact, case-sensitive matching; in 2.0 it accepts `equals` (the default), `starts_with`/`prefix`, `ends_with`, `contains`, and `matches` operators. A missing or non-matching field is `DENIED` fail-closed with `SIGIL_POLICY_VIOLATION_NOT_ON_ALLOWLIST`. Regex patterns are capped at 256 characters; invalid patterns deny without throwing. **Deny rules win:** deny\_if/deny\_string are evaluated first, so a value matching both a deny rule and the allowlist is denied with the deny rule's code.

An `attested` allowlist rule must target `metadata.*` and fails closed unless the request arrived through a trusted shim. `require_shim: true` is a block-level gate. Sign stamps `provenance: agent` or `provenance: shim` from the API-key record; the request body cannot self-assert either value. Generic `require_approval` patterns can appear in any policy block and match exact actions or one trailing `*` prefix wildcard. `email.require_approval` remains syntax sugar for the same durable hold class.

### `## mcp`

MCP policy is deny-by-default unless this block exists. Sign dispatches on the `mcp.` action prefix and evaluates the trusted metadata values instead of splitting the action string.

| Field | Description |
| --- | --- |
| `allowed_servers` | Exact server IDs or one trailing `*` prefix wildcard |
| `allowed_tools` | Exact `serverId.toolName` identities, tool names, or trailing `*` prefix wildcards |
| `blocked_tools` | MCP tool identities or tool names that always deny |
| `require_approval` | MCP tool patterns that return `PENDING` with a durable 24-hour hold |
| `require_shim` | Require `provenance: shim` for MCP actions governed by this block |

```markdown
## mcp
allowed_servers: buffer, notion
allowed_tools: buffer.create_post, notion.notion-create-pages
blocked_tools: buffer.delete_*
require_approval: buffer.create_post
require_shim: true
```

### `## soft_limits`

`## soft_limits` is version-gated. Under 1.x, its legacy fields remain informational metadata and do not change an authorization decision. Under 2.0, declared limits are enforced after the engine approves the matching action type or namespace, and an exceeded cap returns `DENIED`. Existing signed 1.x policies keep their original behavior until an operator explicitly upgrades and re-signs them. A cap on a namespace the current engine does not approve cannot make that namespace executable.

Policy format 2.0 supports legacy daily limits and named caps:

```markdown
## soft_limits
daily_tool_calls: 500
daily_evm_limit_eth: 20.0

cap.linkedin_posts.max_count: 2
cap.linkedin_posts.window: day
cap.linkedin_posts.action: mcp.buffer.create_post
cap.linkedin_posts.group_by: metadata.arguments.channelId

cap.ad_spend.max_sum_usd: 500.00
cap.ad_spend.window: day
cap.ad_spend.action: mcp.google-ads.*
cap.ad_spend.amount_field: metadata.arguments.budget_usd
```

<Note>
  Named caps can target `mcp.*` actions. The cap applies after the MCP block and base policy approve the call, and a denied or pending call does not consume aggregate budget.
</Note>

| Field | Description |
| --- | --- |
| `cap.<name>.max_count` | Positive integer count ceiling. Mutually exclusive with `max_sum_usd` |
| `cap.<name>.max_sum_usd` | Positive USD ceiling with up to six decimal places. Mutually exclusive with `max_count` |
| `cap.<name>.window` | Counter window: `day`, `hour`, or `task` |
| `cap.<name>.action` | Exact action or one trailing `*` prefix wildcard |
| `cap.<name>.group_by` | Optional intent field path that creates an independent counter per value |
| `cap.<name>.amount_field` | Required decimal-string intent field path for a USD sum cap |

The counter key combines the API key, cap name, group value, and window bucket. Sign increments counters only after the base policy approves the intent. Base-policy `DENIED` and `PENDING` decisions do not consume aggregate budget. A missing or non-string `amount_field` value fails closed with `SIGIL_AGGREGATE_FIELD_MISSING`. Counter-store failure fails closed with `SIGIL_LIMIT_STORE_UNAVAILABLE`.

<Warning>
  `day` and `hour` use UTC calendar buckets, not rolling windows or the operator's local timezone. The reserved `window_days`, `window_hours`, and `timezone` keys are not supported yet and cause a parse error.
</Warning>

### `## execution_limits`

Hard ceilings that stop runaway tool loops before the next tool executes.

| Field | Description |
| --- | --- |
| `max_tool_calls_per_task` | Maximum tool calls for one `intent.task_id`; the next call is `DENIED` |
| `max_tool_calls_per_hour` | Maximum tool calls per API key in the current UTC clock-hour bucket |
| `max_model_spend_usd_per_task` | Maximum adapter-reported model spend for one `intent.task_id` |
| `max_model_tokens_per_task` | Maximum adapter-reported model tokens for one `intent.task_id` |

Execution limits are hard denials, not soft caps. A ceiling breach returns `SIGIL_LOOP_LIMIT_EXCEEDED`; if the counter store is unavailable, Sigil Sign fails closed with `SIGIL_LIMIT_STORE_UNAVAILABLE`. The per-task ceiling applies only when the request includes `intent.task_id`; the hourly ceiling applies per API key.

### `## signature`

Ed25519 signature over all content above this block. Generated by Sigil Warrant. A missing or invalid signature causes Sigil Sign to reject the policy unconditionally at startup.

## Deployment

Place your signed `warranty.md` at `config/warranty.md` relative to `process.cwd()`, or set `WARRANTY_PATH` to its location:

```bash
WARRANTY_PATH=/path/to/your/warranty.md
```

The file is loaded once at startup and cached. Changes require a process restart.

## Security

- The policy file is signed with your Ed25519 operator key
- The SHA-256 hash of the policy content is embedded in every Intent Attestation JWT (`policyHash` claim)
- If the file is modified after signing, Sigil Sign detects it at next startup and refuses to start
- Never commit your live `warranty.md` to version control; it exposes your agent's security policy and operational limits

`config/warranty.md` is gitignored by default in the sigil-sign repo.
