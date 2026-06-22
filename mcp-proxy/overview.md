---
title: "Sigil MCP Proxy"
description: "Govern MCP tool calls from Claude Desktop, Kimi, and other MCP clients that have no native pre-tool hook."
---

## Overview

Some of the most popular agent surfaces are **MCP clients with no pre-tool hook**.
Claude Desktop and Kimi run tools exclusively through Model Context Protocol
servers and expose no place to run a policy check before a tool fires. Codex fires
hooks for Bash but not for MCP calls. For this entire class of client, the
enforcement point is the MCP transport itself.

The Sigil MCP Proxy sits between the client and its MCP servers. Every
`tools/call` request passes through the proxy, which submits the intent to Sigil
Sign `/v1/authorize` and forwards, holds, or rejects the call based on the policy
decision. The client is configured to point at the proxy instead of at the raw
servers, so no client code changes are required.

```
MCP client (Claude Desktop / Kimi / Codex MCP)
        ↓  tools/call
Sigil MCP Proxy
        ↓  POST /v1/authorize → Sigil Sign
        ↓
APPROVED → request forwarded to the real MCP server
DENIED   → JSON-RPC error returned to the client
PENDING  → call held for human approval
```

<Note>
  **What this governs.** The proxy governs **MCP tool calls only**. It does not see
  a client's built-in capabilities (Claude Desktop connectors and web search, Codex's
  native Bash and file edits). Pair the proxy with a native hook where one exists:
  [Codex hooks](../agent-hooks/codex) for Bash, [Claude Code](../agent-hooks/claude-code)
  and [Hermes](../agent-hooks/hermes) for full tool coverage. The proxy is the right
  tool precisely where no native hook exists.
</Note>

<Note>
  **Status.** The reference proxy is being open-sourced as `@sigilcore/mcp-proxy`.
  The enforcement contract described below (intercept `tools/call`, authorize against
  `/v1/authorize`, map the decision to a JSON-RPC result or error) is stable, and you
  can implement it against any MCP proxy today. Installation specifics will land here
  when the package publishes.
</Note>

## Why a Proxy

A native pre-tool hook is always preferable when the client has one, because it
sees every action the agent takes. MCP clients without hooks leave only one
interception point that does not require forking the client: the MCP wire between
the client and its tool servers. A proxy on that wire is transparent to the
client, framework-agnostic, and governs every MCP server the client is configured
to use, in one place.

## How It Works

1. The proxy speaks MCP to the client and to each upstream server. It advertises
   the upstream tool catalog unchanged, so the agent sees the same tools.
2. On every `tools/call`, the proxy builds a Sigil intent from the tool name and
   arguments, mapping the MCP tool name to a Sigil action type (for example a
   filesystem write tool maps to `file_write`).
3. It submits the intent to `/v1/authorize` with `framework` set to the client
   (`claude-desktop`, `kimi`, or `mcp-proxy` generically).
4. On `APPROVED` it forwards the call to the upstream server and returns the
   result. On `DENIED` it returns a JSON-RPC error carrying the policy reason. On
   `PENDING` it holds the call for human approval.

## Configuring Claude Desktop

Claude Desktop loads MCP servers from its configuration file (or a Desktop
Extension). Point each governed server at the Sigil MCP Proxy instead of invoking
it directly, passing the real server command and your Sigil credentials to the
proxy. The proxy launches and supervises the upstream server and authorizes every
call to it.

The proxy command line takes the upstream server invocation it should wrap, your
`SIGIL_API_KEY`, and the `framework` identifier to record in the audit log. Exact
flags ship with the package.

## Configuring Kimi

Kimi (kimi-cli / Kimi Code) is an MCP client with a tool-call approval flow.
Register the Sigil MCP Proxy as the MCP server entry in the Kimi MCP
configuration, wrapping the upstream server the same way as above. Sigil policy
decisions then gate Kimi's MCP tool calls before Kimi's own approval prompt.

## Governing Codex MCP Calls

Codex hooks intercept Bash but not MCP. Configure Codex's MCP servers to run
through the Sigil MCP Proxy so MCP `tools/call` requests are authorized at the
transport layer, and keep the [Codex Bash hook](../agent-hooks/codex) for shell
governance. Together they cover both surfaces Codex exposes.

## Fail Mode

Like the agent-hooks adapters, the proxy supports fail-open and fail-closed
behavior when Sigil Sign is unreachable. Run fail-closed in any environment that
touches production, external systems, or on-chain actions, so an outage blocks
rather than silently permits a governed call.

## Conformance

The proxy is a client of the SOF enforcement specification, not a signer. It
submits intents and acts on decisions; the authorization itself is issued by Sigil
Sign or any [conforming signer](../conformance). The intent wire format is the
same `/v1/authorize` contract used by every agent-hooks adapter, documented in
[Getting Started](../getting-started) and [sigil-attestations](../sigil-attestations).
