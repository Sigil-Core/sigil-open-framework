---
title: "DeFi Token Swap Agent"
description: "Warranty policy for an autonomous yield agent with per-tx limits, chain allowlisting, sanctioned address blocking, and human approval above threshold."
---

# Warranty Policy — DeFi Token Swap Agent

version: 1.0.0

## evm
max_transaction_eth: 2.0
allowed_actions: wallet.transfer, contract.call
allowed_chains: 1, 8453, 42161, 10
chain_actions:
  "1": wallet.transfer, contract.call
  "8453": contract.call
  "42161": contract.call
  "10": contract.call

# Transactions above 1.0 ETH require human countersignature
consensus_threshold_eth: 1.0
consensus_require_hold: true

## custom
# Block known sanctioned or high-risk addresses
deny_if.intent.targetAddress equals "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
deny_if.intent.targetAddress equals "0x00000000000000000000000000000000DeaDBeef"

# Block interactions with unverified routers
deny_if.intent.metadata.contract_name contains "unverified"

# Never leak API keys into calldata
deny_string: "OPENAI_API_KEY"
deny_string: "PRIVATE_KEY"

## soft_limits
daily_evm_limit_eth: 50.0

## signature
sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL
