# Sigil Open Framework: Fiduciary Assurance Policy

**Policy Version:** 1.0.0  
**Legal Entity Anchor:** Alpha Yield Partners, LLC (US-DE)  
**Network:** Ethereum Mainnet (Chain ID: 1)

## Executive Summary

This document defines the deterministic execution boundaries for the Alpha Yield Agent. The parameters within the `sigil-policy` block below are mathematically enforced by the Sigil OS execution firewall. The Agent cannot generate a valid Intent Attestation for any transaction that violates these parameters.

## Deterministic Constraints (Machine-Readable)

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
      - token: "WETH"
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    max_transaction_value_usd: 50000

  # 2. EXECUTION BOUNDARIES
  execution:
    permitted_protocols:
      - name: "Uniswap V3 Router"
        address: "0xE592427A0AEce92De3Edee1F18E0157C05861564"
        allowed_methods: ["exactInputSingle", "exactOutputSingle"]
    block_unverified_contracts: true

  # 3. COMPLIANCE (FAF Integration)
  compliance:
    require_ofac_sanction_check: true
    block_tornado_cash_taint: true
```

---

### Step 2: Python AgentKit / LangChain Tool

Use the included `sigil_authorizer.py` in this same folder. It expects your active policy file to be named `ASSURANCE.md`.

```bash
cp assurance_md_template.md ASSURANCE.md
python -i sigil_authorizer.py
```
