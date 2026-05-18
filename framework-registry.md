---
title: "Framework Registry"
description: "Supported and custom agent framework identifiers for the /v1/authorize endpoint."
---

# Framework Registry

The `framework` field in every `/v1/authorize` request identifies which agent framework is submitting the intent. Sigil uses this for telemetry, adapter routing, and audit logs. **Policy evaluation is framework-agnostic**: your `warranty.md` governs what the agent can do regardless of which framework it runs on.

<Note>
  **Two registries, two roles.** This page lists agent **frameworks**: the systems
  that submit intents. For the registry of conforming **signers**, the systems
  that issue Intent Attestations, see the [Conformance Registry](/conformance#registry-of-conforming-implementations).
</Note>

## Validation

The `framework` field accepts any non-empty string matching:

```text
^[a-z0-9][a-z0-9-]{0,63}$
```

- Lowercase alphanumeric characters and hyphens only
- Maximum 64 characters
- Must start with a letter or digit

Unknown framework strings are accepted with a warning log. You are never blocked from authorizing an intent because of an unrecognized framework value.

## Known Frameworks

### TypeScript Package

These identifiers are exported by `@sigilcore/agent-hooks` as `FRAMEWORKS`.

| ID | Name | Adapter | Docs |
|---|---|---|---|
| `agent-hooks` | Generic TypeScript host | `checkIntent` | [Agent Hooks](agent-hooks/overview) |
| `anthropic-sdk` | Claude Code / Anthropic SDK | `checkAnthropicToolUse` | [Claude Code](agent-hooks/claude-code) |
| `eliza` | ELIZA | `checkElizaAction` | [ELIZA](agent-hooks/eliza) |
| `langchain` | LangChain | `wrapLangChainTool` | [LangChain](agent-hooks/langchain) |
| `openclaw` | OpenClaw | `createOpenclawSigilHandler` | [Agent Hooks](agent-hooks/overview) |
| `nemoclaw` | NVIDIA NemoClaw | `createOpenclawSigilHandler` | [Agent Hooks](agent-hooks/overview) |
| `agentpay` | USD1 AgentPay (WLFI) | `checkIntent` | [AgentPay](agent-hooks/agentpay) |

### Rust Crates

| ID | Name | Crate | Docs |
|---|---|---|---|
| `ironclaw` | IronClaw | `sigil-agent-hooks-ironclaw` | [Rust and IronClaw](agent-hooks/rust) |

`sigil-agent-hooks-core` can also be used directly from any Rust host. If you are not integrating with IronClaw, keep the default `agent-hooks` identifier or provide your own custom framework identifier.

## Using a Custom Framework

If your agent framework is not listed above, use any identifier that follows the validation pattern. Examples:

```json
{ "framework": "my-custom-agent" }
{ "framework": "demo" }
{ "framework": "internal-bot-v2" }
```

Custom framework strings pass through to the authorization engine identically to known ones. The only difference is a warning in the server log noting an unrecognized framework. This is informational and does not affect the authorization decision.

## Machine-Readable Spec

The canonical registry is available as JSON at [`framework-registry.json`](https://github.com/Sigil-Core/sigil-open-framework/blob/main/framework-registry.json) for programmatic consumption. It should be kept aligned with the exported `FRAMEWORKS` surface in [`@sigilcore/agent-hooks`](https://github.com/Sigil-Core/agent-hooks) and the Rust crate surface in [`agent-hooks-rs`](https://github.com/Sigil-Core/agent-hooks-rs).
