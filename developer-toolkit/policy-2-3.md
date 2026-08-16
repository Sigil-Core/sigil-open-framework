---
title: "Policy 2.3 response controls"
description: "Local redaction, operator scanner adapters, time-bounded observe mode, and the final authoring capability matrix."
---

# Policy 2.3 response controls

Policy 2.3 extends exact Policy 2.2 MCP result inspection with deterministic
redaction, operator-hosted scanner evidence, and time-bounded observation.
These controls run after an exact covered `tools/call` completes and before its
result reaches the client. They do not change outbound intent authorization.

## Policy source

Declare Release 2 controls under `## mcp` alongside the exact Policy 2.2 tool
mappings:

```markdown
version: 2.3.0

## mcp
allowed_servers: browser, http
allowed_tools: browser.open, http.request
response.web_fetch_tools: browser.open
response.http_tools: http.request
response.deterministic_ruleset: sof-response-rules-v1
response.block_classes: malicious_url, prompt_injection
response.redact_classes: pii, secret
response.scanner.required: true
response.scanner.profile: operator-presidio-v1
response.scanner.classes: pii, prompt_injection
response.scanner.min_confidence: 0.85
response.observe_classes: prompt_injection
response.observe_until: 2026-09-05T00:00:00Z
```

The initial class catalog is `prompt_injection`, `secret`, `malicious_url`, and
`pii`. Unknown classes fail validation. The scanner profile is an opaque
operator-configured identifier, never a URL. Endpoints and credentials remain
runtime configuration. Confidence is a canonical decimal from `0` through `1`
with at most four fractional digits. Observe classes require a canonical UTC
RFC 3339 expiry.

## Decision order

The local enforcement order is `BLOCK`, then `REDACT`, then `ALLOW`.

- `BLOCK` returns a stable proxy-generated MCP error without upstream content.
- `REDACT` replaces only digest-bound UTF-8 ranges that map back to covered text
  fields. Spans must be valid and are merged deterministically.
- `ALLOW` forwards the original SDK-decoded result once.
- Observe findings never change the disposition. Content that already triggers
  block or redaction never enters an observe-only scanner or log.

Required-scanner authentication failure, timeout, crash, malformed output,
oversize response, excess findings, invalid offsets, or binding mismatch fails
closed. Optional-scanner failure records no-content evidence and deterministic
evaluation continues.

## Scanner adapter boundary

Sigil defines and verifies the scanner protocol. Sigil does not host a scanner,
response content, models, or weights, and it does not ship scanner code.
Microsoft Presidio is an operator-hosted reference adapter only.

The scanner request is bounded and binds protocol version, execution ID, policy
hash, profile, content digest and length, content type, deadline, and declared
classes. The authenticated response repeats those bindings and adds scanner
identity, ruleset version, and bounded findings. Operators own endpoint
allowlisting, certificates, rotation, availability, model licensing, and the
scanner's runtime.

## Privacy boundary

Raw response content stays inside the operator trust boundary. It is processed
only in the maintained Sigil MCP Proxy path, Agent Hooks, and an operator-hosted
scanner. It never goes to hosted Sigil Sign, logs, metrics, traces, hosted
receipts, Notion, or the durable execution ledger.

Evidence may contain digests, lengths, classes, rule IDs, scanner identity,
timing, disposition, policy binding, and deployment revision. The durable
ledger stores execution state and digests, never the response body.

## Compatibility and rollback

Release 2 consumers accept Policy 2.2 format 1 and Policy 2.3 format 2 without
reinterpreting either format. Release 1 consumers reject Policy 2.3 and format
2. A Policy 2.2 Warrant containing any 2.3-only key is invalid.

Rollback stops Policy 2.3 issuance before reverting consumers. It rejects new
2.3 activation, keeps signed Policy 2.2 operating, preserves no-content
evidence, and alerts. It never treats a Policy 2.3 Warrant as Policy 2.2.

## Limits

- Only exact covered MCP `tools/call` results are inspected.
- `## tool_calls`, client-built-in features, MCP resources, prompts,
  subscriptions, and unknown methods are not result-inspection surfaces.
- Binary and mixed text-binary applicable results fail closed. Image, audio,
  embedded blob, transfer-encoding, and multipart-byte inspection are not
  claimed.
- The maximum decoded UTF-8 projection is 16 MiB, nesting depth is 16,
  findings are capped at 256, scanner responses at 1 MiB, scanner deadlines at
  2 seconds, compiled policy lifetime at 5 minutes, and observe windows at 30
  days.
- A blocked post-execution result prevents disclosure but cannot undo the
  upstream side effect.

## Authoring capability matrix

This is the generated matrix for the current policy family. It comes from the
exact released `@sigilcore/warrant-core` manifest. A guided surface either
preserves a supported control or rejects the import before mutating policy
state.

{/* BEGIN GENERATED CURRENT POLICY CAPABILITY MATRIX */}
Source: `@sigilcore/warrant-core@0.4.0`, `AUTHORING_CAPABILITY_MANIFEST`, filtered to `2.3.x` (capability schema v1).

Legend: A = author, I = import, P = preserve without loss, D = deploy. `none` means the surface rejects that field before mutating policy state.

| Deploy feature | Manual Form | Manual Advanced | Warrant Builder |
| --- | --- | --- | --- |
| `policy.version` | `A/I/P/D`: `policy.version` | `A/I/P/D`: `policy.version` | `A/I/P/D`: `policy.version` |
| `signature.sigil-envelope-v1` | `A/D`: `signature.sigil-envelope-v1` | `A/I/P/D`: `signature.sigil-envelope-v1` | `A/D`: `signature.sigil-envelope-v1` |
| `profile.repository` | `A/I/P/D`: `profile.repository`, `profile.repository.roots`, `profile.repository.block_outside_writes`, `profile.repository.protect_git_history`, `profile.repository.protect_sensitive_files`, `profile.repository.git_providers`, `profile.repository.require_shim` | `A/I/P/D`: `profile.repository`, `profile.repository.roots`, `profile.repository.block_outside_writes`, `profile.repository.protect_git_history`, `profile.repository.protect_sensitive_files`, `profile.repository.git_providers`, `profile.repository.require_shim` | `A/I/P/D`: `profile.repository`, `profile.repository.roots`, `profile.repository.block_outside_writes`, `profile.repository.protect_git_history`, `profile.repository.protect_sensitive_files`, `profile.repository.git_providers`, `profile.repository.require_shim` |
| `profile.filesystem` | `none`: `profile.filesystem`, `profile.filesystem.actions`, `profile.filesystem.write_roots`, `profile.filesystem.read_roots`, `profile.filesystem.allowed_effects`, `profile.filesystem.blocked_paths`, `profile.filesystem.protected_file_classes`, `profile.filesystem.protected_class_catalog`, `profile.filesystem.protected_effects`, `profile.filesystem.max_files_per_action`, `profile.filesystem.max_bytes_written_per_task`, `profile.filesystem.max_bytes_deleted_per_task`, `profile.filesystem.max_destructive_effects_per_task`, `profile.filesystem.require_shim` | `A/I/P/D`: `profile.filesystem`, `profile.filesystem.actions`, `profile.filesystem.write_roots`, `profile.filesystem.read_roots`, `profile.filesystem.allowed_effects`, `profile.filesystem.blocked_paths`, `profile.filesystem.protected_file_classes`, `profile.filesystem.protected_class_catalog`, `profile.filesystem.protected_effects`, `profile.filesystem.max_files_per_action`, `profile.filesystem.max_bytes_written_per_task`, `profile.filesystem.max_bytes_deleted_per_task`, `profile.filesystem.max_destructive_effects_per_task`, `profile.filesystem.require_shim` | `none`: `profile.filesystem`, `profile.filesystem.actions`, `profile.filesystem.write_roots`, `profile.filesystem.read_roots`, `profile.filesystem.allowed_effects`, `profile.filesystem.blocked_paths`, `profile.filesystem.protected_file_classes`, `profile.filesystem.protected_class_catalog`, `profile.filesystem.protected_effects`, `profile.filesystem.max_files_per_action`, `profile.filesystem.max_bytes_written_per_task`, `profile.filesystem.max_bytes_deleted_per_task`, `profile.filesystem.max_destructive_effects_per_task`, `profile.filesystem.require_shim` |
| `profile.git` | `none`: `profile.git`, `profile.git.actions`, `profile.git.filesystem_actions`, `profile.git.providers`, `profile.git.allowed_remote_schemes`, `profile.git.allowed_operations`, `profile.git.require_approval`, `profile.git.blocked_operations`, `profile.git.protected_refs`, `profile.git.max_ref_changes_per_task`, `profile.git.require_shim` | `A/I/P/D`: `profile.git`, `profile.git.actions`, `profile.git.filesystem_actions`, `profile.git.providers`, `profile.git.allowed_remote_schemes`, `profile.git.allowed_operations`, `profile.git.require_approval`, `profile.git.blocked_operations`, `profile.git.protected_refs`, `profile.git.max_ref_changes_per_task`, `profile.git.require_shim` | `A/I/P/D`: `profile.git`, `profile.git.actions`, `profile.git.filesystem_actions`, `profile.git.providers`, `profile.git.allowed_remote_schemes`, `profile.git.allowed_operations`, `profile.git.require_approval`, `profile.git.blocked_operations`, `profile.git.protected_refs`, `profile.git.max_ref_changes_per_task`, `profile.git.require_shim` |
| `profile.database` | `none`: `profile.database`, `profile.database.actions`, `profile.database.protected_environments`, `profile.database.allowed_operations`, `profile.database.require_approval`, `profile.database.allowed_resources`, `profile.database.routine_catalog`, `profile.database.require_read_only_for_select`, `profile.database.deny_unreviewed_indirect_effects`, `profile.database.max_schema_changes_per_task`, `profile.database.statement_timeout_ms`, `profile.database.lock_timeout_ms`, `profile.database.require_shim` | `A/I/P/D`: `profile.database`, `profile.database.actions`, `profile.database.protected_environments`, `profile.database.allowed_operations`, `profile.database.require_approval`, `profile.database.allowed_resources`, `profile.database.routine_catalog`, `profile.database.require_read_only_for_select`, `profile.database.deny_unreviewed_indirect_effects`, `profile.database.max_schema_changes_per_task`, `profile.database.statement_timeout_ms`, `profile.database.lock_timeout_ms`, `profile.database.require_shim` | `A/I/P/D`: `profile.database`, `profile.database.actions`, `profile.database.protected_environments`, `profile.database.allowed_operations`, `profile.database.require_approval`, `profile.database.allowed_resources`, `profile.database.routine_catalog`, `profile.database.require_read_only_for_select`, `profile.database.deny_unreviewed_indirect_effects`, `profile.database.max_schema_changes_per_task`, `profile.database.statement_timeout_ms`, `profile.database.lock_timeout_ms`, `profile.database.require_shim` |
| `evm` | `A/I/P/D`: `evm.max_transaction_eth`, `evm.allowed_actions`, `evm.allowed_chains`, `evm.consensus_threshold_eth`, `evm.consensus_require_hold`, `evm.require_approval`, `evm.require_shim` | `A/I/P/D`: `evm.max_transaction_eth`, `evm.allowed_actions`, `evm.allowed_chains`, `evm.consensus_threshold_eth`, `evm.consensus_require_hold`, `evm.require_approval`, `evm.require_shim` | `A/I/P/D`: `evm.max_transaction_eth`, `evm.allowed_actions`, `evm.allowed_chains`, `evm.consensus_threshold_eth`, `evm.consensus_require_hold`, `evm.require_approval`, `evm.require_shim` |
| `evm.chain_actions` | `I/P/D`: `evm.chain_actions` | `A/I/P/D`: `evm.chain_actions` | `A/I/P/D`: `evm.chain_actions` |
| `evm.token` | `A/I/P/D`: `evm.token.*.max_transaction`, `evm.token.*.decimals`, `evm.token.*.addresses` | `A/I/P/D`: `evm.token.*.max_transaction`, `evm.token.*.decimals`, `evm.token.*.addresses` | `A/I/P/D`: `evm.token.*.max_transaction`, `evm.token.*.decimals`, `evm.token.*.addresses` |
| `evm.token.consensus_threshold` | `none`: `evm.token.*.consensus_threshold` | `A/I/P/D`: `evm.token.*.consensus_threshold` | `none`: `evm.token.*.consensus_threshold` |
| `evm.require_calldata_enrichment` | `none`: `evm.require_calldata_enrichment` | `A/I/P/D`: `evm.require_calldata_enrichment` | `none`: `evm.require_calldata_enrichment` |
| `evm.calldata_unknown_selector` | `none`: `evm.calldata_unknown_selector` | `A/I/P/D`: `evm.calldata_unknown_selector` | `none`: `evm.calldata_unknown_selector` |
| `tool_calls` | `A/I/P/D`: `tool_calls.allowed`, `tool_calls.bash.blocked_commands`, `tool_calls.web_fetch.blocked_domains`, `tool_calls.file_write.blocked_paths`, `tool_calls.email.require_approval`, `tool_calls.email.allowed_recipients`, `tool_calls.email.blocked_recipients`, `tool_calls.require_approval`, `tool_calls.require_shim` | `A/I/P/D`: `tool_calls.allowed`, `tool_calls.bash.blocked_commands`, `tool_calls.web_fetch.blocked_domains`, `tool_calls.file_write.blocked_paths`, `tool_calls.email.require_approval`, `tool_calls.email.allowed_recipients`, `tool_calls.email.blocked_recipients`, `tool_calls.require_approval`, `tool_calls.require_shim` | `A/I/P/D`: `tool_calls.allowed`, `tool_calls.bash.blocked_commands`, `tool_calls.web_fetch.blocked_domains`, `tool_calls.file_write.blocked_paths`, `tool_calls.email.require_approval`, `tool_calls.email.allowed_recipients`, `tool_calls.email.blocked_recipients`, `tool_calls.require_approval`, `tool_calls.require_shim` |
| `tool_calls.http` | `A/I/P/D`: `tool_calls.http.allowed_methods`, `tool_calls.http.blocked_methods`, `tool_calls.http.allowed_hosts` | `A/I/P/D`: `tool_calls.http.allowed_methods`, `tool_calls.http.blocked_methods`, `tool_calls.http.allowed_hosts` | `A/I/P/D`: `tool_calls.http.allowed_methods`, `tool_calls.http.blocked_methods`, `tool_calls.http.allowed_hosts` |
| `tool_calls.http.method_rules` | `none`: `tool_calls.http.method_rules`, `tool_calls.http.method_rules.*.require_query_matches`, `tool_calls.http.method_rules.*.deny` | `A/I/P/D`: `tool_calls.http.method_rules`, `tool_calls.http.method_rules.*.require_query_matches`, `tool_calls.http.method_rules.*.deny` | `none`: `tool_calls.http.method_rules`, `tool_calls.http.method_rules.*.require_query_matches`, `tool_calls.http.method_rules.*.deny` |
| `mcp` | `A/I/P/D`: `mcp.allowed_servers`, `mcp.allowed_tools`, `mcp.blocked_tools`, `mcp.require_approval`, `mcp.require_shim` | `A/I/P/D`: `mcp.allowed_servers`, `mcp.allowed_tools`, `mcp.blocked_tools`, `mcp.require_approval`, `mcp.require_shim` | `A/I/P/D`: `mcp.allowed_servers`, `mcp.allowed_tools`, `mcp.blocked_tools`, `mcp.require_approval`, `mcp.require_shim` |
| `mcp.response.web_fetch_tools` | `A/I/P/D`: `mcp.response.web_fetch_tools` | `A/I/P/D`: `mcp.response.web_fetch_tools` | `A/I/P/D`: `mcp.response.web_fetch_tools` |
| `mcp.response.http_tools` | `A/I/P/D`: `mcp.response.http_tools` | `A/I/P/D`: `mcp.response.http_tools` | `A/I/P/D`: `mcp.response.http_tools` |
| `mcp.response.deterministic_ruleset` | `A/I/P/D`: `mcp.response.deterministic_ruleset` | `A/I/P/D`: `mcp.response.deterministic_ruleset` | `A/I/P/D`: `mcp.response.deterministic_ruleset` |
| `mcp.response.block_classes` | `A/I/P/D`: `mcp.response.block_classes` | `A/I/P/D`: `mcp.response.block_classes` | `A/I/P/D`: `mcp.response.block_classes` |
| `mcp.response.redact_classes` | `A/I/P/D`: `mcp.response.redact_classes` | `A/I/P/D`: `mcp.response.redact_classes` | `A/I/P/D`: `mcp.response.redact_classes` |
| `mcp.response.scanner.required` | `A/I/P/D`: `mcp.response.scanner.required` | `A/I/P/D`: `mcp.response.scanner.required` | `A/I/P/D`: `mcp.response.scanner.required` |
| `mcp.response.scanner.profile` | `A/I/P/D`: `mcp.response.scanner.profile` | `A/I/P/D`: `mcp.response.scanner.profile` | `A/I/P/D`: `mcp.response.scanner.profile` |
| `mcp.response.scanner.classes` | `A/I/P/D`: `mcp.response.scanner.classes` | `A/I/P/D`: `mcp.response.scanner.classes` | `A/I/P/D`: `mcp.response.scanner.classes` |
| `mcp.response.scanner.min_confidence` | `A/I/P/D`: `mcp.response.scanner.min_confidence` | `A/I/P/D`: `mcp.response.scanner.min_confidence` | `A/I/P/D`: `mcp.response.scanner.min_confidence` |
| `mcp.response.observe_classes` | `A/I/P/D`: `mcp.response.observe_classes` | `A/I/P/D`: `mcp.response.observe_classes` | `A/I/P/D`: `mcp.response.observe_classes` |
| `mcp.response.observe_until` | `A/I/P/D`: `mcp.response.observe_until` | `A/I/P/D`: `mcp.response.observe_until` | `A/I/P/D`: `mcp.response.observe_until` |
| `custom` | `A/I/P/D`: `custom.allow_only`, `custom.deny_if`, `custom.deny_string`, `custom.require_approval`, `custom.require_shim` | `A/I/P/D`: `custom.allow_only`, `custom.deny_if`, `custom.deny_string`, `custom.require_approval`, `custom.require_shim` | `A/I/P/D`: `custom.allow_only`, `custom.deny_if`, `custom.deny_string`, `custom.require_approval`, `custom.require_shim` |
| `custom.response.deny_string` | `A/I/P/D`: `custom.response.deny_string` | `A/I/P/D`: `custom.response.deny_string` | `A/I/P/D`: `custom.response.deny_string` |
| `soft_limits` | `A/I/P/D`: `soft_limits.daily_evm_limit_eth`, `soft_limits.daily_tool_calls`, `soft_limits.require_approval`, `soft_limits.require_shim` | `A/I/P/D`: `soft_limits.daily_evm_limit_eth`, `soft_limits.daily_tool_calls`, `soft_limits.require_approval`, `soft_limits.require_shim` | `A/I/P/D`: `soft_limits.daily_evm_limit_eth`, `soft_limits.daily_tool_calls`, `soft_limits.require_approval`, `soft_limits.require_shim` |
| `soft_limits.cap` | `A/I/P/D`: `soft_limits.cap.*.max_count`, `soft_limits.cap.*.max_sum_usd`, `soft_limits.cap.*.window`, `soft_limits.cap.*.action`, `soft_limits.cap.*.group_by`, `soft_limits.cap.*.amount_field` | `A/I/P/D`: `soft_limits.cap.*.max_count`, `soft_limits.cap.*.max_sum_usd`, `soft_limits.cap.*.window`, `soft_limits.cap.*.action`, `soft_limits.cap.*.group_by`, `soft_limits.cap.*.amount_field` | `A/I/P/D`: `soft_limits.cap.*.max_count`, `soft_limits.cap.*.max_sum_usd`, `soft_limits.cap.*.window`, `soft_limits.cap.*.action`, `soft_limits.cap.*.group_by`, `soft_limits.cap.*.amount_field` |
| `execution_limits` | `A/I/P/D`: `execution_limits.max_tool_calls_per_task`, `execution_limits.max_tool_calls_per_hour`, `execution_limits.max_model_spend_usd_per_task`, `execution_limits.max_model_tokens_per_task` | `A/I/P/D`: `execution_limits.max_tool_calls_per_task`, `execution_limits.max_tool_calls_per_hour`, `execution_limits.max_model_spend_usd_per_task`, `execution_limits.max_model_tokens_per_task` | `A/I/P/D`: `execution_limits.max_tool_calls_per_task`, `execution_limits.max_tool_calls_per_hour`, `execution_limits.max_model_spend_usd_per_task`, `execution_limits.max_model_tokens_per_task` |
| `execution_limits.require_approval` | `A/I/P/D`: `execution_limits.require_approval` | `A/I/P/D`: `execution_limits.require_approval` | `A/I/P/D`: `execution_limits.require_approval` |
| `execution_limits.require_shim` | `A/I/P/D`: `execution_limits.require_shim` | `A/I/P/D`: `execution_limits.require_shim` | `A/I/P/D`: `execution_limits.require_shim` |
{/* END GENERATED CURRENT POLICY CAPABILITY MATRIX */}

Regenerate the matrix only from the released package:
`node scripts/generate-current-policy-capabilities.cjs --write`. CI and local
verification use `--check` to detect stale capability claims.
