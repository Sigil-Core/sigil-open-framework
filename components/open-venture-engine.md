---
title: "Open Venture Engine (OVE)"
description: "The first OEE vertical — pre-configured for autonomous venture capital and fund deployment."
---

The **Open Venture Engine (OVE)** is the first vertical boilerplate of the [Open Execution Engine (OEE)](https://github.com/Sigil-Core/oee). OVE lives inside the OEE monorepo at `verticals/venture/` and provides OEE's domain-agnostic enforcement primitives pre-configured for autonomous venture capital.

OVE does not contain its own enforcement infrastructure. It configures OEE's — Sigil Sign, Sigil Lex, Intent Attestation issuance, and consensus hold management — for the specific requirements of autonomous fund deployment: spend limits, action allowlists, chain permissions, and consensus gates tuned for fiduciary mandates.

## What OVE Provides

OVE inherits everything from OEE core and adds the venture capital layer on top:

- **VC-tuned `ASSURANCE.md` template** — Class 1/2/3 limits pre-set for autonomous fund mandates (~$100k per-transaction cap, ~$75k consensus gate by default)
- **Agent orchestration boilerplate** — ElizaOS and AgentKit integration examples
- **Smart contract templates** — ERC-6551 token-bound agent identity, Safe treasury custody, Superfluid revenue streaming
- **Integration adapters** — Sigil Action Provider wired for direct AgentKit integration

## Enforcement Model

OVE enforces authorization deterministically through OEE's three-class policy model:

| Class | Trigger | Outcome |
|---|---|---|
| Class 1 | Hard rule violation (amount, chain, action) | `DENIED` immediately |
| Class 2 | Daily aggregate cap reached | `APPROVED` with informational flag — never a hard denial |
| Class 3 | Consensus threshold exceeded | `PENDING` — hold created in Sigil Command, human approval required |

No capital moves without a valid Intent Attestation.

## Legal Pairing

OVE is designed to deploy alongside the [Fiduciary Agent Framework (FAF)](https://github.com/Sigil-Core/faf). OEE enforcement closes the execution gap. FAF closes the legal gap — wrapping the deployment in an LLC or DAO LLC structure to bound fiduciary liability.

## Repository

OVE lives inside the OEE monorepo:

**[github.com/Sigil-Core/oee/tree/main/verticals/venture/](https://github.com/Sigil-Core/oee/tree/main/verticals/venture/)**

```bash
git clone https://github.com/Sigil-Core/oee.git
cd oee/verticals/venture
```
