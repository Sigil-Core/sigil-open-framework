---
title: "Framework Registry"
description: "Supported and custom agent framework identifiers for the /v1/authorize endpoint."
---

# Framework Registry

The `framework` field in every `/v1/authorize` request identifies which agent framework is submitting the intent. Sigil uses this for telemetry, adapter routing, and audit logs. **Policy evaluation is framework-agnostic** — your `warranty.md` governs what the agent can do regardless of which framework it runs on.

## Validation

The `framework` field accepts any non-empty string matching:

```
^[a-z0-9][a-z0-9-]{0,63}$
```

- Lowercase alphanumeric characters and hyphens only
- Maximum 64 characters
- Must start with a letter or digit

Unknown framework strings are accepted with a warning log. You are never blocked from authorizing an intent because of an unrecognized framework value.

## Known Frameworks

### EVM

| ID | Name | Adapter | Docs |
|---|---|---|---|
| `agentkit` | Coinbase AgentKit | `checkAnthropicToolUse` | [Claude Code / AgentKit](agent-hooks/claude-code) |
| `agentpay` | USD1 AgentPay (WLFI) | `checkIntent` | [AgentPay](agent-hooks/agentpay) |

### Autonomous

| ID | Name | Adapter |
|---|---|---|
| `eliza` | ElizaOS | `checkElizaAction` |
| `openclaw` | OpenClaw | `checkIntent` |
| `nanoclaw` | Nanoclaw | `checkIntent` |
| `ironclaw` | Ironclaw | `checkIntent` |
| `nanobot` | Nanobot | `checkIntent` |
| `hermes` | Hermes Agent | `checkIntent` |

### Tool

| ID | Name | Adapter | Docs |
|---|---|---|---|
| `langchain` | LangChain | `wrapLangChainTool` | [LangChain](agent-hooks/langchain) |
| `anthropic-sdk` | Claude Code / Anthropic SDK | `checkAnthropicToolUse` | [Claude Code](agent-hooks/claude-code) |
| `openai-sdk` | OpenAI Agents SDK | `checkIntent` | |

### Testing

| ID | Name | Adapter |
|---|---|---|
| `demo` | Demo / Testing | (none) |

## Using a Custom Framework

If your agent framework isn't listed above, use any identifier that follows the validation pattern. Examples:

```json
{ "framework": "my-custom-agent" }
{ "framework": "internal-bot-v2" }
```

Custom framework strings pass through to the authorization engine identically to known ones. The only difference is a warning in the server log noting an unrecognized framework — this is informational and does not affect the authorization decision.

## Machine-Readable Spec

The canonical registry is available as JSON at [`framework-registry.json`](https://github.com/Sigil-Core/sigil-open-framework/blob/main/framework-registry.json) for programmatic consumption. The OEE backend imports this file to populate its known-framework list.
