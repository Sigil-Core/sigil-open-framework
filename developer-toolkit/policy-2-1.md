---
title: "Policy 2.1 destructive-resource safety"
description: "The Policy 2.1 grammar, execution-boundary contract, provider taxonomy, and migration guardrails."
---

# Policy 2.1 destructive-resource safety

Policy 2.1 adds typed resource profiles to `warranty.md`. The profiles describe the effects that a trusted adapter observed. They do not turn an untrusted shell command or a preflight-only hook into a mutation boundary.

## Required execution contract

A Policy 2.1 action requires:

- a `version` in the `2.1.x` family
- structured metadata for the target resource and observed effects
- an adapter version in the `2.1.x` family
- fail-closed execution
- component-aware roots and race-safe path resolution for filesystem mutations
- no exposed outside-root write handles, credentials, or special-file access
- a one-time execution grant bound to the policy hash, effect-manifest hash, adapter, and repository identity for repository-scoped filesystem and Git actions

Repository-scoped filesystem and Git grants MUST include the canonical repository identity. Adapters MUST deny when that identity is missing or does not match the grant. Non-repository profiles may omit the repository identity.

The stable public denial codes include `SIGIL_POLICY_VIOLATION_FILE_TARGET_UNTRUSTED`, `SIGIL_POLICY_VIOLATION_FILE_OUTSIDE_ROOT`, `SIGIL_POLICY_VIOLATION_SENSITIVE_FILE`, `SIGIL_POLICY_VIOLATION_GIT_OPERATION_BLOCKED`, `SIGIL_POLICY_VIOLATION_PROVIDER_OPERATION_BLOCKED`, `SIGIL_POLICY_VIOLATION_DATABASE_OPERATION_NOT_ALLOWED`, `SIGIL_POLICY_VIOLATION_DATABASE_CAPABILITY_UNTRUSTED`, and `SIGIL_POLICY_VIOLATION_EXECUTION_GRANT_INVALID`.

Hosted activation has a separate fail-closed boundary. A destructive Policy
2.1 Warrant must set `require_shim: true` and supply a short-lived,
policy-bound trusted-shim JWT. See [Trusted-shim
activation](/developer-toolkit/trusted-shim-activation). This activation check
does not replace the runtime denials described here.

## Profiles

`## repository` sets the trusted roots, Git provider catalog, sensitive-file protection, and shim requirement. `## filesystem` declares write and read roots, explicit effects, blocked paths, protected classes, and impact limits. `## git` declares provider and remote-scheme allowlists, operation taxonomy, protected refs, ref-change limits, and approval requirements. `## database` declares protected environments, explicit SQL effects, resource patterns, routine catalog, read-only requirements, indirect-effect policy, and statement or lock timeouts.

Bare `*` is not a valid protected database resource. Database adapters must fail closed when parsing or capability attestation fails.

## Provider matrix

The reference provider taxonomy covers `generic`, `github`, `gitlab`, and `bitbucket`. The initial hosted-operation mappings include repository deletion, branch and tag deletion, protection changes, deploy-key changes, credential changes, permission changes, and ownership transfer. Unknown provider operations remain denied.

## Authoring surfaces

`@sigilcore/warrant-core@0.2.1` defines the policy contract that Manual Warrant, Warrant Builder, and Sigil Sign share. Manual Advanced is the complete source-authoring path. It accepts every Policy 2.1 field, validates all independent errors, preserves an unedited signed policy byte-for-byte, and signs and deploys the exact source payload.

Manual Form and Warrant Builder support the subsets in the generated matrix below. Warrant Builder includes guided Git controls and the 28 supported database operations. A guided surface either preserves a supported control or rejects the import before mutating state. It never silently drops or rewrites a policy field. Signed imports use Advanced Mode until an operator explicitly detaches the signature to edit the policy.

The current generated capability matrix follows Policy 2.2. The immutable matrix below preserves the released Policy 2.1 authoring contract for operators maintaining 2.1 deployments; see [Policy 2.2 authoring capabilities](policy-2-2.md#authoring-capability-matrix) for the current family.

{/* BEGIN GENERATED POLICY 2.1 CAPABILITY MATRIX */}
Source: `@sigilcore/warrant-core@0.2.1`, `AUTHORING_CAPABILITY_MANIFEST` (capability schema v1).

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
| `custom` | `A/I/P/D`: `custom.allow_only`, `custom.deny_if`, `custom.deny_string`, `custom.require_approval`, `custom.require_shim` | `A/I/P/D`: `custom.allow_only`, `custom.deny_if`, `custom.deny_string`, `custom.require_approval`, `custom.require_shim` | `A/I/P/D`: `custom.allow_only`, `custom.deny_if`, `custom.deny_string`, `custom.require_approval`, `custom.require_shim` |
| `soft_limits` | `A/I/P/D`: `soft_limits.daily_evm_limit_eth`, `soft_limits.daily_tool_calls`, `soft_limits.require_approval`, `soft_limits.require_shim` | `A/I/P/D`: `soft_limits.daily_evm_limit_eth`, `soft_limits.daily_tool_calls`, `soft_limits.require_approval`, `soft_limits.require_shim` | `A/I/P/D`: `soft_limits.daily_evm_limit_eth`, `soft_limits.daily_tool_calls`, `soft_limits.require_approval`, `soft_limits.require_shim` |
| `soft_limits.cap` | `A/I/P/D`: `soft_limits.cap.*.max_count`, `soft_limits.cap.*.max_sum_usd`, `soft_limits.cap.*.window`, `soft_limits.cap.*.action`, `soft_limits.cap.*.group_by`, `soft_limits.cap.*.amount_field` | `A/I/P/D`: `soft_limits.cap.*.max_count`, `soft_limits.cap.*.max_sum_usd`, `soft_limits.cap.*.window`, `soft_limits.cap.*.action`, `soft_limits.cap.*.group_by`, `soft_limits.cap.*.amount_field` | `A/I/P/D`: `soft_limits.cap.*.max_count`, `soft_limits.cap.*.max_sum_usd`, `soft_limits.cap.*.window`, `soft_limits.cap.*.action`, `soft_limits.cap.*.group_by`, `soft_limits.cap.*.amount_field` |
| `execution_limits` | `A/I/P/D`: `execution_limits.max_tool_calls_per_task`, `execution_limits.max_tool_calls_per_hour`, `execution_limits.max_model_spend_usd_per_task`, `execution_limits.max_model_tokens_per_task` | `A/I/P/D`: `execution_limits.max_tool_calls_per_task`, `execution_limits.max_tool_calls_per_hour`, `execution_limits.max_model_spend_usd_per_task`, `execution_limits.max_model_tokens_per_task` | `A/I/P/D`: `execution_limits.max_tool_calls_per_task`, `execution_limits.max_tool_calls_per_hour`, `execution_limits.max_model_spend_usd_per_task`, `execution_limits.max_model_tokens_per_task` |
| `execution_limits.require_approval` | `A/I/P/D`: `execution_limits.require_approval` | `A/I/P/D`: `execution_limits.require_approval` | `A/I/P/D`: `execution_limits.require_approval` |
| `execution_limits.require_shim` | `A/I/P/D`: `execution_limits.require_shim` | `A/I/P/D`: `execution_limits.require_shim` | `A/I/P/D`: `execution_limits.require_shim` |
{/* END GENERATED POLICY 2.1 CAPABILITY MATRIX */}

This archived matrix is not regenerated by the current Policy 2.2 generator.

The [corpus vectors](../conformance/vectors/) cover the resource profiles and advanced controls. Run the vectors against the selected adapter before relying on an enforcement boundary.

## Migration

Start with the [1.x to 2.x migration guide](/developer-toolkit/migrating-1x-to-2), add the Policy 2.1 profiles only after the adapter contract is available, run the [corpus vectors](../conformance/vectors/), sign the full policy again, and verify the deployed policy hash.
