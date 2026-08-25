---
title: "Claude Cowork"
description: "Current Cowork coverage and the planned connector-scoped MCP enforcement gateway, with the plugin hook as an optional signal."
---

## Supported architecture

Cowork does not currently expose a fail-closed third-party boundary for every
native tool. The durable Sigil setup is therefore connector-scoped:

```text
Cowork remote custom connector
        ↓  HTTPS + OAuth
Authenticated Sigil Streamable HTTP gateway
        ↓  authorize exact tools/call with Sigil Sign
DENIED / error / timeout → do not call upstream
PENDING → hold; upstream stays uncalled until an exact-intent
          approval produces a fresh ALLOWED, else reject
ALLOWED                 → forward once
        ↓
Allowlisted upstream MCP server
```

This is an in-path boundary only for calls routed through the registered Sigil
connector. It does not govern Cowork's native file, web, shell, browser,
computer-use, or agent tools, and it does not govern another connector.

<Warning>
  The current `@sigilcore/mcp-proxy` package is client-facing over stdio.
  `--remote` selects a remote **upstream**; it does not expose the server-facing
  Streamable HTTP endpoint Cowork requires. The hosted gateway is a separate P0
  build and is not generally available yet.
</Warning>

<Note>
  **Availability.** The hosted Sigil Sign authorization service, including its
  free tier, is available and is a different product surface. The gap named
  here is the server-facing connector gateway: there is no customer-ready
  gateway deployment or complete OAuth setup runbook today. The P0
  implementation must freeze the protected
  resource metadata URL, authorization-server metadata, client registration,
  redirect URI, scopes, required claims, connector enablement flow, and managed
  organization settings before this page can become an installation guide.
</Note>

## Deployment requirements

For a production connector:

1. Deploy the authenticated Sigil gateway from an immutable reviewed image.
2. Pin one OAuth issuer, exact audience, connector identity, tenant mapping,
   upstream origin, and upstream credential reference on the server.
3. Keep the Sigil key and upstream credential out of Cowork and the endpoint.
4. Disable bypass and warn modes. A Sign error, invalid decision, missing
   ledger, or expired hold must leave the upstream uncalled.
5. Register the exact gateway URL as an organization-owned Cowork custom
   connector.
6. Remove direct access to the same upstream. This removal is a requirement
   of the enforcement claim, not an optimization. If your network and
   Anthropic administration controls cannot remove a direct route, the
   deployment is monitoring plus partial control, not an enforcement
   boundary, and must be described that way.
7. Publish the gateway coverage manifest beside the deployment. It must list
   routed methods, upstream identity, native and parallel bypass routes, hold
   behavior, release digest, and last live proof.

Use Anthropic's managed desktop settings to reduce other surfaces where
appropriate: restrict workspace folders, disable local developer MCP and desktop
extensions when they are not required, require fresh approvals, and avoid broad
always-allow settings. These are compensating host controls, not Sigil
enforcement.

## Cowork plugin hook

`@sigilcore/agent-hooks` exports the Cowork payload adapter and registers the
framework ID `cowork`. It can return a denial when the hook completes, but
Anthropic documents that a timed-out `command`, `http`, or `mcp_tool`
`PreToolUse` hook continues through normal permission flow. Treat the plugin as
`signal_only`, not as the permanent authorization boundary.

The hook is still useful for privacy-bounded telemetry, user feedback, and
detecting policy drift. Do not use a Required plugin setting to imply that the
hook became fail closed; required distribution does not change host timeout or
termination behavior.

## Anthropic Inference Hooks

Anthropic's Enterprise beta Inference Hooks apply across Claude, Cowork, and
Claude Code. The current only event is `prompt`, before inference. A later prompt
may include earlier tool results in its transcript, so the hook can support DLP,
audit, and model-use policy. It does not authorize an outgoing tool call before
execution.

Sigil is preparing a request for an organization-managed pre-execution
`tool_call` event with
allow, deny, exact hold/resume, stable tool identity, normalized arguments,
audit correlation, and administrator-selectable fail-closed handling. Until
Anthropic ships and Sigil verifies that contract, keep the remote gateway as the
enforcement boundary.

## Claim boundary

Supported wording:

> Sigil can enforce signed policy before Cowork calls an MCP server routed
> through the authenticated Sigil gateway. Native Cowork tools and other
> connectors remain outside that boundary.

Do not claim that installing the Cowork plugin, enabling Inference Hooks, or
registering one connector governs Cowork as a whole.

## Windows validation

The gateway is server-side and does not require Windows to implement. Windows
validation begins only after an exact gateway release, connector URL, OAuth
configuration, and coverage manifest are frozen. The Windows task validates
connector discovery, login, enablement, allow/deny behavior, and truthful claim
compatibility; it does not repeat the gateway's server-side security tests.

## References

- [Anthropic: custom remote MCP connectors](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)
- [Anthropic: Cowork architecture](https://support.claude.com/en/articles/14479288-claude-cowork-architecture-overview)
- [Anthropic: Enterprise desktop configuration](https://support.claude.com/en/articles/12622667-enterprise-configuration-for-claude-desktop)
- [Anthropic: Inference Hooks overview](https://support.claude.com/en/articles/16059458-inference-hooks-overview)
- [Anthropic: Inference Hooks technical reference](https://platform.claude.com/docs/en/manage-claude/inference-hooks)
- [Sigil MCP Proxy](../mcp-proxy/overview)
