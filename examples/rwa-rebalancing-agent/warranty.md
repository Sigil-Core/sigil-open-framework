---
title: "RWA Rebalancing Agent"
description: "Warranty policy for an agent rebalancing a tokenized real-world-asset portfolio: contract calls only, per-issuer token caps, jurisdictional allowlisting, consensus hold, and allowlisted job types."
---

# Warranty Policy - RWA Rebalancing Agent

Copy the policy body below into Sigil Warrant, sign it, and deploy it with the API key used by this agent.

```markdown
version: 1.0.0

## evm
max_transaction_eth: 0.5
allowed_actions: contract.call
allowed_chains: 1

# Set each tokenized RWA issuer's decimals and pinned contract address to match
# its deployed token before deploy.
token.BUIDL.max_transaction: 500000
token.BUIDL.decimals: 6
token.BENJI.max_transaction: 250000
token.BENJI.decimals: 6
token.USDY.max_transaction: 250000
token.USDY.decimals: 18

# Allocations above 0.25 ETH-equivalent require human countersignature.
consensus_threshold_eth: 0.25
consensus_require_hold: true

## custom
# Require every governed intent to declare an approved portfolio job type.
allow_only.intent.metadata.job_type: rebalance, allocation, risk_check
deny_if.intent.metadata.job_type contains test

# Enforce a jurisdictional allowlist on every rebalance.
allow_only.intent.metadata.jurisdiction: US, EU, SG, AE
deny_if.intent.metadata.jurisdiction contains restricted

# Block allocations into unverified or uncredentialed issuers.
deny_if.intent.metadata.contract_name contains "unverified"

# Block OFAC-sanctioned addresses (Tornado Cash examples).
deny_if.intent.targetAddress equals "0x722122dF12D4e14e13Ac3b6895a86e84145b6967"
deny_if.intent.targetAddress equals "0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b"

# Never leak signing keys into calldata.
deny_string: "PRIVATE_KEY"

## soft_limits
daily_evm_limit_eth: 10.0

## execution_limits
max_tool_calls_per_task: 40
max_tool_calls_per_hour: 160

## signature
sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL
```
