---
title: "Open Venture Engine (OVE)"
description: "The first OEE vertical — pre-configured for autonomous venture capital and fund deployment."
---

The **Open Venture Engine (OVE)** is the first vertical boilerplate of the [Open Execution Engine (OEE)](https://github.com/Sigil-Core/oee). OVE lives inside the OEE monorepo at `verticals/venture/` and provides OEE's domain-agnostic enforcement primitives pre-configured for autonomous venture capital.

OVE does not contain its own enforcement infrastructure. It configures OEE's — Sigil Sign, Sigil Lex, Intent Attestation issuance, and consensus hold management — for the specific requirements of autonomous fund deployment: spend limits, action allowlists, chain permissions, and consensus gates tuned for fiduciary mandates.

## What OVE Provides

OVE inherits everything from OEE core and adds the venture capital layer on top:

- **VC-tuned `warranty.md` template** — EVM limits pre-set for autonomous fund mandates (~$100k per-transaction cap, ~$75k consensus gate by default)
- **Agent orchestration boilerplate** — ElizaOS and AgentKit integration examples
- **Smart contract templates** — ERC-6551 token-bound agent identity, Safe treasury custody, Superfluid revenue streaming
- **Integration adapters** — Sigil Action Provider wired for direct AgentKit integration

## Enforcement Model

OVE enforces authorization deterministically through OEE's typed-block policy model:

| Block | Trigger | Outcome |
|---|---|---|
| `## evm` | Hard rule violation (amount, chain, action) or consensus threshold exceeded | `DENIED` immediately or `PENDING` hold |
| `## tool_calls` | Disallowed tool, blocked command, domain, or path | `DENIED` immediately |
| `## custom` | Operator-defined field or string match | `DENIED` immediately |
| `## soft_limits` | Daily aggregate cap reached | `APPROVED` with informational flag — never a hard denial |

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
