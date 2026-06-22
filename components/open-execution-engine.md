---
title: "Open Execution Engine (OEE)"
description: "The reference implementation of the SOF enforcement specification."
---

The **Open Execution Engine (OEE)** is the reference implementation of the [Sigil Open Framework's enforcement specification](/conformance). It implements every required primitive — policy evaluation via Sigil Lex, Intent Attestation issuance, consensus hold management, and gated RPC/bundler execution — and is the engine Sigil Core publishes and operates at `sign.sigilcore.com`.

OEE is one valid SOF signer. It is not the only valid one. The [Conformance Contract](/conformance) defines what any third-party signer — audit firm, custodian, enterprise security team — must implement to interoperate with the same governance stack. This page describes how OEE meets that contract.

OEE itself is domain-agnostic. It does not know what industry you are deploying in. It does not know what your agent is trying to accomplish. It knows only what your policy permits — and it enforces that, deterministically, on every intent. Domain-specific behavior lives in **verticals** — pre-configured OEE deployments that inherit these enforcement primitives and add domain-tuned policy templates and integration examples on top.

## How OEE Enforces Execution

Every agent routing high-stakes actions through OEE follows the same enforcement pipeline. Conforming signers MUST implement an equivalent pipeline against the same specification.

1. **Intent Declaration** — the agent submits a structured transaction intent to the signer's authorization endpoint.
2. **Policy Evaluation** — the signer reads the operator's `warranty.md` at runtime and deterministically evaluates the intent against the typed-block policy schema. In OEE, this is performed by Sigil Lex.
3. **Authorization Decision** — the signer returns an approved Intent Attestation, a denial, or a consensus hold requiring human approval.
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
| `## execution_limits` | Hard runaway-loop ceilings for tool calls | `DENIED` immediately |

Class 1 (structural) rules in `## evm` are required for [Core Conformance](/conformance#core-conformance). Class 2 semantic and Class 3 consensus capabilities map to [Extended Conformance](/conformance#extended-conformance) — OEE implements both.

Consensus holds (`PENDING`) are stored with a 24-hour TTL. Execution remains blocked until the hold is resolved through Sigil Command. This is the structural implementation of human-in-the-loop governance — not optional monitoring, but enforced at the cryptographic level.

## Verticals

OEE verticals are domain-specific implementations of the enforcement stack. Each vertical inherits OEE's enforcement primitives and adds domain-appropriate `warranty.md` templates, legal wrapper guidance, and integration examples. Policy templates within verticals are signer-agnostic at the specification level — they conform to the SOF Conformance Contract and work with any conforming signer.

| Vertical | Domain | Status |
|---|---|---|
| Open Venture Engine (OVE) | Autonomous venture capital | Active |
| Open Healthcare Engine (OHE) | Clinical AI agents | Planned |
| Open Banking Engine (OBE) | Treasury and financial agents | Planned |
