---
title: "Open Execution Engine (OEE)"
description: "The domain-agnostic enforcement substrate every SOF-compliant agent runs on."
---

The **Open Execution Engine (OEE)** is the enforcement layer of the Sigil Open Framework. It provides the deterministic primitives that make autonomous agents safe to deploy — policy evaluation, Intent Attestation issuance, consensus hold management, and gated RPC/bundler execution — across any deployment domain.

OEE is not specific to venture capital, healthcare, or banking. It is the substrate. Domain-specific behaviour lives in **verticals** — pre-configured OEE implementations that inherit these enforcement primitives and add domain-tuned policy templates and integration examples on top.

## How OEE Enforces Execution

Every SOF-compliant agent routes high-stakes actions through the same enforcement pipeline:

1. **Intent Declaration** — the agent submits a structured transaction intent to the Sigil execution firewall.
2. **Policy Evaluation** — Sigil Lex reads the operator's `ASSURANCE.md` at runtime and deterministically evaluates the intent against three enforcement classes.
3. **Authorization Decision** — the firewall returns an approved Intent Attestation, a denial, or a Class 3 consensus hold requiring human approval.
4. **Gated Execution** — the RPC/bundler gateway rejects any write operation that does not carry a valid, matching attestation.

No transaction may execute on-chain without passing this pipeline.

## The Three Policy Classes

| Class | Enforcement | Outcome on Violation |
|---|---|---|
| **Class 1** | Hard limits — max transaction size, action allowlist, chain allowlist, per-chain action overrides | `DENIED` immediately |
| **Class 2** | Soft limits — daily aggregate ETH cap | `DENIED` once cap is reached |
| **Class 3** | Consensus gates — threshold above which human approval is required | `PENDING` — durable hold created in Sigil Command |

Class 3 holds are stored with a 24-hour TTL. Execution remains blocked until the hold is resolved through Sigil Command. This is the structural implementation of human-in-the-loop governance — not optional monitoring, but enforced at the cryptographic level.

## Verticals

OEE verticals are domain-specific implementations of the enforcement stack:

| Vertical | Domain | Repository |
|---|---|---|
| Open Venture Engine (OVE) | Autonomous venture capital | [`oee/verticals/venture/`](https://github.com/Sigil-Core/oee/tree/main/verticals/venture/) |
| Open Healthcare Engine (OHE) | Clinical AI agents | Planned |
| Open Banking Engine (OBE) | Treasury and financial agents | Planned |

Each vertical inherits OEE's enforcement primitives and adds domain-appropriate `ASSURANCE.md` templates, legal wrapper guidance, and integration examples.

**View the Repository:** [github.com/Sigil-Core/oee](https://github.com/Sigil-Core/oee)
