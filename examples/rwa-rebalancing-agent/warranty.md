---
title: "RWA Rebalancing Agent"
description: "Warranty policy for an agent rebalancing a tokenized real-world-asset portfolio: contract calls only, per-issuer caps on pinned token addresses, a required parseable amount on every EVM intent, a declared jurisdiction and job type, and denial of listed sanctioned address forms."
---

# Warranty Policy - RWA Rebalancing Agent

Copy the policy body below into Sigil Warrant, sign it, and deploy it with the API key used by this agent.

```markdown
version: 2.0.0

## evm
max_transaction_eth: 0.5
allowed_actions: contract.call
allowed_chains: 1

# Per-issuer caps bind to pinned Ethereum mainnet token contract addresses.
# Token caps govern intents that declare `token`; raw calldata (approve,
# transferFrom) is not decoded at this layer and is bounded only by the ETH
# caps above.
# BENJI: Franklin OnChain U.S. Government Money Fund, verified via
# digitalassets.franklintempleton.com/benji/benji-contracts/ (decimals 18
# on-chain).
token.BENJI.max_transaction: 250000
token.BENJI.decimals: 18
token.BENJI.addresses: 0x3DDc84940Ab509C11B20B76B466933f40b750dc9
# USDY: Ondo US Dollar Yield, verified via ondo.finance/usdy.
token.USDY.max_transaction: 250000
token.USDY.decimals: 18
token.USDY.addresses: 0x96F6eF951840721AdBF46Ac996b59E0235CB985C
# MUST PIN BEFORE DEPLOY: BUIDL (BlackRock USD Institutional Digital Liquidity
# Fund, via Securitize) is left unpinned here because Securitize publishes the
# contract address only behind its investor portal, not in public issuer
# documentation. An unpinned token rule accepts the agent-declared symbol at
# face value, so do not uncomment these lines until you have pinned the
# address confirmed through your Securitize onboarding.
# token.BUIDL.max_transaction: 500000
# token.BUIDL.decimals: 6
# token.BUIDL.addresses: MUST_PIN_FROM_SECURITIZE_ONBOARDING

# Allocations above 0.25 ETH-equivalent require human countersignature.
consensus_threshold_eth: 0.25
consensus_require_hold: true

## custom
# Forces every EVM intent to carry a parseable amount so the ETH caps and the
# consensus hold cannot be skipped by omission. allow_only fails closed on a
# missing field.
allow_only[action=wallet.transfer].intent.amount matches: ^\d+(\.\d+)?$
allow_only[action=contract.call].intent.amount matches: ^\d+(\.\d+)?$

# Every governed intent must declare an approved portfolio job type. Fails
# closed on a missing job_type; the value is agent-declared unless intents
# arrive through a trusted shim.
allow_only.intent.metadata.job_type: rebalance, allocation, risk_check
deny_if.intent.metadata.job_type contains test

# Requires a declared jurisdiction on every governed intent. `jurisdiction` is
# agent-declared metadata, not independently verified, unless intents arrive
# through a trusted shim.
allow_only.intent.metadata.jurisdiction: US, EU, SG, AE
deny_if.intent.metadata.jurisdiction contains restricted

# Denies intents whose declared contract_name contains "unverified".
deny_if.intent.metadata.contract_name contains "unverified"

# Denies listed sanctioned address forms (Tornado Cash examples). Custom-rule
# matching is case-sensitive, so each address is listed in checksummed and
# all-lowercase form; pinned-token matching is not case-sensitive.
# Canonicalization of other casings requires a trusted adapter.
deny_if.intent.targetAddress equals "0x722122dF12D4e14e13Ac3b6895a86e84145b6967"
deny_if.intent.targetAddress equals "0x722122df12d4e14e13ac3b6895a86e84145b6967"
deny_if.intent.targetAddress equals "0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b"
deny_if.intent.targetAddress equals "0xd90e2f925da726b50c4ed8d0fb90ad053324f31b"

# Denies the listed credential string anywhere in the intent. Case-sensitive
# substring matching: defense in depth, not a secrets control.
deny_string: "PRIVATE_KEY"

## soft_limits
daily_evm_limit_eth: 10.0

## execution_limits
max_tool_calls_per_task: 40
max_tool_calls_per_hour: 160

## signature
sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL
```
