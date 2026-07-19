---
title: "Policy 2.1 destructive-resource safety"
description: "The Policy 2.1 grammar, execution-boundary contract, provider taxonomy, and migration guardrails."
---

# Policy 2.1 destructive-resource safety

Policy 2.1 adds typed resource profiles to `warranty.md`. The profiles describe the effects that a trusted adapter observed. They do not turn an untrusted shell command or a preflight-only hook into a mutation boundary.

## Required execution contract

A Policy 2.1 action requires:

- `version: 2.1.0`
- structured metadata for the target resource and observed effects
- an adapter version in the `2.1.x` family
- fail-closed execution
- component-aware roots and race-safe path resolution for filesystem mutations
- no exposed outside-root write handles, credentials, or special-file access
- a one-time execution grant bound to the policy hash, effect-manifest hash, adapter, and repository identity for repository-scoped filesystem and Git actions

Repository-scoped filesystem and Git grants MUST include the canonical repository identity. Adapters MUST deny when that identity is missing or does not match the grant. Non-repository profiles may omit the repository identity.

The stable public denial codes include `SIGIL_POLICY_VIOLATION_FILE_TARGET_UNTRUSTED`, `SIGIL_POLICY_VIOLATION_FILE_OUTSIDE_ROOT`, `SIGIL_POLICY_VIOLATION_SENSITIVE_FILE`, `SIGIL_POLICY_VIOLATION_GIT_OPERATION_BLOCKED`, `SIGIL_POLICY_VIOLATION_PROVIDER_OPERATION_BLOCKED`, `SIGIL_POLICY_VIOLATION_DATABASE_OPERATION_NOT_ALLOWED`, `SIGIL_POLICY_VIOLATION_DATABASE_CAPABILITY_UNTRUSTED`, and `SIGIL_POLICY_VIOLATION_EXECUTION_GRANT_INVALID`.

## Profiles

`## repository` sets the trusted roots, Git provider catalog, sensitive-file protection, and shim requirement. `## filesystem` declares write and read roots, explicit effects, blocked paths, protected classes, and impact limits. `## git` declares provider and remote-scheme allowlists, operation taxonomy, protected refs, ref-change limits, and approval requirements. `## database` declares protected environments, explicit SQL effects, resource patterns, routine catalog, read-only requirements, indirect-effect policy, and statement or lock timeouts.

Bare `*` is not a valid protected database resource. Database adapters must fail closed when parsing or capability attestation fails.

## Provider matrix

The reference provider taxonomy covers `generic`, `github`, `gitlab`, and `bitbucket`. The initial hosted-operation mappings include repository deletion, branch and tag deletion, protection changes, deploy-key changes, credential changes, permission changes, and ownership transfer. Unknown provider operations remain denied.

## Authoring surfaces

Warrant Builder supports Policy 2.1 through the `## repository` profile only: exactly one repository root, `git_providers` limited to `generic` and `github`, and the trusted execution shim required. A signed 2.1 policy with a supported repository profile loads losslessly. An import containing `## filesystem`, `## git`, or `## database` blocks is rejected without changing any field.

Manual Warrant applies the same import contract. Its repository section exposes outside-write protection, Git-history protection, and sensitive-file protection, and it rejects imports containing `## filesystem`, `## git`, or `## database` blocks.

The full resource profiles exercised by the [corpus vectors](../conformance/vectors/) are authored by hand or compiled from existing compliance documents with Sigil GRC, then signed. The authoring surfaces fail closed on these blocks instead of round-tripping them lossily.

## Migration

Start with the [1.x to 2.x migration guide](migrating-1x-to-2.md), add the Policy 2.1 profiles only after the adapter contract is available, run the [corpus vectors](../conformance/vectors/), sign the full policy again, and verify the deployed policy hash.
