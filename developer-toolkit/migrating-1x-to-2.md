---
title: "Migrate warranty.md from 1.x to 2.x"
description: "A field-by-field migration path through Policy 2.2, including exact MCP result coverage."
---

# Migrate warranty.md from 1.x to 2.0, 2.1, or 2.2

Policy formats 2.0 through 2.2 keep the 1.x EVM, tool-call, custom, and execution-limit semantics. The version line opts into the new grammar. Policy 2.2 can add inbound inspection for exact covered MCP tool results; it does not add result inspection to `## tool_calls`. Operators must review the new boundaries, sign the resulting file again, and redeploy it before the new controls take effect.

## Migration sequence

1. Copy the signed 1.x policy into a working file.
2. Remove the old `## signature` block and change the root line to `version: 2.0.0`, `version: 2.1.0`, or `version: 2.2.0`.
3. Add only the v2 sections the agent actually uses.
4. Parse and test approved, denied, and pending intents against the new policy.
5. Sign the complete body with Sigil Warrant and deploy the new file.
6. Verify the returned `policyHash` and the first audit records before switching traffic.

For destructive repository, Git, provider, or production database actions, choose Policy 2.1. Configure the repository and resource profiles, then use an adapter that attests the complete effect manifest and owns the final mutation. A preflight-only hook must fail closed and must not be described as final mutation enforcement.

Manual Warrant Advanced Mode can import, validate, preserve, and deploy every Policy 2.1 field that Sign accepts. Use it for filesystem profiles, per-method HTTP rules, EVM calldata enrichment, or any policy that exceeds the structured Form or Builder matrix. It keeps the source bytes intact until you edit them. Any edit detaches the old signature, so sign the complete policy again before deployment.

Warrant Builder supports the repository profile, Git controls, the 28 supported database operations, and exact Policy 2.2 response mappings through its guided controls. It rejects filesystem profiles, per-method HTTP rules, EVM calldata enrichment, and other unsupported fields before changing any Builder state. The structured Manual Form follows its own limits. Check the [current generated capability matrix](/developer-toolkit/policy-2-2#authoring-capability-matrix) before choosing a guided surface.

Manual Warrant's Migration flow uses a strict Version 1 rollback bundle when preparing a migration or rollback. It validates the bundle before use. The bundle contains policy material, not a deployment receipt, and does not prove that either policy was deployed.

## Field mapping

| 1.x need | 2.0 representation | Effect |
|---|---|---|
| HTTP requests | `tool_calls.allowed: http` plus `http.allowed_methods`, `http.blocked_methods`, and `http.allowed_hosts` | Typed method and host checks |
| Action-specific field allowlist | `allow_only[action=<pattern>].<field> <operator>:` | Scoped matching with exact or pattern operators |
| Trusted metadata | Add `attested` to a metadata allow rule | Requires shim-derived provenance |
| MCP server or tool access | `## mcp` with `allowed_servers`, `allowed_tools`, or `blocked_tools` | MCP is deny-by-default without this block |
| Human approval | `require_approval` action patterns in the governing block | Returns `PENDING` with a durable hold |
| Aggregate count or spend | `## soft_limits` named `cap.<name>.*` fields | Enforced after base policy approval |
| Runaway tool loop | `## execution_limits` | Hard denial before the next call |
| Repository writes | `## repository` plus `## filesystem` | Component-aware roots, blocked paths, sensitive-file classes, and impact ceilings |
| Git history and hosted providers | `## git` plus provider metadata | Full ref topology, fast-forward rules, provider operation taxonomy, and approval gates |
| Production database effects | `## database` | Explicit SQL effects, resource allowlists, routine catalogs, read-only transactions, and timeouts |
| Exact inbound MCP tool results | Policy `2.2.0`, exact `mcp.response.*` mappings, and optional `custom.response.deny_string` | Local deterministic `ALLOW` or `BLOCK` in an inspection-enabled Sigil MCP Proxy |

## Example

```markdown
version: 2.0.0

## tool_calls
allowed: http
http.allowed_methods: POST, PATCH
http.allowed_hosts: your-project-ref.supabase.co

## mcp
allowed_servers: buffer
allowed_tools: buffer.create_post
blocked_tools: buffer.delete_*
require_approval: buffer.create_post
require_shim: true

## custom
allow_only[action=mcp.buffer.create_post].metadata.channel attested equals: linkedin-company

## soft_limits
cap.linkedin_posts.max_count: 2
cap.linkedin_posts.window: day
cap.linkedin_posts.action: mcp.buffer.create_post
cap.linkedin_posts.group_by: metadata.channel
```

The exact connector server ID, tool names, and metadata schema must come from the installed connector. Do not promote illustrative names into production without capturing those values from the adapter.

For Policy 2.2, map only exact `serverId.toolName` values that are also exact
members of `allowed_tools`. Do not copy a `## tool_calls` web or HTTP action
into these mappings: those actions remain outside inbound inspection. Release
1 has no redaction, scanner adapter, or observe mode. Follow the
[Policy 2.2 response inspection guide](/developer-toolkit/policy-2-2) before
activating the re-signed Warrant.

## Compatibility and rollback

Existing signed 1.x policies remain valid and keep their original soft-limit behavior. A rollback means restoring the previously signed file and restarting the signer. Keep the old policy hash and deployment record with the migration review.

Use the [conformance vectors](/conformance) to cover the base decision, approval hold, cap behavior, provenance requirement, and public error code before changing the active policy.
