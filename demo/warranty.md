# Warranty Policy - Sigil Demo

version: 1.0.0

## evm
max_transaction_eth: 1.0
allowed_actions: wallet.transfer, contract.call
allowed_chains: 1, 8453
consensus_threshold_eth: 1.0
consensus_require_hold: true
token.USDC.max_transaction: 10000
token.USDC.decimals: 6
token.USDC.addresses: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48, 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

## tool_calls
allowed: bash, web_fetch, file_write, email.send
bash.blocked_commands: rm -rf, rm -r /
email.require_approval: true
email.allowed_recipients: *@sigilcore.com, partner@example.com
email.blocked_recipients: noreply@sigilcore.com

## custom
# AWP-style job-type allowlist: every governed intent must carry one of these values.
allow_only.intent.metadata.job_type: research, data_labeling, escrow_release
deny_if.intent.metadata.job_type contains test
deny_string: "OPENAI_API_KEY"

## execution_limits
max_tool_calls_per_task: 50

## signature
sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL
