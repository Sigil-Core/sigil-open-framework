---
title: "AAIF Standards Alignment"
description: "How Sigil Open Framework extends the Linux Foundation's agentic standards."
---

# AAIF Standards Alignment

The Linux Foundation’s Agentic AI Foundation (AAIF) has established critical open-source standards for how autonomous agents are built, connected, and defined. Their primary specification, `AGENTS.md`, acts as a public manifesto. It tells the world what an agent is capable of and how to interact with it.

However, `AGENTS.md` is an accelerator pedal. It lacks cryptographic brakes. It dictates what an agent **can** do, but it cannot physically enforce what the agent **cannot** do.

## The Sigil Extension

The Sigil Open Framework (SOF) natively adopts the AAIF standards but introduces a mandatory **Security & Execution Constraints** block directly into the specification.

While AAIF defines the agent's capabilities, the Sigil extension defines its deterministic limits.

### Example: `AGENTS.md` with SOF Constraints

When building an SOF-compliant agent, your `AGENTS.md` file will include standard AAIF routing, accompanied by the `sigil-constraints` block:

```yaml
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
    - block_sanctioned_entities: true
```

If the agent proposes a transaction that violates any rule mapped within these constraints, the Sigil execution firewall intercepts the request and denies the Intent Attestation. Execution halts instantly at the cryptographic level.
