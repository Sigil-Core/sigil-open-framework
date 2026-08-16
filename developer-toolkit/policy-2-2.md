---
title: "Policy 2.2 response inspection"
description: "Exact MCP result coverage and deterministic ALLOW or BLOCK enforcement in the maintained Sigil MCP Proxy path."
---

# Policy 2.2 response inspection

Policy 2.2 adds deterministic inspection of selected inbound MCP tool results.
This is separate from the outbound intent decision made before a tool call.
Inbound enforcement exists only when the call traverses an inspection-enabled
Sigil MCP Proxy and the exact tool is covered by the Warrant.

## Exact coverage

Declare response mappings under `## mcp`:

```markdown
version: 2.2.0

## mcp
allowed_servers: browser, http
allowed_tools: browser.open, http.request
response.web_fetch_tools: browser.open
response.http_tools: http.request
response.deterministic_ruleset: sof-response-rules-v1
response.block_classes: malicious_url, prompt_injection, secret

## custom
response.deny_string: "ignore all previous instructions"
```

Each mapped value is an opaque, fully qualified `serverId.toolName` token and
must be an exact member of `allowed_tools`. Values are sorted, unique, and
nonempty. Wildcards, aliases, guessed categories, and mappings outside
`## mcp` are rejected.

`response.deny_string` is a response-result literal rule. The existing bare
`deny_string` remains an outbound intent rule; it does not inspect results.

## Release 1 decision

For a covered `tools/call`, the proxy projects the SDK-decoded UTF-8 result
within fixed byte, depth, and collection bounds. The pinned deterministic
ruleset returns one terminal decision:

- `ALLOW`: the original result is forwarded once.
- `BLOCK`: disclosure is denied with stable no-content metadata.

Binary data, oversize or over-nested results, invalid or expired policy
envelopes, evaluator errors, missing execution state, and ambiguous coverage
fail closed. Release 1 does not redact content and does not call a scanner,
model, network service, or content telemetry sink.

## Limits

- Only exact covered MCP `tools/call` results are inspected.
- `## tool_calls` actions, including similarly named web or HTTP actions, are
  not covered.
- MCP resources, prompts, subscriptions, and unknown methods are not result
  inspection surfaces. An inspection-enabled proxy refuses them.
- Policy 2.2 has `ALLOW` and `BLOCK` only. Redaction, scanner adapters, and
  observe mode belong to Policy 2.3 and require format 2.
- Sigil does not host response content. Deterministic inspection runs locally
  in the maintained proxy path.

Older Policy 0.x through 2.1.x Warrants retain their prior bytes, hashes, and
behavior unless an operator explicitly authors and signs a 2.2 Warrant.

## Authoring capability matrix

This matrix records the released Policy 2.2 authoring contract. It remains here
for operators maintaining format 1 Warrants. Use the [current Policy 2.3
capability matrix](policy-2-3.md#authoring-capability-matrix) for new Warrants.

{/* BEGIN GENERATED CURRENT POLICY CAPABILITY MATRIX */}
Source: `@sigilcore/warrant-core@0.3.0`, `AUTHORING_CAPABILITY_MANIFEST`, filtered to `2.2.x` (capability schema v1).

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
| `custom` | `A/I/P/D`: `custom.allow_only`, `custom.deny_if`, `custom.deny_string`, `custom.require_approval`, `custom.require_shim` | `A/I/P/D`: `custom.allow_only`, `custom.deny_if`, `custom.deny_string`, `custom.require_approval`, `custom.require_shim` | `A/I/P/D`: `custom.allow_only`, `custom.deny_if`, `custom.deny_string`, `custom.require_approval`, `custom.require_shim` |
| `custom.response.deny_string` | `A/I/P/D`: `custom.response.deny_string` | `A/I/P/D`: `custom.response.deny_string` | `A/I/P/D`: `custom.response.deny_string` |
| `soft_limits` | `A/I/P/D`: `soft_limits.daily_evm_limit_eth`, `soft_limits.daily_tool_calls`, `soft_limits.require_approval`, `soft_limits.require_shim` | `A/I/P/D`: `soft_limits.daily_evm_limit_eth`, `soft_limits.daily_tool_calls`, `soft_limits.require_approval`, `soft_limits.require_shim` | `A/I/P/D`: `soft_limits.daily_evm_limit_eth`, `soft_limits.daily_tool_calls`, `soft_limits.require_approval`, `soft_limits.require_shim` |
| `soft_limits.cap` | `A/I/P/D`: `soft_limits.cap.*.max_count`, `soft_limits.cap.*.max_sum_usd`, `soft_limits.cap.*.window`, `soft_limits.cap.*.action`, `soft_limits.cap.*.group_by`, `soft_limits.cap.*.amount_field` | `A/I/P/D`: `soft_limits.cap.*.max_count`, `soft_limits.cap.*.max_sum_usd`, `soft_limits.cap.*.window`, `soft_limits.cap.*.action`, `soft_limits.cap.*.group_by`, `soft_limits.cap.*.amount_field` | `A/I/P/D`: `soft_limits.cap.*.max_count`, `soft_limits.cap.*.max_sum_usd`, `soft_limits.cap.*.window`, `soft_limits.cap.*.action`, `soft_limits.cap.*.group_by`, `soft_limits.cap.*.amount_field` |
| `execution_limits` | `A/I/P/D`: `execution_limits.max_tool_calls_per_task`, `execution_limits.max_tool_calls_per_hour`, `execution_limits.max_model_spend_usd_per_task`, `execution_limits.max_model_tokens_per_task` | `A/I/P/D`: `execution_limits.max_tool_calls_per_task`, `execution_limits.max_tool_calls_per_hour`, `execution_limits.max_model_spend_usd_per_task`, `execution_limits.max_model_tokens_per_task` | `A/I/P/D`: `execution_limits.max_tool_calls_per_task`, `execution_limits.max_tool_calls_per_hour`, `execution_limits.max_model_spend_usd_per_task`, `execution_limits.max_model_tokens_per_task` |
| `execution_limits.require_approval` | `A/I/P/D`: `execution_limits.require_approval` | `A/I/P/D`: `execution_limits.require_approval` | `A/I/P/D`: `execution_limits.require_approval` |
| `execution_limits.require_shim` | `A/I/P/D`: `execution_limits.require_shim` | `A/I/P/D`: `execution_limits.require_shim` | `A/I/P/D`: `execution_limits.require_shim` |
{/* END GENERATED CURRENT POLICY CAPABILITY MATRIX */}

This Policy 2.2 snapshot is no longer regenerated. The current-family generator
targets Policy 2.3.
