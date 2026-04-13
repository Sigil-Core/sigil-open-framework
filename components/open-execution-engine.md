---
title: "Open Execution Engine (OEE)"
description: "The domain-agnostic enforcement substrate every SOF-compliant agent runs on."
---

The **Open Execution Engine (OEE)** is the enforcement layer of the Sigil Open Framework. It provides the deterministic primitives that make autonomous agents safe to deploy — policy evaluation, Intent Attestation issuance, consensus hold management, and gated RPC/bundler execution — across any deployment domain.

OEE is not specific to venture capital, healthcare, or banking. It is the substrate. Domain-specific behaviour lives in **verticals** — pre-configured OEE implementations that inherit these enforcement primitives and add domain-tuned policy templates and integration examples on top.

## How OEE Enforces Execution

Every SOF-compliant agent routes high-stakes actions through the same enforcement pipeline:

1. **Intent Declaration** — the agent submits a structured transaction intent to the Sigil execution firewall.
2. **Policy Evaluation** — Sigil Lex reads the operator's `warranty.md` at runtime and deterministically evaluates the intent against the typed-block policy schema.
3. **Authorization Decision** — the firewall returns an approved Intent Attestation, a denial, or a consensus hold requiring human approval.
4. **Gated Execution** — the RPC/bundler gateway rejects any write operation that does not carry a valid, matching attestation.

No transaction may execute on-chain without passing this pipeline.

## Policy Enforcement Model

`warranty.md` uses a typed-block schema. Each block governs a distinct enforcement surface:

| Block | Enforcement | Outcome on Violation |
|---|---|---|
| `## evm` | Hard limits — max transaction size, action allowlist, chain allowlist, per-chain action overrides, consensus hold threshold | `DENIED` immediately or `PENDING` hold |
| `## tool_calls` | Agent tool governance — allowed tools, blocked commands, blocked domains, blocked paths, email approval gate | `DENIED` immediately |
| `## custom` | Operator-defined deny rules — field match (`deny_if`) and string match (`deny_string`) | `DENIED` immediately |
| `## soft_limits` | Aggregate daily caps — ETH and tool call volume | `APPROVED` with informational flag — never a hard denial |

Consensus holds (`PENDING`) are stored with a 24-hour TTL. Execution remains blocked until the hold is resolved through Sigil Command. This is the structural implementation of human-in-the-loop governance — not optional monitoring, but enforced at the cryptographic level.

## Verticals

OEE verticals are domain-specific implementations of the enforcement stack. Each vertical inherits OEE's enforcement primitives and adds domain-appropriate `warranty.md` templates, legal wrapper guidance, and integration examples.

| Vertical | Domain | Status |
|---|---|---|
| Open Healthcare Engine (OHE) | Clinical AI agents | Planned |
| Open Banking Engine (OBE) | Treasury and financial agents | Planned |
