# Sigil Open Framework (SOF)

**The missing policy layer between your agent and production.**

[![Status](https://img.shields.io/badge/status-active--development-black)](#)
[![License](https://img.shields.io/badge/license-MIT-blue)](#)
[![Ecosystem](https://img.shields.io/badge/ecosystem-Sigil--OS-purple)](#)

---

## Executive Summary

The **Sigil Open Framework (SOF)** is the open-source policy engine that sits between your agent and production. Define what's allowed once. Everything else is blocked automatically — before it fires.

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

SOF is not a single codebase, it is a **composable protocol stack** — three layers, each independently useful, each enabling the one above it.

Think of it as a franchise protocol. The enforcement substrate is universal — every SOF-compliant deployment runs on the same cryptographic enforcement primitives, regardless of industry. The legal layer converts those guarantees into fiduciary instruments. The vertical boilerplates are the franchise concepts: enforcement and legal pre-assembled for a specific deployment context, ready to go.

---

### Layer 1 — The Enforcement Engine: Open Execution Engine (OEE)

OEE is the domain-agnostic execution enforcement substrate that every SOF-compliant deployment runs on. It provides the core enforcement primitives: policy evaluation via Sigil Lex, Intent Attestation issuance, consensus hold management, and gated RPC/bundler execution. No transaction executes without cryptographic authorization. No exceptions, no industry carve-outs.

OEE is not specific to venture capital, healthcare, or banking. It is the substrate.

### Layer 2 — The Legal Governance Layer: Fiduciary Agent Framework (FAF)

[**→ View the FAF Repository**](https://github.com/Sigil-Core/faf)

FAF is the legal-technical bridge. OEE enforces compliance in the execution layer; FAF enforces it in the legal domain — converting OEE's cryptographic guarantees into bounded fiduciary instruments. FAF provides entity templates, operating agreements, and `warranty.md` policy structure so that human General Partners can assume quantifiable liability for autonomous deployment without unlimited personal exposure.

FAF is what makes OEE legally meaningful.

### Layer 3 — The Vertical Boilerplates

Vertical boilerplates are domain-specific implementations of OEE + FAF. Each inherits the full enforcement stack and adds domain-appropriate `warranty.md` policy templates, sector-specific legal wrapper guidance, and integration examples for common agent frameworks in that industry.

Each vertical inherits the full enforcement stack and adds domain-appropriate `warranty.md` policy templates, sector-specific legal wrapper guidance, and integration examples. Healthcare, banking, and enterprise verticals follow the same architecture. Each new vertical is a deployment context, not a new enforcement mechanism. The enforcement is always OEE.

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

# --- SIGIL OPEN FRAMEWORK: WARRANTY POLICY ---
sigil-warranty:
  enforcement_layer: "Sigil Lex"
  policy_uri: "ipfs://QmYourWarrantyPolicyHashHere"
  attestation_standard: "sigil-attestations-v1"
  warranty_blocks:
    evm:
      max_transaction_eth: 5.0
      allowed_actions: ["wallet.transfer", "contract.call"]
      allowed_chains: [1, 8453, 42161, 10, 137]
      chain_actions:
        "8453": ["contract.call"]
      consensus_threshold_eth: 3.0
    tool_calls:
      allowed: ["bash", "web_fetch", "file_write"]
      bash_blocked_commands: ["rm -rf", "curl"]
    custom:
      - deny_string: "DROP TABLE"
      - deny_if: "metadata.email_to contains @competitor.com"
```

If the agent proposes a transaction that violates any rule in its `warranty.md` policy blocks, Sigil Lex intercepts the request, denies the Intent Attestation, and execution halts instantly at the cryptographic level.

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

Jump into the local toolkit to simulate the Sigil execution firewall offline. It includes a mock Express.js engine, a Python LangChain authorizer, and a `warranty.md` template.
→ [**Open the Developer Toolkit**](./developer-toolkit)

### 📚 Explore the Core Components

If you are designing a full production architecture, explore our specialized ecosystem repositories:

1. **Structuring Legal Compliance?** Start with [Fiduciary Agent Framework (FAF)](https://github.com/Sigil-Core/faf).
2. **Integrating the API?** Read the underlying [Sigil Attestations Spec](https://github.com/Sigil-Core/sigil-attestations).

For comprehensive developer guides, API references, and architecture deep-dives, visit our official documentation.
→ [**docs.sigilcore.com**](https://docs.sigilcore.com)
