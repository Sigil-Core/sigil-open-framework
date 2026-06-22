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
- **Manual Warrant:** write your policy directly in the `warranty.md` format. Full control over every field. For developers familiar with the warranty.md schema.

Both paths produce an identical signed `warranty.md` that Sigil Sign accepts at boot.

## File Format

`warranty.md` uses a plain-text, typed-block format. Blocks are defined by `##` headers. At least one of `## evm`, `## tool_calls`, or `## custom` is required.

```markdown
version: 1.0.0

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

## Policy Sections

### `## evm`
Controls EVM transaction execution, including spend limits, allowed chains, allowed actions, and consensus hold thresholds.

| Field | Description |
|---|---|
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
|---|---|
| `allowed` | Permitted tool types |
| `bash.blocked_commands` | Substrings that trigger denial in bash |
| `web_fetch.blocked_domains` | Hostnames blocked for web requests |
| `file_write.blocked_paths` | Path prefixes blocked for file writes |
| `email.require_approval` | Hold all email.send for human approval |
| `email.allowed_recipients` | Recipients permitted for email.send, using exact addresses or `*@domain` wildcards |
| `email.blocked_recipients` | Recipients always denied for email.send, using the same entry forms |

**Recipient semantics:** `email.send` intents carry recipients in `intent.to` (string or array). Checks run in order: denylist, allowlist, approval hold. A blocked recipient is `DENIED` (`SIGIL_POLICY_VIOLATION_BLOCKED_RECIPIENT`) before any hold is created, and an off-allowlist recipient returns `SIGIL_POLICY_VIOLATION_RECIPIENT_NOT_ALLOWED`. Every recipient in an array must pass. A missing `to` while either list is declared is `DENIED` fail-closed. Each recipient list must contain at least one entry; empty recipient lists reject the policy. `*@domain` matches that exact domain only; subdomains do not match. Matching is case-insensitive.

### `## custom`
Operator-defined rules evaluated before all other checks. Three rule types:

```
# Allow ONLY these values for a field. Anything else, or a missing field, is denied.
allow_only.<field_path>: <value>, <value>, ...

# Block a specific field value
deny_if.<field_path> <operator> <value>

# Block any intent containing a string in any field
deny_string: <literal>
```

Operators: `contains`, `starts_with`, `ends_with`, `equals`, `not_equals`, `matches` (regex)

**Allowlist semantics:** `allow_only` is an affirmative allowlist with exact, case-sensitive matching (no operators). The rule applies to **every** intent the policy evaluates: if the field is missing, non-string, or its value is not listed, the intent is `DENIED` fail-closed with `SIGIL_POLICY_VIOLATION_NOT_ON_ALLOWLIST`. Each line must include at least one value; empty `allow_only` lists reject the policy. Repeat the line for the same field path to extend the value set (entries merge). **Deny rules win:** deny_if/deny_string are evaluated first, so a value matching both a deny rule and the allowlist is denied with the deny rule's code.

### `## soft_limits`
Informational limits flagged for audit but never hard-enforced. Included so the `policyHash` reflects the operator's stated intent.

### `## execution_limits`
Hard ceilings that stop runaway tool loops before the next tool executes.

| Field | Description |
|---|---|
| `max_tool_calls_per_task` | Maximum tool calls for one `intent.task_id`; the next call is `DENIED` |
| `max_tool_calls_per_hour` | Maximum tool calls per API key in the current UTC clock-hour bucket |

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
