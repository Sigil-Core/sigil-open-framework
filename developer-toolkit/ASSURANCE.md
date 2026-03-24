# ASSURANCE Policy
<!-- Sigil Lex — ASSURANCE.md Template -->
<!--
  Copy this file to config/ASSURANCE.md and customise for your deployment.
  config/ASSURANCE.md is gitignored — never commit the live policy file.

  Sign this file using Sigil Warrant at sigilcore.com/tools/warrant before deploying.
-->

version: 1.0.0

## Class 1: Hard Rules
max_transaction_eth: 5.0
allowed_actions: wallet.transfer, contract.call
allowed_chains: 1, 8453, 42161
chain_actions:
  "1": wallet.transfer, contract.call
  "8453": wallet.transfer

## Class 2: Soft Rules
daily_limit_eth: 20.0

## Class 3: Consensus Rules
consensus_threshold_eth: 10.0
consensus_require_hold: false
