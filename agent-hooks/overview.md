---
title: "@sigilcore/agent-hooks"
description: "PreToolUse interceptor for autonomous AI agents. Gates tool calls against a signed policy before they execute."
---

## Overview

`@sigilcore/agent-hooks` is the client-side enforcement layer for Sigil. It intercepts an agent's intended tool call **before** it executes, submits it to the Sigil Sign `/v1/authorize` endpoint, and blocks or holds the action based on the policy decision.

Without agent-hooks, Sigil Sign governs EVM transactions only. With agent-hooks, Sigil governs any agent action on any framework — bash commands, HTTP requests, file writes, wallet signing, and email sends.

The TypeScript package is the JavaScript integration surface. Rust hosts use the companion [`agent-hooks-rs`](./rust) crates, which share the same `/v1/authorize` wire fixtures and add a native IronClaw hook adapter.

## Installation

```bash
npm install @sigilcore/agent-hooks
```

## How It Works

Every tool call an agent attempts is intercepted before execution:

```
Agent attempts tool call
        ↓
@sigilcore/agent-hooks
        ↓
POST /v1/authorize → Sigil Sign
        ↓
Policy evaluated against warranty.md
        ↓
APPROVED → tool executes
DENIED   → typed rejection returned to agent
PENDING  → action held for human approval
```

## Supported Frameworks

| Framework | ID | Package | Adapter |
|---|---|---|---|
| Generic TypeScript host | `agent-hooks` | `@sigilcore/agent-hooks` | `checkIntent` |
| Claude Code / Anthropic SDK | `anthropic-sdk` | `@sigilcore/agent-hooks` | `checkAnthropicToolUse` |
| [OpenAI Codex](./codex) | `codex` | `@sigilcore/agent-hooks` | Codex `PreToolUse` hook (Bash) |
| [OpenRouter](./openrouter) | `openrouter` | `@sigilcore/agent-hooks` | `checkIntent` on returned tool calls |
| [Hermes Agent](./hermes) | `hermes` | `@sigilcore/agent-hooks` | Hermes `pre_tool_call` shell hook |
| ELIZA | `eliza` | `@sigilcore/agent-hooks` | `checkElizaAction` |
| LangChain | `langchain` | `@sigilcore/agent-hooks` | `wrapLangChainTool` |
| OpenClaw | `openclaw` | `@sigilcore/agent-hooks` | `createOpenclawSigilHandler` |
| NVIDIA NemoClaw | `nemoclaw` | `@sigilcore/agent-hooks` | `createOpenclawSigilHandler` |
| IronClaw | `ironclaw` | `sigil-agent-hooks-ironclaw` | native Rust `Hook` |
| USD1 AgentPay (WLFI) | `agentpay` | `@sigilcore/agent-hooks` | host-level `checkIntent` wrapper |
| Any framework | custom | TypeScript or Rust | generic client call |

For MCP clients with no pre-tool hook (Claude Desktop, Kimi), govern MCP tool
calls at the transport layer with the [Sigil MCP Proxy](../mcp-proxy/overview).

See the [Framework Registry](../framework-registry) for the full list and custom framework usage.

## Model Budget Brakes

v2-compatible hosts can use `recordModelUsage`, `getModelUsageReport`, `clearModelUsage`, and `checkModelBudget` to enforce `max_model_spend_usd_per_task` and `max_model_tokens_per_task` from `## execution_limits`.

The host or adapter records provider usage after each model call, then sends the cumulative task total to Sigil Sign as `intent.metadata.model_usage` on a `model.inference` check. Sigil evaluates the signed cap deterministically. It does not call the model provider, proxy inference traffic, or calculate pricing from a provider table.

## Governed Actions

| Action | Description |
|---|---|
| `bash` | Shell command execution |
| `web_fetch` | Outbound HTTP requests |
| `file_write` | Filesystem writes |
| `wallet_sign` | EVM wallet signing |
| `email.send` | Outbound email |
| `wallet.transfer` | EVM token transfers |
| `contract.call` | EVM contract calls |

## Prerequisites

You need a Sigil API key and a signed `warranty.md` policy file deployed to Sigil Sign.

- Get an API key: [sigilcore.com/tools/keys](https://sigilcore.com/tools/keys)
- Generate a policy: [sigilcore.com/tools/warrant](https://sigilcore.com/tools/warrant)

## Fail Modes

When Sigil Sign is unreachable, agent-hooks can either fail open or fail closed. Unreachability includes network errors, DNS failures, refused connections, request timeouts, 5xx responses, and non-JSON response bodies.

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
| `failMode: 'open'` | `APPROVED` with `failOpen: true` | Local development and non-financial workflows |
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
