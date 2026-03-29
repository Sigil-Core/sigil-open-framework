---
title: "Claude Code / Anthropic SDK"
description: "Use @sigilcore/agent-hooks with Claude Code and the Anthropic SDK to gate tool calls before execution."
---

## Installation

```bash
npm install @sigilcore/agent-hooks
```

## Usage

```typescript
import { checkAnthropicToolUse } from '@sigilcore/agent-hooks';

const config = {
  apiKey: process.env.SIGIL_API_KEY!,
  agentId: 'my-claude-agent',
};

// In your PreToolUse hook:
const rejection = await checkAnthropicToolUse(toolUseBlock, config);
if (rejection) {
  // Feed rejection back to Claude as a tool_result error
  return rejection;
}
// Otherwise, let the tool execute normally
```

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
    sigil_error_code: 'LEX_TOOL_CALL_BLOCKED_COMMAND',
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
