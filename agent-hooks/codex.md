---
title: "OpenAI Codex"
description: "Gate Codex CLI tool calls against a signed Sigil policy using Codex hooks."
---

## Overview

[Codex CLI](https://developers.openai.com/codex/cli) ships a Claude-style hook
system. A `PreToolUse` hook runs a script before a tool executes and can block
it. Sigil Open Framework (SOF) plugs into that hook: the script forwards the
intended action to Sigil Sign `/v1/authorize` and blocks when the policy returns
`DENIED`.

<Note>
  **Coverage today.** A valid Codex `PreToolUse` denial blocks supported Bash,
  `exec_command`, `apply_patch`, MCP, and the local function-tool calls that
  the registered matchers cover.
  Hosted tools, specialized paths, and continued `write_stdin` streams are not
  fully covered. A hook crash, timeout, malformed output, or unsupported output
  can also leave the host call on its normal path. Treat this as a guardrail,
  not a complete enforcement boundary.
  For broader MCP governance, route tools through the
  [Sigil MCP Proxy](../mcp-proxy/overview). Track the
  [Codex hooks docs](https://developers.openai.com/codex/hooks) as coverage expands.
</Note>

HTTP note: Codex emits typed `http` only when a web tool input explicitly carries a valid method. Web inputs without a method remain `web_fetch`; the adapter never infers `GET`.

## Prerequisites

You need a Sigil API key and a signed `warranty.md` policy file deployed to Sigil Sign.

- Get an API key: [sigilcore.com/tools/keys](https://sigilcore.com/tools/keys)
- Generate a policy: [sigilcore.com/tools/warrant](https://sigilcore.com/tools/warrant)

Node.js 18 or newer is required for the hook script below.

## 1. Register the PreToolUse hook

Hooks are enabled by default in current Codex releases. Use the canonical
`hooks` configuration. The older `codex_hooks` feature flag is deprecated.

In `~/.codex/hooks.json` (global) or `<repo>/.codex/hooks.json` (per project):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.codex/hooks/sigil-pretooluse.mjs",
            "statusMessage": "Sigil policy check"
          }
        ]
      },
      {
        "matcher": "exec_command",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.codex/hooks/sigil-pretooluse.mjs",
            "statusMessage": "Sigil policy check"
          }
        ]
      },
      {
        "matcher": "apply_patch",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.codex/hooks/sigil-pretooluse.mjs",
            "statusMessage": "Sigil policy check"
          }
        ]
      },
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.codex/hooks/sigil-pretooluse.mjs",
            "statusMessage": "Sigil policy check"
          }
        ]
      },
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.codex/hooks/sigil-pretooluse.mjs",
            "statusMessage": "Sigil policy check"
          }
        ]
      },
      {
        "matcher": "mcp__filesystem__read_file",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.codex/hooks/sigil-pretooluse.mjs",
            "statusMessage": "Sigil policy check"
          }
        ]
      }
    ]
  }
}
```

## 2. Add the hook script

Install the package in a location the script can resolve, then create
`~/.codex/hooks/sigil-pretooluse.mjs`:

```bash
npm install -g @sigilcore/agent-hooks
```

```javascript
#!/usr/bin/env node
import { createCodexPreToolUseHook } from '@sigilcore/agent-hooks';

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
const hook = createCodexPreToolUseHook({
  apiKey: process.env.SIGIL_API_KEY,
  agentId: 'codex-cli',
  failMode: 'closed',
});

const output = await hook(payload);
if (output) {
  process.stdout.write(JSON.stringify(output));
}

process.exit(0);
```

Make the package resolvable to the script (a global install plus
`NODE_PATH=$(npm root -g)` in your shell profile is the simplest path), set
`SIGIL_API_KEY` in your environment, and Codex will check Bash, file edits, and
the registered MCP tools against your policy before they run. Add one matcher
entry per MCP tool name you expose.

The adapter resolves task ids in this order: `config.taskId`, `session_id`,
`conversation_id`, `run_id`, `turn_id`, then `SIGIL_TASK_ID`. `## execution_limits`
uses this value to apply per-task tool-call ceilings.

## How It Works

Codex pipes a JSON payload to the hook on `stdin`. The adapter maps Bash to
`bash`, `apply_patch`/`Edit`/`Write` to `file_write`, and MCP tool names to their
lowercase canonical names. On a `DENIED` or `PENDING` decision it writes the
documented Codex `hookSpecificOutput.permissionDecision = "deny"` shape to
`stdout`. Codex then refuses the tool call and returns the reason to the model.

```
Codex about to run Bash
        ↓
PreToolUse hook (sigil-pretooluse.mjs)
        ↓
createCodexPreToolUseHook maps the tool → POST /v1/authorize → Sigil Sign
        ↓
ALLOWED → command runs
DENIED   → permissionDecision: "deny" returned to Codex
PENDING  → treated as deny (Codex has no hold state)
```

## Fail Mode

The script above uses `failMode: 'closed'`, so the adapter returns a denial if
Sigil Sign is unreachable. Codex blocks when it receives that valid denial.
This does not cover failure of the hook process itself. Codex documents hooks
as guardrails rather than a complete security boundary, so pair them with the
OS sandbox, managed approval policy, and an in-path MCP proxy for consequential
connector actions.

## Adapter Status

Codex has a dedicated package export: `createCodexPreToolUseHook`. It preserves
the current Codex deny shape, framework id, task id fallbacks, fail-closed
default, and coverage warnings in request metadata.

## Governing MCP and File Tools

Codex `PreToolUse` covers matching MCP tool calls and file edits through
`apply_patch`. Two paths still matter:

- **MCP tool calls:** use the adapter for matched calls, or point Codex at the
  [Sigil MCP Proxy](../mcp-proxy/overview) when you need protocol-level
  enforcement for every MCP `tools/call`.
- **Web tools:** governed natively once Codex extends hook coverage to WebSearch
  and related non-shell tools.

## Configuration

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `apiKey` | `string` | Yes | — | Sigil API key (`sk_sigil_...`) |
| `apiUrl` | `string` | No | `https://sign.sigilcore.com` | Sigil Sign endpoint |
| `agentId` | `string` | No | `'agent'` | Agent identifier |
| `framework` | `string` | No | `'agent-hooks'` | Use `'codex'` for telemetry and audit routing |
| `failMode` | `'open' \| 'closed'` | No | `'open'` | Adapter result when Sigil is unreachable; it does not control host hook-process failure |

## Source

- [github.com/Sigil-Core/agent-hooks](https://github.com/Sigil-Core/agent-hooks) — TypeScript package, MIT License
- [Codex hooks documentation](https://developers.openai.com/codex/hooks)
