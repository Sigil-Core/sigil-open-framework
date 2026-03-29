---
title: "LangChain"
description: "Use @sigilcore/agent-hooks with LangChain to wrap tools with Sigil policy enforcement."
---

## Installation

```bash
npm install @sigilcore/agent-hooks
```

## Usage

```typescript
import { wrapLangChainTool } from '@sigilcore/agent-hooks';

const config = {
  apiKey: process.env.SIGIL_API_KEY!,
  agentId: 'my-langchain-agent',
};

// Wrap any LangChain tool:
const safeTool = wrapLangChainTool(myTool, config);

// safeTool.call() now checks Sigil policy before executing
// If denied, returns a JSON rejection string the agent can parse
```

## How It Works

`wrapLangChainTool` wraps the tool's `call()` method. When the agent invokes the tool, Sigil evaluates the intent against your `warranty.md` policy first. On approval, the original `call()` executes. On denial or hold, a typed JSON rejection is returned as the tool output.

```typescript
// The wrapped tool behaves identically to the original
// Except every call() is gated by Sigil policy first
const result = await safeTool.call('rm -rf /tmp/important');
// result = '{"sigil_decision":"DENIED","sigil_error_code":"LEX_TOOL_CALL_BLOCKED_COMMAND"...}'
```

The JSON rejection is returned as the tool output string — LangChain agents receive it as a tool result and adjust their reasoning accordingly.

## Configuration

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `apiKey` | `string` | Yes | — | Sigil API key (`sk_sigil_...`) |
| `apiUrl` | `string` | No | `https://sign.sigilcore.com` | Sigil Sign endpoint |
| `agentId` | `string` | No | `'agent'` | Agent identifier |
| `onDenied` | `function` | No | — | Called when action is denied |
| `onPending` | `function` | No | — | Called when action is held |
| `onError` | `function` | No | — | Called on network error |
