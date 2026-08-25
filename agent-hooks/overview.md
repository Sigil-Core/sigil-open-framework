---
title: "@sigilcore/agent-hooks"
description: "Authorization adapters for agent runtimes, with explicit coverage and host-enforcement boundaries."
---

## Overview

`@sigilcore/agent-hooks` supplies authorization adapters for agent runtimes. An
adapter maps an intended action to Sigil Sign `/v1/authorize` and returns the
result in the shape its host expects.

An adapter is an enforcement boundary only when the host invokes it before the
action, honors a denial, and fails closed if the adapter crashes, times out, or
returns malformed output. Some integrations meet that contract. Others are
decision helpers or best-effort callbacks. The table below states the current
boundary for each integration.

The TypeScript package is the JavaScript integration surface. Rust hosts use the companion [`agent-hooks-rs`](./rust) crates, which share the same `/v1/authorize` wire fixtures and add a native IronClaw hook adapter.

## Installation

```bash
npm install @sigilcore/agent-hooks
```

## How It Works

For an in-path integration, the request flow is:

```
Agent attempts tool call
        ↓
@sigilcore/agent-hooks
        ↓
POST /v1/authorize → Sigil Sign
        ↓
Policy evaluated against warranty.md
        ↓
ALLOWED → tool executes
DENIED   → typed rejection returned to agent
PENDING  → held only where the integration implements durable hold resolution;
           otherwise returned as a rejection
```

This diagram does not apply to native or hosted tools outside the named host
boundary. A Sigil MCP server cannot govern another connector, and a host hook
cannot govern tool paths that the host does not send through that hook.

## Supported Frameworks

Some integrations ship as dedicated package exports. Others are documented
patterns built on `checkIntent` because the runtime boundary lives in a script,
host loop, payment wrapper, or transport layer. The dedicated adapters should
grow over time for popular harnesses where a generic call hides important
runtime nuance.

### Enforcement Coverage

| Framework | Current boundary | Required deployment condition |
|---|---|---|
| Generic TypeScript host | Decision helper | Caller must invoke `checkIntent`, use closed mode, and refuse every non-approval. |
| Claude Code command hook | Best-effort callback | A valid deny blocks, but host timeout, crash, or malformed output can continue through normal permission flow. |
| Anthropic Agent SDK tool loop | Decision helper | Call `checkAnthropicToolUse` before the handler and refuse execution when it returns a rejection. |
| [Claude Cowork](./cowork) plugin hook | Signal only | Do not use as an enforcement claim. The in-path connector gateway is a separate planned build; the shipped stdio proxy cannot serve as Cowork's remote connector endpoint. |
| ELIZA | Decision helper | Caller must branch on `checkElizaAction` before the action. |
| LangChain | In-path wrapper | Wrap every governed tool and set `failMode: 'closed'`. Unwrapped tools remain outside coverage. |
| OpenClaw | Blocking host callback | Register the handler for every governed tool, use closed Sign handling, and keep the host's callback-timeout behavior closed. |
| NVIDIA NemoClaw | Unverified | The OpenClaw-shaped adapter exists, but no NemoClaw-specific installation or execution proof has shipped. |
| [OpenAI Codex](./codex) | Best-effort callback | A valid deny blocks supported local tools. Hook failures and hosted tools remain outside the boundary. |
| [Hermes Agent](./hermes) | Best-effort callback | Set both Sigil `failMode: 'closed'` and Hermes `fail_closed: true`; verify the hook is registered. |
| [OpenRouter](./openrouter) | Decision helper | The application owns the tool loop and must call the gate before its handler. |
| USD1 AgentPay (WLFI) | Decision helper | The payment host must refuse signing unless `checkAgentPayTransfer` returns approval. |
| IronClaw | In-path, fail closed | Use the native Rust `Hook`; denial, pending, timeout, and hook errors stop execution. |
| [Sigil MCP Proxy](../mcp-proxy/overview) | In-path, fail closed for routed `tools/call` | Point the client at the proxy and remove direct access to the same upstream. |

### Documented Integration Patterns

| Framework | ID | Package | Current pattern |
|---|---|---|---|
| IronClaw model budgets | `ironclaw` | `sigil-agent-hooks-core` | host wraps model provider calls and invokes Rust model-budget helpers |
| Any framework | custom | TypeScript or Rust | generic client call with runtime-specific glue |

For MCP clients, govern calls at the transport layer with the
[Sigil MCP Proxy](../mcp-proxy/overview). This covers only MCP traffic routed
through that proxy. It does not cover native tools or parallel direct
connectors.

See the [Framework Registry](../framework-registry) for the full list and custom framework usage.

## Model Budget Brakes

v2-compatible hosts can use `recordModelUsage`, `getModelUsageReport`, `clearModelUsage`, and `checkModelBudget` to enforce `max_model_spend_usd_per_task` and `max_model_tokens_per_task` from `## execution_limits`.

The host or adapter records provider usage after each model call, then sends the cumulative task total to Sigil Sign as `intent.metadata.model_usage` on a `model.inference` check. Sigil evaluates the signed cap deterministically. It does not call the model provider, proxy inference traffic, or calculate pricing from a provider table.

The v2 model-budget helper surface ships in both packages. TypeScript hosts use
`recordModelUsage`, `getModelUsageReport`, `clearModelUsage`, and
`checkModelBudget`. Rust hosts use `record_model_usage`,
`get_model_usage_report`, `clear_model_usage`, and `check_model_budget`.

IronClaw's native hook currently sees `BeforeToolCall` events, not provider
usage. Use the Rust core helpers in the host code that wraps model provider
calls, then let the IronClaw hook continue to gate tool execution.

## Governed Actions

| Action | Description |
|---|---|
| `bash` | Shell command execution |
| `web_fetch` | Outbound HTTP requests |
| `http` | Typed outbound HTTP requests with an explicit method; Sign derives host/path/query from the URL |
| `file_write` | Filesystem writes |
| `wallet_sign` | EVM wallet signing |
| `email.send` | Outbound email |
| `wallet.transfer` | EVM token transfers |
| `contract.call` | EVM contract calls |
| `mcp.<serverId>.<toolName>` | MCP tool calls submitted by the transport proxy |

HTTP adapter rule: emit `http` only when the intercepted tool input explicitly contains a valid method. Never infer `GET`; when the method is absent, keep the legacy `web_fetch` action. `web_fetch` has an unknown method and cannot satisfy a non-empty HTTP method allowlist.

MCP calls use the transport proxy's namespaced action and carry the exact
`metadata.serverId`, `metadata.toolName`, and `metadata.arguments` values that
the proxy observed. The action string is a routing identifier. Sign never
splits it to recover policy identity. A normal client-side proxy key has
`agent` provenance because the governed agent can reuse that bearer key. Only a
controlled proxy deployment with a dedicated inaccessible credential receives
`shim` provenance and can satisfy `require_shim: true` or an `attested`
allowlist rule.

## Prerequisites

You need a Sigil API key and a signed `warranty.md` policy file deployed to Sigil Sign.

- Get an API key: [sigilcore.com/tools/keys](https://sigilcore.com/tools/keys)
- Generate a policy: [sigilcore.com/tools/warrant](https://sigilcore.com/tools/warrant)

## Fail Modes

When Sigil Sign is unavailable or returns an unusable response, agent-hooks can
either fail open or fail closed. This covers network errors, DNS failures,
refused connections, request timeouts, 5xx responses, and non-JSON response
bodies. This setting
controls the adapter's result. It cannot repair a host that skips the adapter,
terminates it, or ignores its result.

### TypeScript: `@sigilcore/agent-hooks`

The TypeScript package defaults to `failMode: 'open'` for backward compatibility with v0.1.0.

```typescript
import { checkIntent } from '@sigilcore/agent-hooks';

const result = await checkIntent(intent, {
  apiKey: process.env.SIGIL_API_KEY!,
  agentId: 'production-agent',
  failMode: 'closed',
});
```

| Mode | Unreachable result | Use when |
|---|---|---|
| `failMode: 'open'` | `ALLOWED` with `failOpen: true` | Local development and non-financial workflows |
| `failMode: 'closed'` | `DENIED` with `SIGIL_UNREACHABLE` | Production, externally-visible actions, and wallet or on-chain actions |

In open mode, fallback approvals carry `failOpen: true` so hosts can distinguish an outage fallback from a real policy approval. In closed mode, `buildRejectionContext` tells the agent to pause and retry after connectivity is restored; it does not frame the event as a policy violation.

### Rust: `agent-hooks-rs`

The Rust crates default to `FailMode::Closed` because they have no legacy fail-open behavior to preserve. They expose `FailMode::Open` for development or low-risk workflows.

<Card title="Rust and IronClaw" icon="code" href="/agent-hooks/rust">
  Use `sigil-agent-hooks-core` directly from Rust or `sigil-agent-hooks-ironclaw`
  as a native IronClaw `Hook`.
</Card>

## Source

- [github.com/Sigil-Core/agent-hooks](https://github.com/Sigil-Core/agent-hooks) — TypeScript package, MIT License
- [github.com/Sigil-Core/agent-hooks-rs](https://github.com/Sigil-Core/agent-hooks-rs) — Rust crates, MIT License
