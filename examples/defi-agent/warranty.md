---
title: "DeFi Token Swap Agent"
description: "Warranty policy for an autonomous yield agent with ETH and USDC caps, chain allowlisting, a required parseable amount on every EVM intent, a declared job type, and denial of listed sanctioned address forms."
---

# Warranty Policy - DeFi Token Swap Agent

Copy the policy body below into Sigil Warrant, sign it, and deploy it with the API key used by this agent.

```markdown
version: 2.0.0

## evm
max_transaction_eth: 2.0
allowed_actions: wallet.transfer, contract.call
allowed_chains: 1, 8453, 42161, 10
chain_actions:
  "1": wallet.transfer, contract.call
  "8453": contract.call
  "42161": contract.call
  "10": contract.call

# Token rules bind USDC amounts to pinned token contract addresses. Token caps
# govern intents that declare `token`; raw calldata (approve, transferFrom)
# is not decoded at this layer and is bounded only by the ETH caps above.
token.USDC.max_transaction: 10000
token.USDC.decimals: 6
token.USDC.addresses: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
token.USDC.addresses: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
token.USDC.addresses: 0xaf88d065e77c8cC2239327C5EDb3A432268e5831
token.USDC.addresses: 0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85

# Transactions above 1.0 ETH require human countersignature
consensus_threshold_eth: 1.0
consensus_require_hold: true

## custom
# Forces every EVM intent to carry a parseable amount so the ETH caps and the
# consensus hold cannot be skipped by omission. allow_only fails closed on a
# missing field.
allow_only[action=wallet.transfer].intent.amount matches: ^\d+(\.\d+)?$
allow_only[action=contract.call].intent.amount matches: ^\d+(\.\d+)?$

# Every governed intent must declare an approved job type. Fails closed on a
# missing job_type; the value is agent-declared unless intents arrive through
# a trusted shim.
allow_only.intent.metadata.job_type: rebalance, risk_check, treasury_reconcile
deny_if.intent.metadata.job_type contains test

# Denies listed sanctioned address forms (Tornado Cash examples). Custom-rule
# matching is case-sensitive, so each address is listed in checksummed and
# all-lowercase form; pinned-token matching is not case-sensitive.
# Canonicalization of other casings requires a trusted adapter.
deny_if.intent.targetAddress equals "0x722122dF12D4e14e13Ac3b6895a86e84145b6967"
deny_if.intent.targetAddress equals "0x722122df12d4e14e13ac3b6895a86e84145b6967"
deny_if.intent.targetAddress equals "0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b"
deny_if.intent.targetAddress equals "0xd90e2f925da726b50c4ed8d0fb90ad053324f31b"

# Denies intents whose declared contract_name contains "unverified".
deny_if.intent.metadata.contract_name contains "unverified"

# Denies listed credential strings anywhere in the intent. Case-sensitive
# substring matching: defense in depth, not a secrets control.
deny_string: "OPENAI_API_KEY"
deny_string: "PRIVATE_KEY"

## soft_limits
daily_evm_limit_eth: 50.0

## execution_limits
max_tool_calls_per_task: 50

## signature
sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL
```
