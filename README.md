# Sigil Open Framework (SOF)

**The open-source standard for cryptographically secured, legally compliant autonomous agents.**

[![Status](https://img.shields.io/badge/status-active--development-black)](#)  
[![License](https://img.shields.io/badge/license-MIT-blue)](#)  
[![Ecosystem](https://img.shields.io/badge/ecosystem-Sigil--OS-purple)](#)

---

## Executive Summary

The **Sigil Open Framework (SOF)** is a modular, open-source architecture designed to solve the final barrier to autonomous agent adoption: **Liability.**

While standard AI frameworks give agents the intelligence to act, SOF gives them the cryptographic and legal boundaries required to operate safely in the real world. SOF bridges the gap between autonomous code and real-world compliance by acting as an umbrella over two core domains: **Technical Execution** and **Legal Structuring**.

If standard agentic frameworks are the accelerator pedal, SOF is the cryptographic brake system and the vehicle's registration.

---

## The Architecture: Two Halves of the Same Coin

SOF is not a single codebase; it is a composable ecosystem of specialized primitives. Developers can snap these components together to build autonomous financial entities, self-driving DAO treasuries, and Agentic VC funds.

### 1. The Technical Engine: Open Venture Engine (OVE)

[**→ View the OVE Repository**](https://github.com/Sigil-Core/ove)

OVE acts as the deterministic execution firewall. It ensures that an AI agent physically cannot execute an on-chain transaction without a cryptographically signed **Intent Attestation**. OVE bounds the AI to a hard-coded rulebook (`ASSURANCE.md`), preventing it from draining treasuries, executing unauthorized trades, or bypassing fiduciary constraints.

### 2. The Legal Wrapper: Fiduciary Agent Framework (FAF)

[**→ View the FAF Repository**](https://github.com/Sigil-Core/faf)

FAF is the legal-technical bridge. Because OVE guarantees the AI won't go rogue, human operators can safely use FAF to wrap the agent in a traditional legal entity (like an LLC). FAF structures the agent as tokenized on-chain property (ERC-6551), allowing human General Partners to assume bounded, quantifiable liability for autonomous capital deployment.

### 3. The Standard: Sigil Attestations

[**→ View the Attestations Repository**](https://github.com/Sigil-Core/sigil-attestations)

The underlying cryptographic standard powering the entire framework. This repository defines the canonical specification for generating and verifying the short-lived, Ed25519-signed JWTs required for deterministic execution.

---

## Aligning with the Linux Foundation (AAIF)

The Linux Foundation’s Agentic AI Foundation (AAIF) has established open-source standards for how agents are built and connected, primarily through the `AGENTS.md` specification.

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
x-sigil-constraints:
  enforcement_layer: "Sigil OS"
  policy_uri: "ipfs://QmYourAssurancePolicyHashHere"
  attestation_standard: "sigil-attestations-v1"
  deterministic_rules:
    - max_transaction_value: "50000 USDC"
    - permitted_contracts: ["0xDefiRouterAddress1", "0xDefiRouterAddress2"]
    - human_override_required: true
    - block_sanctioned_entities: true
```

If the agent proposes a transaction that violates any rule in the x-sigil-constraints block, the Sigil Open Framework intercepts the request, denies the Intent Attestation, and execution halts instantly at the cryptographic level.

---

**Human-in-the-Loop Oversight**

SOF ensures that while execution is autonomous, oversight is absolute. Through integrations with **Sigil Sentry** (the mobile command center), human partners retain:

- **Real-time Execution Monitoring:** View intent proposals before they hit the chain.
- **High-Value Approvals:** Require manual cryptographic countersignatures for specific thresholds.
- **The Kill Switch:** An emergency pause that instantly revokes the agent's capability to generate valid attestations.

---

## Getting Started

To begin building with the Sigil Open Framework, select the path that fits your needs:

### 🛠️ Start Building Now (Hackathons & Local Dev)

Jump into the local toolkit to simulate the Sigil execution firewall offline. It includes a mock Express.js engine, a Python LangChain authorizer, and an `ASSURANCE.md` template.  
→ [**Open the Developer Toolkit**](./developer_toolkit)

### 📚 Explore the Core Components

If you are designing a full production architecture, explore our specialized ecosystem repositories:

1. **Building an Agentic Fund?** Start with [Open Venture Engine (OVE)](https://github.com/Sigil-Core/ove).
2. **Structuring Legal Compliance?** Start with [Fiduciary Agent Framework (FAF)](https://github.com/Sigil-Core/faf).
3. **Integrating the API?** Read the underlying [Sigil Attestations Spec](https://github.com/Sigil-Core/sigil-attestations).

For comprehensive developer guides, API references, and architecture deep-dives, visit our official documentation.  
→ [**docs.sigilcore.com**](https://docs.sigilcore.com)

---
