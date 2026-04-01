---
title: "@sigilcore/agent-hooks"
description: "PreToolUse interceptor for autonomous AI agents. Gates tool calls against a signed policy before they execute."
---

## Overview

`@sigilcore/agent-hooks` is the client-side enforcement layer for Sigil. It intercepts an agent's intended tool call **before** it executes, submits it to the Sigil Sign `/v1/authorize` endpoint, and blocks or holds the action based on the policy decision.

Without agent-hooks, Sigil Sign governs EVM transactions only. With agent-hooks, Sigil governs any agent action on any framework — bash commands, HTTP requests, file writes, wallet signing, and email sends.

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

| Framework | ID | Adapter |
|---|---|---|
| Coinbase AgentKit | `agentkit` | `checkAnthropicToolUse` |
| ElizaOS | `eliza` | `checkElizaAction` |
| USD1 AgentPay (WLFI) | `agentpay` | `checkIntent` |
| OpenClaw | `openclaw` | `checkIntent` |
| Nanoclaw | `nanoclaw` | `checkIntent` |
| Ironclaw | `ironclaw` | `checkIntent` |
| Nanobot | `nanobot` | `checkIntent` |
| Hermes Agent | `hermes` | `checkIntent` |
| LangChain | `langchain` | `wrapLangChainTool` |
| Claude Code / Anthropic SDK | `anthropic-sdk` | `checkAnthropicToolUse` |
| OpenAI Agents SDK | `openai-sdk` | `checkIntent` |
| Any framework | (custom) | `checkIntent` (generic) |

See the [Framework Registry](../framework-registry) for the full list and custom framework usage.

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

## Fail-Open Behavior

Network errors to the Sigil Sign API result in a **fail-open APPROVED** decision with a warn log. This is intentional — Sigil is a governance layer, not a kill switch. Agent workflows must not break when Sigil is temporarily unreachable.

Operators who require fail-closed behavior should handle the `onError` callback and implement their own circuit breaker.

## Source

[github.com/Sigil-Core/agent-hooks](https://github.com/Sigil-Core/agent-hooks) — MIT License
