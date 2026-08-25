---
title: "Claude Code / Anthropic Agent SDK"
description: "Use @sigilcore/agent-hooks with Anthropic tool loops and understand the different Claude Code hook boundary."
---

## Installation

```bash
npm install @sigilcore/agent-hooks
```

## Adapter Status

The Anthropic Agent SDK has a dedicated result helper:
`checkAnthropicToolUse`. The helper returns a `tool_result` error block. Your
SDK tool loop must call it before execution and must not execute the tool when
it returns a rejection.

Claude Code command hooks use a different host contract. A valid
`PreToolUse` denial can block a covered call, but a command-hook timeout,
process failure, or malformed result can continue through Claude Code's normal
permission flow. Do not describe a Claude Code command hook as a complete
fail-closed boundary.

Use the generic model-budget helpers
`recordModelUsage` and `checkModelBudget` around Anthropic SDK responses when
the host owns the model loop and can read response usage.

HTTP note: emit a typed `http` intent only when the intercepted tool input explicitly contains a valid method. Otherwise retain `web_fetch`; never infer `GET`.

## Usage

```typescript
import { checkAnthropicToolUse } from '@sigilcore/agent-hooks';

const config = {
  apiKey: process.env.SIGIL_API_KEY!,
  agentId: 'my-claude-agent',
};

// In your Anthropic SDK tool loop, before the handler:
const rejection = await checkAnthropicToolUse(toolUseBlock, config);
if (rejection) {
  // Feed rejection back to Claude as a tool_result error
  return rejection;
}
// Otherwise, invoke the tool handler.
```

<Warning>
  `checkAnthropicToolUse` does not register itself with Claude Code and cannot
  stop a tool if the host never calls it. For Claude Code command hooks, test
  both a policy denial and a hook timeout before making a coverage claim.
</Warning>

## Tool Name Mapping

`checkAnthropicToolUse` maps Anthropic tool names to Sigil action types automatically:

| Anthropic Tool | Sigil Action |
|---|---|
| `Bash`, `bash` | `bash` |
| `WebSearch`, `WebFetch` | `web_fetch` |
| `Write`, `Edit` | `file_write` |
| `computer` | `bash` |
| Any other tool | lowercased tool name |

## What Gets Sent to Sigil

For each tool call, the following intent is submitted to `/v1/authorize`:

```typescript
{
  action: 'bash',                    // mapped from tool name
  command: block.input['command'],   // bash only
  url: block.input['url'],           // web_fetch only
  path: block.input['path'],         // file_write only
  metadata: block.input,             // full input for custom rules
}
```

## Rejection Response

When Sigil denies or holds an action, `checkAnthropicToolUse` returns a `tool_result` error block that Claude understands:

```typescript
{
  type: 'tool_result',
  tool_use_id: block.id,
  content: JSON.stringify({
    sigil_decision: 'DENIED',
    sigil_error_code: 'SIGIL_POLICY_VIOLATION_BLOCKED_COMMAND',
    sigil_message: 'Command contains blocked string: rm -rf',
    sigil_action_taken: 'halted',
    sigil_next_steps: 'Do not attempt to reframe or retry this action.',
  }),
  is_error: true,
}
```

Claude will receive this as a tool error and adjust its behavior accordingly.

## Configuration

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `apiKey` | `string` | Yes | — | Sigil API key (`sk_sigil_...`) |
| `apiUrl` | `string` | No | `https://sign.sigilcore.com` | Sigil Sign endpoint |
| `agentId` | `string` | No | `'agent'` | Agent identifier |
| `onDenied` | `function` | No | — | Called when action is denied |
| `onPending` | `function` | No | — | Called when action is held |
| `onError` | `function` | No | — | Called on network error |
