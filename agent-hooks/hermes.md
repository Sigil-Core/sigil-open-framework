---
title: "Hermes Agent"
description: "Gate Hermes Agent tool calls against a signed Sigil policy using Hermes shell hooks."
---

## Overview

[Hermes Agent](https://hermes-agent.nousresearch.com) (Nous Research) has a
first-class hook system built for exactly this. Its `pre_tool_call` hook fires
**immediately before every tool executes**, built-in tools and plugin tools
alike, and can veto the call. Sigil Open Framework (SOF) registers a shell hook
that forwards each intended tool call to Sigil Sign `/v1/authorize` and blocks
when the policy returns `DENIED`.

Of the popular agent runtimes, Hermes offers the most complete pre-execution
surface: a single hook governs `terminal`, `write_file`, `patch`, `web_search`,
`read_file`, and any plugin or MCP tool the agent can reach.

`@sigilcore/agent-hooks` ships a dedicated Hermes export:
`createHermesPreToolCallHook`. It normalizes Hermes hook payloads, maps common
tool names to Sigil actions, resolves task ids, and returns Hermes' block shape
consistently.

## Prerequisites

You need a Sigil API key and a signed `warranty.md` policy file deployed to Sigil Sign.

- Get an API key: [sigilcore.com/tools/keys](https://sigilcore.com/tools/keys)
- Generate a policy: [sigilcore.com/tools/warrant](https://sigilcore.com/tools/warrant)

Node.js 18 or newer is required for the hook script below.

## 1. Add the shell hook

Hermes shell hooks are declared in `~/.hermes/config.yaml` and run as
subprocesses when the matching event fires, in both CLI and gateway sessions.

```yaml
hooks:
  pre_tool_call:
    - matcher: "terminal|write_file|patch|web_search|web_extract"
      command: "node ~/.hermes/agent-hooks/sigil-pre-tool-call.mjs"
      timeout: 10
```

The `matcher` is a regex over the tool name. Widen or narrow it to match the
actions your policy governs.

## 2. Add the hook script

```bash
npm install -g @sigilcore/agent-hooks
```

Create `~/.hermes/agent-hooks/sigil-pre-tool-call.mjs`:

```javascript
#!/usr/bin/env node
import { createHermesPreToolCallHook } from '@sigilcore/agent-hooks';

const payload = JSON.parse(await new Response(process.stdin).text());
const hook = createHermesPreToolCallHook({
  apiKey: process.env.SIGIL_API_KEY,
  agentId: 'hermes-agent',
  failMode: 'closed',
});

process.stdout.write(JSON.stringify(await hook(payload)));
process.exit(0);
```

Set `SIGIL_API_KEY` in your environment. On first use Hermes prompts once to
approve the `(event, command)` pair and persists the decision. For non-interactive
gateway or cron runs, pre-approve with `HERMES_ACCEPT_HOOKS=1` or
`hooks_auto_accept: true` in `config.yaml`.

The adapter resolves task ids in this order: `SIGIL_TASK_ID`, `config.taskId`,
`session_id`, `conversation_id`, then `run_id`. `## execution_limits` uses that
value to stop runaway tool loops within one task.

## Model Budget Brakes

The shell hook above gates tool execution only. It does not see provider token
usage by itself. To enforce `max_model_spend_usd_per_task` or
`max_model_tokens_per_task`, the Hermes host or plugin must record provider
usage after model calls with `recordModelUsage` and call `checkModelBudget` with
the same task id.

## How It Works

Hermes pipes a JSON payload to the hook on `stdin` and reads JSON back from
`stdout`. The script maps the Hermes tool name to a Sigil action type, submits the
intent to `/v1/authorize`, and on a `DENIED` or `PENDING` decision returns the
canonical block shape. Hermes then short-circuits the tool and hands the reason
back to the model as the tool error.

```
Hermes about to run a tool
        ↓
pre_tool_call shell hook (sigil-pre-tool-call.mjs)
        ↓
checkIntent → POST /v1/authorize → Sigil Sign
        ↓
APPROVED → tool executes
DENIED   → {"decision": "block", "reason": ...} returned to Hermes
PENDING  → treated as block (Hermes has no native hold state)
```

Both block shapes are accepted by Hermes and normalized internally:
`{"decision": "block", "reason": "..."}` and
`{"action": "block", "message": "..."}`.

## Tool Name Mapping

| Hermes Tool | Sigil Action |
|---|---|
| `terminal` | `bash` |
| `write_file`, `patch` | `file_write` |
| `web_search`, `web_extract` | `web_fetch` |
| Any other tool | the tool name, lowercased |

## Plugin Hook Alternative

If you ship a Hermes plugin, you can register the same check in-process instead of
as a subprocess. In your plugin's `register()`:

```python
def sigil_check(tool_name, args, task_id, **kwargs):
    decision = call_sigil_authorize(tool_name, args)  # POST /v1/authorize
    if decision["status"] in ("DENIED", "PENDING"):
        return {"action": "block", "message": decision["message"]}

def register(ctx):
    ctx.register_hook("pre_tool_call", sigil_check)
```

Python plugin hooks are evaluated before shell hooks, so a plugin block takes
precedence in tie cases. Both flow through the same dispatcher.

## Fail Mode

The script uses `failMode: 'closed'`, so a tool is blocked if Sigil Sign is
unreachable. Switch to `failMode: 'open'` for local development. Use closed mode
for any environment that touches production, external systems, or on-chain actions.

## Configuration

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `apiKey` | `string` | Yes | — | Sigil API key (`sk_sigil_...`) |
| `apiUrl` | `string` | No | `https://sign.sigilcore.com` | Sigil Sign endpoint |
| `agentId` | `string` | No | `'agent'` | Agent identifier |
| `framework` | `string` | No | `'agent-hooks'` | Use `'hermes'` for telemetry and audit routing |
| `failMode` | `'open' \| 'closed'` | No | `'open'` | Block (`closed`) or allow (`open`) when Sigil is unreachable |

## Source

- [github.com/Sigil-Core/agent-hooks](https://github.com/Sigil-Core/agent-hooks) — TypeScript package, MIT License
- [Hermes Agent Event Hooks documentation](https://hermes-agent.nousresearch.com/docs/user-guide/features/hooks)
