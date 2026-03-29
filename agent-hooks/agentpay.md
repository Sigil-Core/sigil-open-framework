---
title: "AgentPay (WLFI)"
description: "Use @sigilcore/agent-hooks alongside WLFI's AgentPay SDK to govern USD1 transfers before they execute."
---

## Overview

[AgentPay SDK](https://github.com/World-Liberty-Financial-X) enables AI agents to hold and spend USD1 on EVM chains. `@sigilcore/agent-hooks` is natively compatible — no additional configuration needed.

When an AgentPay agent executes a USD1 transfer on Ethereum (chainId 1) or BNB Smart Chain (chainId 56), the `wallet.transfer` or `wallet_sign` action routes through your Sigil policy before the transaction is signed.

**The layers are additive:** AgentPay handles payment mechanics and key management. Sigil determines whether the agent is authorized to initiate the payment at all. AgentPay tells agents how to spend. Sigil tells agents what they're allowed to do.

## Usage

```typescript
import { checkIntent, buildRejectionContext } from '@sigilcore/agent-hooks';

const config = {
  apiKey: process.env.SIGIL_API_KEY!,
  agentId: 'my-agentpay-agent',
};

// AgentPay initiates a USD1 transfer — Sigil evaluates policy first
const result = await checkIntent({
  action: 'wallet.transfer',
  chainId: 1,                          // Ethereum mainnet
  to: '0xRecipientAddress',
  amount: '1000000000000000000',       // 1 USD1 in wei
  txCommit: sha256(rawTx),
}, config);

if (result.decision !== 'APPROVED') {
  // Block the AgentPay transfer — policy not satisfied
  return buildRejectionContext(result, 'wallet.transfer');
}
// AgentPay proceeds with signing
```

## Supported Chains

USD1 is pre-configured on:

| Chain | chainId | Contract Address |
|---|---|---|
| Ethereum | `1` | `0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d` |
| BNB Smart Chain | `56` | `0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d` |

Both chains are already in Sigil Lex's supported EVM chain set. No policy changes required to govern USD1 transfers on either chain.

## Policy Configuration

To enforce limits on USD1 agent transfers, add an `## evm` block to your `warranty.md`:

```markdown
## evm
max_transaction_eth: 1.0
allowed_chains: 1, 56
allowed_actions: wallet.transfer, wallet_sign
consensus_threshold_eth: 0.5
consensus_require_hold: true
```

This policy allows USD1 transfers on Ethereum and BSC, caps single transfers at 1 ETH equivalent, and requires human approval for transfers above 0.5 ETH.

Generate and sign your policy at [sigilcore.com/tools/warrant](https://sigilcore.com/tools/warrant).
