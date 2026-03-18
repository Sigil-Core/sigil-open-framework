# Sigil Open Framework (SOF)

**The open-source standard for cryptographically secured, legally compliant autonomous agents.**

[![Status](https://img.shields.io/badge/status-active--development-black)](#)
[![License](https://img.shields.io/badge/license-MIT-blue)](#)
[![Ecosystem](https://img.shields.io/badge/ecosystem-Sigil--OS-purple)](#)

---

## Executive Summary

The **Sigil Open Framework (SOF)** is a modular, open-source architecture designed to solve the final barrier to autonomous agent adoption: **Liability.**

While standard AI frameworks give agents the intelligence to act, SOF gives them the cryptographic and legal boundaries required to operate safely in the real world. SOF bridges the gap between autonomous code and real-world compliance through a **governed protocol stack**: a domain-agnostic enforcement engine, a legal governance layer, and a set of vertical boilerplates that bring both together for specific deployment contexts.

If standard agentic frameworks are the accelerator pedal, SOF is the cryptographic brake system and the vehicle's registration.

---

## The Doctrine of Structural Trust

> Safety is not a property of prompts. Safety is a property of architecture.

The Sigil Open Framework is built on a single, non-negotiable principle: autonomous agents cannot be trusted to self-govern. Trust must be structurally enforced — cryptographically, deterministically, and before execution, not after loss.

Under SOF, every compliant agent operates within these guarantees:

- AI agents **never hold private keys**
- AI agents **never see raw API credentials**
- AI agents **cannot execute without deterministic authorization**
- High-stakes actions **must route through a policy enforcement layer**

Execution only proceeds if the action carries a valid **Intent Attestation**.

This doctrine is not a feature of any single component. It is the architectural contract that every layer of SOF is designed to enforce:

- **OEE** enforces it technically — no execution without cryptographic authorization
- **FAF** enforces it legally — no liability exposure without structural governance
- **Sigil Attestations** proves it cryptographically — every authorized action is verifiable

The doctrine applies at the framework level. Each component implements it within its own domain.

---

## The Architecture: A Governed Protocol Stack

SOF is not a single codebase, and it is not a two-sided product. It is a **composable protocol stack** — three layers, each independently useful, each enabling the one above it.

Think of it as a franchise protocol. The enforcement substrate is universal — every SOF-compliant deployment runs on the same cryptographic enforcement primitives, regardless of industry. The legal layer converts those guarantees into fiduciary instruments. The vertical boilerplates are the franchise concepts: enforcement and legal pre-assembled for a specific deployment context, ready to go.

---

### Layer 1 — The Enforcement Engine: Open Execution Engine (OEE)

[**→ View the OEE Repository**](https://github.com/Sigil-Core/oee)

OEE is the domain-agnostic execution enforcement substrate that every SOF-compliant deployment runs on. It provides the core enforcement primitives: policy evaluation via Sigil Lex, Intent Attestation issuance, consensus hold management, and gated RPC/bundler execution. No transaction executes without cryptographic authorization. No exceptions, no industry carve-outs.

OEE is not specific to venture capital, healthcare, or banking. It is the substrate.

### Layer 2 — The Legal Governance Layer: Fiduciary Agent Framework (FAF)

[**→ View the FAF Repository**](https://github.com/Sigil-Core/faf)

FAF is the legal-technical bridge. OEE enforces compliance in the execution layer; FAF enforces it in the legal domain — converting OEE's cryptographic guarantees into bounded fiduciary instruments. FAF provides entity templates, operating agreements, and `ASSURANCE.md` policy structure so that human General Partners can assume quantifiable liability for autonomous deployment without unlimited personal exposure.

FAF is what makes OEE legally meaningful.

### Layer 3 — The Vertical Boilerplates

Vertical boilerplates are domain-specific implementations of OEE + FAF. Each inherits the full enforcement stack and adds domain-appropriate `ASSURANCE.md` policy templates, sector-specific legal wrapper guidance, and integration examples for common agent frameworks in that industry.

**[Open Venture Engine (OVE)](https://github.com/Sigil-Core/ove)** is the first vertical — OEE pre-wired for autonomous venture capital. OVE adds VC-optimized policy templates, ERC-6551 agent identity, Safe treasury custody, Superfluid revenue streaming, and Sigil Action Provider integration for AgentKit.

Healthcare, banking, and enterprise verticals follow the same architecture. Each new vertical is a deployment context, not a new enforcement mechanism. The enforcement is always OEE.

### The Cryptographic Foundation: Sigil Attestations

[**→ View the Attestations Repository**](https://github.com/Sigil-Core/sigil-attestations)

The canonical cryptographic specification underlying every layer. This repository defines the short-lived, Ed25519-signed JWTs — **Intent Attestations** — that serve as cryptographic proof that every authorized execution passed deterministic policy evaluation before it reached the chain.

---

## Aligning with the Linux Foundation (AAIF)

The Linux Foundation's Agentic AI Foundation (AAIF) has established open-source standards for how agents are built and connected, primarily through the `AGENTS.md` specification.

**The Problem:** `AGENTS.md` tells the world what an agent is **capable** of doing. It does not dictate what the agent **cannot** do.

**The SOF Solution:** The Sigil Open Framework natively wraps AAIF standards but introduces a mandatory **Security & Execution Constraints** block. While AAIF defines the capabilities, Sigil defines the deterministic limits.

### Example: Extending `AGENTS.md` with SOF

When building an SOF-compliant agent, your `AGENTS.md` file will include the standard AAIF routing, accompanied by the Sigil cryptographic constraints:

```yaml
# AGENTS.md (AAIF + Sigil SOF Extension)

name: "Alpha Yield Agent"
version: "1.0.0"
description: "Autonomous capital deployment for DeFi yield strategies."

capabilities:
  - EVM_Transaction_Generation
  - Market_Analysis
  - ERC4337_UserOp_Formatting

# --- SIGIL OPEN FRAMEWORK EXTENSION ---
sigil-constraints:
  enforcement_layer: "Sigil OS"
  policy_uri: "ipfs://QmYourAssurancePolicyHashHere"
  attestation_standard: "sigil-attestations-v1"
  deterministic_rules:
    - max_transaction_value: "50000 USDC"
    - permitted_contracts: ["0xDefiRouterAddress1", "0xDefiRouterAddress2"]
    - human_override_required: true
    - block_sanctioned_entities: true
```

If the agent proposes a transaction that violates any rule in the `sigil-constraints` block, the Sigil Open Framework intercepts the request, denies the Intent Attestation, and execution halts instantly at the cryptographic level.

---

## Human-in-the-Loop Oversight

SOF ensures that while execution is autonomous, oversight is absolute. Through integrations with **Sigil Command** (the web and mobile control plane), human operators retain:

- **Real-time Execution Monitoring:** View intent proposals before they hit the chain.
- **High-Value Approvals:** Require manual cryptographic countersignatures for specific thresholds.
- **The Kill Switch:** An emergency pause that instantly revokes the agent's capability to generate valid attestations.

---

## Getting Started

To begin building with the Sigil Open Framework, select the path that fits your needs:

### 🛠️ Start Building Now (Hackathons & Local Dev)

Jump into the local toolkit to simulate the Sigil execution firewall offline. It includes a mock Express.js engine, a Python LangChain authorizer, and an `ASSURANCE.md` template.
→ [**Open the Developer Toolkit**](./developer-toolkit)

### 📚 Explore the Core Components

If you are designing a full production architecture, explore our specialized ecosystem repositories:

1. **Starting from the enforcement layer?** Start with [Open Execution Engine (OEE)](https://github.com/Sigil-Core/oee).
2. **Building an Agentic VC fund?** Use the [Open Venture Engine (OVE)](https://github.com/Sigil-Core/ove) vertical boilerplate — OEE pre-wired for autonomous venture capital.
3. **Structuring Legal Compliance?** Start with [Fiduciary Agent Framework (FAF)](https://github.com/Sigil-Core/faf).
4. **Integrating the API?** Read the underlying [Sigil Attestations Spec](https://github.com/Sigil-Core/sigil-attestations).

For comprehensive developer guides, API references, and architecture deep-dives, visit our official documentation.
→ [**docs.sigilcore.com**](https://docs.sigilcore.com)
