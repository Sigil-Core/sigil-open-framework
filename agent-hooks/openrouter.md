---
title: "OpenRouter"
description: "Gate tool calls from any OpenRouter model against a signed Sigil policy before your host executes them."
---

## Overview

[OpenRouter](https://openrouter.ai) is a model gateway, not an execution runtime.
The model never runs tools itself: it returns a `tool_calls` array, and **your
host code executes the tool and feeds the result back**. That execution boundary
in your host is exactly where Sigil Open Framework (SOF) belongs. Before you run
any tool call OpenRouter returns, submit it to Sigil Sign `/v1/authorize` and
block on `DENIED`.

Because this hooks the execution step rather than any OpenRouter-specific feature,
the same pattern works for every model OpenRouter routes to. Set
`framework: 'openrouter'` so the intents are tagged correctly in your audit log.

This page documents the current host-loop pattern built on `checkIntent`.
`@sigilcore/agent-hooks` does not yet ship a dedicated OpenRouter export.
OpenRouter would benefit from one because tool-call parsing, tool result
serialization, provider usage extraction, and model-budget checks all sit in the
same loop.

## Prerequisites

- A Sigil API key: [sigilcore.com/tools/keys](https://sigilcore.com/tools/keys)
- A signed policy: [sigilcore.com/tools/warrant](https://sigilcore.com/tools/warrant)
- An OpenRouter API key

```bash
npm install @sigilcore/agent-hooks
```

## Usage

Run `checkIntent` on each returned tool call before executing it. Map the
function name to a Sigil action type and pass the parsed arguments through as the
intent fields plus `metadata` for custom policy rules.

```javascript
import { checkIntent, buildRejectionContext } from '@sigilcore/agent-hooks';

const sigilConfig = {
  apiKey: process.env.SIGIL_API_KEY,
  agentId: 'openrouter-agent',
  framework: 'openrouter',
  failMode: 'closed',
};

// Map your tool/function names to Sigil action types.
const TOOL_TO_ACTION = {
  run_shell: 'bash',
  write_file: 'file_write',
  fetch_url: 'web_fetch',
  transfer: 'wallet.transfer',
};

async function executeWithSigil(toolCall, runTool) {
  const name = toolCall.function.name;
  const args = JSON.parse(toolCall.function.arguments || '{}');

  const result = await checkIntent(
    {
      action: TOOL_TO_ACTION[name] ?? name,
      command: args.command,
      path: args.path,
      url: args.url,
      to: args.to,
      amount: args.amount,
      metadata: args,
    },
    sigilConfig,
  );

  if (result.decision !== 'APPROVED') {
    // Feed the rejection back to the model as the tool result.
    return JSON.stringify(buildRejectionContext(result));
  }

  return await runTool(name, args);
}
```

Wire it into the OpenRouter tool-calling loop:

```javascript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ model, messages, tools }),
}).then((r) => r.json());

const message = response.choices[0].message;

if (message.tool_calls) {
  for (const toolCall of message.tool_calls) {
    const toolResult = await executeWithSigil(toolCall, runTool);
    messages.push({
      role: 'tool',
      tool_call_id: toolCall.id,
      content: toolResult,
    });
  }
}
```

## How It Works

```
OpenRouter returns finish_reason: "tool_calls"
        ↓
For each tool call, before executing:
        ↓
checkIntent → POST /v1/authorize → Sigil Sign
        ↓
APPROVED → host executes the tool
DENIED   → rejection JSON returned to the model as the tool result
PENDING  → held; surface for human approval
```

On a non-approval, `buildRejectionContext` produces a typed JSON object the model
understands (`sigil_decision`, `sigil_message`, `sigil_next_steps`), so the agent
adjusts instead of blindly retrying. The model never executes anything: your host
remains the single enforcement point.

## Notes

- This pattern is provider-agnostic. The same `checkIntent` call governs OpenAI,
  Anthropic, Google, and open-weight models served through OpenRouter.
- For Execution Limits v2 model budgets, record provider usage after each model
  response and call `checkModelBudget` before the next model step or tool
  execution. A dedicated OpenRouter adapter should wrap that flow.
- If you also expose MCP servers to the agent, govern those calls with the
  [Sigil MCP Proxy](../mcp-proxy/overview) so MCP tools are authorized at the
  protocol layer as well.
- For multi-turn loops, the [OpenRouter Agent SDK](https://openrouter.ai/docs/agent-sdk/call-model/api-reference)
  manages tool execution for you. Wrap its tool handlers with `executeWithSigil`
  to keep the same enforcement boundary.

## Configuration

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `apiKey` | `string` | Yes | — | Sigil API key (`sk_sigil_...`) |
| `apiUrl` | `string` | No | `https://sign.sigilcore.com` | Sigil Sign endpoint |
| `agentId` | `string` | No | `'agent'` | Agent identifier |
| `framework` | `string` | No | `'agent-hooks'` | Use `'openrouter'` for telemetry and audit routing |
| `failMode` | `'open' \| 'closed'` | No | `'open'` | Block (`closed`) or allow (`open`) when Sigil is unreachable |

## Source

- [github.com/Sigil-Core/agent-hooks](https://github.com/Sigil-Core/agent-hooks) — TypeScript package, MIT License
- [OpenRouter tool calling documentation](https://openrouter.ai/docs/guides/features/tool-calling)
