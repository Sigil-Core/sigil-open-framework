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
  **Coverage today.** Codex `PreToolUse` currently intercepts the **Bash tool only**.
  It does not fire for `Write`, `WebSearch`, `apply_patch`, or MCP tool calls, and it
  does not catch every shell path (a model can write a script to disk and run it).
  Treat this as a strong guardrail on shell execution, not a complete enforcement
  boundary. To govern MCP tool calls from Codex, route them through the
  [Sigil MCP Proxy](../mcp-proxy/overview). Codex hooks are experimental and are
  currently disabled on Windows. Track the
  [Codex hooks docs](https://developers.openai.com/codex/hooks) as coverage expands.
</Note>

## Prerequisites

You need a Sigil API key and a signed `warranty.md` policy file deployed to Sigil Sign.

- Get an API key: [sigilcore.com/tools/keys](https://sigilcore.com/tools/keys)
- Generate a policy: [sigilcore.com/tools/warrant](https://sigilcore.com/tools/warrant)

Node.js 18 or newer is required for the hook script below.

## 1. Enable hooks

Codex hooks are behind a feature flag. In `~/.codex/config.toml`:

```toml
[features]
codex_hooks = true
```

## 2. Register the PreToolUse hook

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
      }
    ]
  }
}
```

## 3. Add the hook script

Install the package in a location the script can resolve, then create
`~/.codex/hooks/sigil-pretooluse.mjs`:

```bash
npm install -g @sigilcore/agent-hooks
```

```javascript
#!/usr/bin/env node
import { checkIntent, buildRejectionContext } from '@sigilcore/agent-hooks';

const payload = JSON.parse(await new Response(process.stdin).text());
const taskId = process.env.SIGIL_TASK_ID
  ?? payload.session_id
  ?? payload.conversation_id
  ?? payload.run_id;

const result = await checkIntent(
  {
    action: 'bash',
    command: payload.tool_input?.command,
    metadata: payload.tool_input,
  },
  {
    apiKey: process.env.SIGIL_API_KEY,
    agentId: 'codex-cli',
    framework: 'codex',
    taskId,
    failMode: 'closed',
  },
);

if (result.decision === 'DENIED' || result.decision === 'PENDING') {
  const ctx = buildRejectionContext(result, 'bash');
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: ctx.sigil_message,
    },
  }));
  process.exit(0);
}

process.exit(0);
```

Make the package resolvable to the script (a global install plus
`NODE_PATH=$(npm root -g)` in your shell profile is the simplest path), set
`SIGIL_API_KEY` in your environment, and Codex will check every Bash command
against your policy before it runs.

The task id fallback order is `SIGIL_TASK_ID`, then `session_id`, then
`conversation_id`, then `run_id`. `## execution_limits` uses this value to apply
per-task tool-call ceilings.

## How It Works

Codex pipes a JSON payload to the hook on `stdin`. For a Bash call the relevant
field is `tool_input.command`. The script maps it to the Sigil `bash` action,
submits it to `/v1/authorize`, and on a `DENIED` or `PENDING` decision writes the
documented Codex block shape to `stdout`. Codex then refuses the command and
returns the reason to the model.

```
Codex about to run Bash
        ↓
PreToolUse hook (sigil-pretooluse.mjs)
        ↓
checkIntent → POST /v1/authorize → Sigil Sign
        ↓
APPROVED → command runs
DENIED   → permissionDecision: "deny" returned to Codex
PENDING  → treated as deny (Codex has no hold state)
```

## Fail Mode

The script above uses `failMode: 'closed'`, so a Bash command is blocked if Sigil
Sign is unreachable. For local development you can switch to `failMode: 'open'`,
which allows the command through on an outage and tags the result with
`failOpen: true`. Use closed mode for any environment that touches production,
external systems, or on-chain actions.

## Adapter Status

The current Codex path is a documented shell-script integration built on the
generic `checkIntent` export. It is not yet a dedicated package export.

Codex would benefit from a dedicated adapter because its hook output shape,
feature flag setup, Bash-only coverage, task id fallbacks, and MCP/File/Web
coverage gaps are Codex-specific. A future export should preserve those details
instead of leaving every user to copy and maintain the script.

## Governing MCP and File Tools

Codex `PreToolUse` does not yet fire for MCP, `Write`, or `WebSearch`. Two paths
close that gap:

- **MCP tool calls:** point Codex at the [Sigil MCP Proxy](../mcp-proxy/overview)
  instead of the raw MCP servers. Every MCP `tools/call` is then authorized before
  it reaches the server.
- **File and web tools:** governed natively once Codex extends hook coverage to
  those tools. The same script pattern applies, with the matcher widened and the
  action mapped from the tool name.

## Configuration

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `apiKey` | `string` | Yes | — | Sigil API key (`sk_sigil_...`) |
| `apiUrl` | `string` | No | `https://sign.sigilcore.com` | Sigil Sign endpoint |
| `agentId` | `string` | No | `'agent'` | Agent identifier |
| `framework` | `string` | No | `'agent-hooks'` | Use `'codex'` for telemetry and audit routing |
| `failMode` | `'open' \| 'closed'` | No | `'open'` | Block (`closed`) or allow (`open`) when Sigil is unreachable |

## Source

- [github.com/Sigil-Core/agent-hooks](https://github.com/Sigil-Core/agent-hooks) — TypeScript package, MIT License
- [Codex hooks documentation](https://developers.openai.com/codex/hooks)
