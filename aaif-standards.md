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

### Example: `AGENTS.md` with SOF Warranty Policy

When building an SOF-compliant agent, your `AGENTS.md` file will include standard AAIF routing, accompanied by the `sigil-warranty` block that maps directly to the agent's `warranty.md` typed-block structure:

```yaml
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

If the agent proposes a transaction that violates any rule in its `warranty.md` policy blocks, Sigil Lex intercepts the request and denies the Intent Attestation. Execution halts instantly at the cryptographic level.
