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

`@sigilcore/mcp-proxy` sits between the client and its MCP servers. Every
`tools/call` request is evaluated against your operator's `warranty.md` policy via
Sigil Sign `/v1/authorize` before it reaches the real server, and is wrapped in a
Sigil Intent Attestation. You change one line in your MCP client config to point a
server at the proxy. No client code changes are required.

```
MCP client (Claude Desktop / Kimi / Codex MCP)
        ↓  tools/call
Sigil MCP Proxy (@sigilcore/mcp-proxy)
        ↓  POST /v1/authorize → Sigil Sign
        ↓
APPROVED → request forwarded to the real MCP server
DENIED   → JSON-RPC error (-32001) returned to the client
PENDING  → call remains blocked; a Class 3-capable signer may resolve the exact held intent or it times out
```

<Note>
  **What this governs.** The proxy governs **MCP tool calls only**. It does not see
  a client's built-in capabilities (Claude Desktop connectors and web search, Codex's
  native Bash and file edits). Pair the proxy with a native hook where one exists:
  [Codex hooks](../agent-hooks/codex) for Bash, [Claude Code](../agent-hooks/claude-code)
  and [Hermes](../agent-hooks/hermes) for full tool coverage. The proxy is the right
  tool precisely where no native hook exists.
</Note>

## Quick Start

```bash
npm install -g @sigilcore/mcp-proxy
export SIGIL_API_KEY=sk_sigil_YOUR_KEY
npx @sigilcore/mcp-proxy -- npx @some/mcp-server
```

Get an API key at [sigilcore.com/tools/keys](https://sigilcore.com/tools/keys) and
generate a signed policy at [sigilcore.com/tools/warrant](https://sigilcore.com/tools/warrant).

## MCP Client Config

Wrap an existing server by changing one line in your MCP client config. The proxy
launches and supervises the upstream server and authorizes every call to it. This
form works in any client that reads a standard `mcpServers` block, including
**Claude Desktop**, **Kimi** (kimi-cli / Kimi Code), and **Codex** MCP config.

```jsonc
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["@sigilcore/mcp-proxy", "--", "npx", "@some/pg-mcp"]
    }
  }
}
```

For Codex, keep the [Codex Bash hook](../agent-hooks/codex) for shell governance
alongside the proxy so both surfaces Codex exposes are covered.

## Configuration

Generate a starter config with `npx @sigilcore/mcp-proxy --init`. Precedence is
CLI flags > environment variables > config file > defaults.

| CLI Flag | Env Var | Config Key | Default |
|---|---|---|---|
| `--key` | `SIGIL_API_KEY` | _(env only)_ | (required) |
| `--sign-url` | `SIGIL_SIGN_URL` | `signUrl` | `https://sign.sigilcore.com` |
| `--log-level` | `SIGIL_LOG_LEVEL` | `logLevel` | `info` |
| `--server-id` | — | `serverId` | derived from command/URL |
| `--server-name` | — | `serverName` | same as serverId |
| `--pending-timeout` | `SIGIL_PENDING_TIMEOUT` | `pendingTimeout` | `30000` |
| `--unsafe-bypass` | _(CLI only)_ | _(CLI only)_ | `false` |
| `--remote` | — | — | — |
| `--port` | — | — | auto |

### Server Identity

- **`serverId`** is the binding identity and is security-critical. It is used in the
  `txCommit` preimage and in policy evaluation. It is auto-derived from the package
  name (stdio) or the full URL (HTTP) when not set explicitly.
- **`serverName`** is a display label for logs only and defaults to `serverId`.

### Action taxonomy and enrichment

Each governed call uses the action `mcp.<serverId>.<toolName>`. The proxy keeps
the binding identity in `metadata.serverId`, the tool name in
`metadata.toolName`, and the complete tool arguments in `metadata.arguments`.
Sign matches MCP policy against those exact metadata values. It does not split
the action string because server IDs may contain dots, slashes, URLs, or scoped
package names.

The `## mcp` block supports exact values and trailing `*` prefix wildcards:

```markdown
version: 2.0.0

## mcp
allowed_servers: buffer
allowed_tools: buffer.create_post
blocked_tools: buffer.delete_*
require_approval: buffer.create_post
```

Without a `## mcp` block, all `mcp.*` actions are denied. Extractors may copy
bounded tool arguments into policy fields, but those fields remain agent
provenance unless the proxy runs behind a dedicated credential that the governed
agent cannot read.

## Fail-Closed by Default

The proxy is fail-closed: when Sigil Sign is unreachable, tool calls are blocked.
To allow ungoverned calls during a Sign outage, pass `--unsafe-bypass`. This option
is intentionally CLI-only (no env var, no config key) so it is always visible in
your MCP client config.

```bash
npx @sigilcore/mcp-proxy --unsafe-bypass -- npx @some/mcp-server
```

Every bypassed call emits an `ungoverned_tool_call` error-level log. Authentication
failures (401) are never bypassed.

The proxy sets `@sigilcore/agent-hooks` `failMode: "closed"` explicitly. It
handles the structured `SIGIL_UNREACHABLE` and `failOpen` result fields, so an
English response message cannot turn an outage into an accidental approval.

## Policy 2.2 and 2.3 result inspection

An inspection-enabled proxy can enforce Policy 2.2 or 2.3 after an exact covered
`tools/call` completes and before its result reaches the client. Coverage comes
only from exact `response.web_fetch_tools` and `response.http_tools` mappings
under `## mcp`. The deterministic local ruleset returns `ALLOW` or `BLOCK`;
blocked disclosure carries no result content.

This does not inspect `## tool_calls`, built-in client features, MCP resources,
prompts, subscriptions, or unknown methods. An inspection profile refuses
those MCP methods, and cannot be combined with `--unsafe-bypass`. Policy 2.2
returns `ALLOW` or `BLOCK`. Policy 2.3 can also redact mapped UTF-8 ranges, use
an authenticated operator-hosted scanner, and record time-bounded observe
findings that never change disposition. Raw content stays inside the operator
trust boundary and never reaches hosted Sigil Sign, the durable ledger, logs,
metrics, traces, or hosted receipts. See [Policy 2.3 response controls](/developer-toolkit/policy-2-3)
for the scanner boundary, rollback order, exact grammar, and limitations.

## HTTP/SSE Transport

Proxy a remote MCP server with `--remote`:

```bash
npx @sigilcore/mcp-proxy --remote https://api.example.com/mcp
```

Remote servers often require auth. Configure upstream headers in your config file
using environment variable references. Every header value must reference at least
one `$IDENTIFIER` env var; raw secrets are rejected at load time.

```json
{
  "upstream": {
    "headers": {
      "Authorization": "Bearer $UPSTREAM_TOKEN",
      "X-Custom-Header": "$CUSTOM_HEADER_VALUE"
    }
  }
}
```

A convenience shortcut for the Authorization header:

```bash
export SIGIL_UPSTREAM_AUTH="Bearer sk-abc123..."
npx @sigilcore/mcp-proxy --remote https://api.example.com/mcp
```

## Extractors

Map tool arguments to Sigil policy fields in `sigil.config.json` so the right
`warranty.md` rules apply. For example, route a fetch tool's `url` argument to the
`web_fetch` policy field and a write tool's `path` argument to `file_write`:

```json
{
  "extractors": {
    "fetch": { "url": "url" },
    "write_file": { "path": "path" }
  }
}
```

## Error Codes

- `-32001` — Sigil policy denial (DENIED, fail-closed block, or hold timeout)
- `-32002` — Sigil authentication failure (invalid API key)

## Conformance

The proxy is a client of the SOF enforcement specification, not a signer. It
submits intents and acts on decisions; the authorization itself is issued by Sigil
Sign or any [conforming signer](../conformance). The intent wire format is the same
`/v1/authorize` contract used by every agent-hooks adapter, documented in
[Getting Started](../getting-started) and [sigil-attestations](../sigil-attestations).

## Source

- npm: [@sigilcore/mcp-proxy](https://www.npmjs.com/package/@sigilcore/mcp-proxy) — MIT License
