---
title: "Rust and IronClaw"
description: "Use agent-hooks-rs for Rust-native Sigil pre-tool authorization and IronClaw Hook integration."
---

## Overview

`agent-hooks-rs` is the Rust integration surface for Sigil pre-tool authorization. It provides:

- `sigil-agent-hooks-core` — a generic Rust client for Sigil Sign `/v1/authorize`
- `sigil-agent-hooks-ironclaw` — a native IronClaw `Hook` trait adapter

The Rust crates share contract fixtures with the TypeScript `@sigilcore/agent-hooks` package, so both implementations emit the same `/v1/authorize` request bodies for the same intents.

Scope today: `agent-hooks-rs` covers generic Rust authorization and the native
IronClaw tool-call hook. It does not cover Hermes, Codex, OpenRouter, AgentPay,
or other JavaScript host integrations. Those use the TypeScript package today.

## Installation

```toml
# For direct Sigil client usage
cargo add sigil-agent-hooks-core

# For IronClaw integration
cargo add sigil-agent-hooks-ironclaw
```

Minimum supported Rust version: **1.92**.

## Generic Rust Client

Use `SigilClient` directly when you want framework-agnostic pre-tool authorization in any Rust host.

```rust
use sigil_agent_hooks_core::{
    FailMode, SigilClient, SigilDecision, SigilIntent, build_rejection_context,
};

#[tokio::main]
async fn main() {
    let client = SigilClient::builder(std::env::var("SIGIL_API_KEY").unwrap())
        .agent_id("my-rust-agent")
        .fail_mode(FailMode::Closed)
        .build()
        .expect("valid config");

    let intent = SigilIntent {
        action: "bash".to_string(),
        command: Some("rm -rf /tmp/scratch".to_string()),
        ..SigilIntent::default()
    };

    let result = client.check_intent(&intent).await.expect("client error");

    match result.decision {
        SigilDecision::Approved => {
            // Proceed with tool execution.
        }
        SigilDecision::Denied | SigilDecision::Pending => {
            let rejection = build_rejection_context(&result, &intent.action);
            eprintln!("Blocked: {}", rejection.sigil_message);
        }
    }
}
```

## IronClaw Hook

For IronClaw agents, `IronclawSigilHook` implements the `Hook` trait and registers on `BeforeToolCall`.

```rust
use sigil_agent_hooks_core::{FailMode, SigilClient};
use sigil_agent_hooks_ironclaw::IronclawSigilHook;

let client = SigilClient::builder(std::env::var("SIGIL_API_KEY").unwrap())
    .agent_id("my-ironclaw-agent")
    .fail_mode(FailMode::Closed)
    .build()
    .expect("valid config");

let hook = IronclawSigilHook::builder(client)
    .build()
    .expect("hook build");

// Register with IronClaw:
// runtime.register_hook(hook);
```

The adapter maps common tool aliases to Sigil action names:

| Tool aliases | Sigil action |
|---|---|
| `exec`, `process`, `code_execution` | `bash` |
| `write`, `edit`, `apply_patch` | `file_write` |
| `web_fetch`, `web_search`, `x_search`, `browser`, `http` | `web_fetch` |
| `wallet_transfer`, `wallet.transfer` | `wallet.transfer` |
| `wallet_sign` | `wallet_sign` |

Unknown tools pass through as lowercase strings. To customize mapping, implement `ToolIntentMapper` and pass it to `IronclawSigilHook::builder(client).mapper(...)`.

## Model Budget Status

Execution Limits v2 added model spend and token caps through
`metadata.model_usage` on `model.inference` checks. `sigil-agent-hooks-core`
ships Rust-native helpers for this flow:

- `record_model_usage`
- `get_model_usage_report`
- `clear_model_usage`
- `check_model_budget`
- `normalize_model_usage`

```rust
use sigil_agent_hooks_core::{
    SigilModelUsage, check_model_budget, record_model_usage,
};

record_model_usage(
    &client,
    SigilModelUsage {
        provider: Some("anthropic".to_string()),
        model: Some("claude-sonnet-4".to_string()),
        input_tokens: Some(100),
        output_tokens: Some(25),
        estimated_spend_usd: Some("0.25".to_string()),
        ..SigilModelUsage::default()
    },
    None,
)?;

let result = check_model_budget(&client, None).await?;
```

The helper accumulates per-task usage for 24 hours, serializes the cumulative
report as `metadata.model_usage`, and sends `action: "model.inference"` with the
resolved task id. Spend accumulation uses integer microdollar math internally.

IronClaw's native hook currently sees `BeforeToolCall` events only. If your
IronClaw host owns the model provider call, wrap that provider call with the
core helpers above. Do not claim automatic IronClaw model-budget enforcement
unless your host has recorded provider usage and called `check_model_budget`.

## Configuration

| Builder method | Default | Description |
|---|---|---|
| `builder(api_key)` | required | Sigil API key |
| `.api_url(url)` | `https://sign.sigilcore.com` | Sigil Sign API URL |
| `.agent_id(id)` | `"agent"` | Agent identifier |
| `.task_id(id)` | generated when needed | Stable task id for execution limits and model budgets |
| `.framework(id)` | `AgentHooks` | Framework identifier for the authorize request |
| `.fail_mode(mode)` | `Closed` | Behavior when Sigil is unreachable |
| `.request_timeout(dur)` | `5s` | HTTP request timeout |

The IronClaw builder rebinds the default `FrameworkId::AgentHooks` to `FrameworkId::Ironclaw`, so IronClaw authorize requests carry the correct framework identifier.

## Fail Modes

`agent-hooks-rs` defaults to `FailMode::Closed`.

| Mode | Unreachable result | Use when |
|---|---|---|
| `FailMode::Closed` | `DENIED` with `SIGIL_UNREACHABLE` | Production, externally-visible actions, and wallet or on-chain actions |
| `FailMode::Open` | `APPROVED` with `fail_open: true` | Development or non-financial workflows |

Unreachability includes network errors, DNS failures, refused connections, request timeouts, 5xx responses, non-JSON response bodies, and responses larger than 64 KiB. Authentication failures (`401` or `403`) return `SIGIL_AUTH_FAILURE`, not `SIGIL_UNREACHABLE`.

## Wire Parity

The Rust and TypeScript packages share `contract-fixtures/v1/` files that pin the exact JSON wire format of `/v1/authorize` request bodies. Both test suites verify the fixture SHA-256 checksums and byte-compare generated request bodies against the fixtures.

## Source

[github.com/Sigil-Core/agent-hooks-rs](https://github.com/Sigil-Core/agent-hooks-rs) — MIT License
