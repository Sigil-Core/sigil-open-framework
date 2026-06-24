---
title: "Stablecoin Treasury Agent"
description: "Warranty policy for an autonomous treasury agent managing stablecoin reserves: per-issuer caps, pinned USDC addresses, chain allowlisting, consensus hold, sanctioned-address blocking, and allowlisted job types."
---

# Warranty Policy - Stablecoin Treasury Agent

Copy the policy body below into Sigil Warrant, sign it, and deploy it with the API key used by this agent.

```markdown
version: 1.0.0

## evm
max_transaction_eth: 1.0
allowed_actions: wallet.transfer, contract.call
allowed_chains: 1, 8453, 42161, 10

# USDC amounts are bound to pinned issuer contract addresses.
token.USDC.max_transaction: 250000
token.USDC.decimals: 6
token.USDC.addresses: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
token.USDC.addresses: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
token.USDC.addresses: 0xaf88d065e77c8cC2239327C5EDb3A432268e5831
token.USDC.addresses: 0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85

# Set each additional issuer's decimals and pinned contract address to match
# its deployed token before deploy.
token.PYUSD.max_transaction: 100000
token.PYUSD.decimals: 6
token.USDT.max_transaction: 100000
token.USDT.decimals: 6

# Movements above 0.5 ETH-equivalent require human countersignature.
consensus_threshold_eth: 0.5
consensus_require_hold: true

## custom
# Require every governed intent to declare an approved treasury job type.
allow_only.intent.metadata.job_type: rebalance, reserve_check, treasury_reconcile
deny_if.intent.metadata.job_type contains test

# Block OFAC-sanctioned addresses (Tornado Cash examples).
deny_if.intent.targetAddress equals "0x722122dF12D4e14e13Ac3b6895a86e84145b6967"
deny_if.intent.targetAddress equals "0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b"

# Block swaps into any stablecoin not on the pinned issuer allowlist.
deny_if.intent.metadata.contract_name contains "unverified"

# Never leak signing keys or credentials into calldata.
deny_string: "PRIVATE_KEY"
deny_string: "OPENAI_API_KEY"

## soft_limits
daily_evm_limit_eth: 25.0

## execution_limits
max_tool_calls_per_task: 50
max_tool_calls_per_hour: 200

## signature
sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL
```
