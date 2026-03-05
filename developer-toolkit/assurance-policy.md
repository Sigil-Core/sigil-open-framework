---
title: "Assurance Policy"
description: "Defining your deterministic execution constraints."
---

# The Assurance Policy

The `ASSURANCE.md` file acts as **Policy-as-Code**. It is written in a human-readable format that legal partners and human General Partners can audit, but it contains a strictly structured YAML block that the Sigil engine parses deterministically.

## The Template

Copy the `assurance_md_template.md` file in your toolkit and rename it to `ASSURANCE.md`.

This file contains the `sigil-policy` block. The firewall physically prevents the agent from executing any transaction that violates these parameters.

```yaml
sigil-policy:
  version: "1.0.0"
  agent_id: "agent_alpha_yield_01"
  enforcement_mode: "strict"

  # 1. TREASURY CONTROLS
  treasury:
    allowed_assets:
      - token: "USDC"
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    max_transaction_value_usd: 50000

  # 2. EXECUTION BOUNDARIES
  execution:
    permitted_protocols:
      - name: "Uniswap V3 Router"
        address: "0xE592427A0AEce92De3Edee1F18E0157C05861564"
        allowed_methods: ["exactInputSingle", "exactOutputSingle"]
```

## **Validation Rules**

- **Indentation:** Ensure you use spaces, not tabs, within the YAML block.
- **Format:** The policy must be enclosed in a fenced YAML code block (open with three backticks followed by `yaml`, then close with three backticks). The Python tool relies on these fences to extract the execution constraints from the document.
