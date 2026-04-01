# Warranty Policy — Sigil Demo

version: 1.0.0

## evm
max_transaction_eth: 2.0
allowed_actions: wallet.transfer, contract.call
allowed_chains: 1, 8453
consensus_threshold_eth: 1.0
consensus_require_hold: true

## tool_calls
allowed: bash, web_fetch, file_write
bash.blocked_commands: rm -rf, rm -r /

## signature
sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL
