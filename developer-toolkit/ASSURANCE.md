## version
1.0.0

## meta
agent_name: "My Agent"
operator: "<OPERATOR_NAME>"
entity: "<LEGAL_ENTITY>"
issued: "<YYYY-MM-DDTHH:MM:SSZ>"

## class1
- max_transaction_eth: 5.0
- allowed_actions: [wallet.transfer, contract.call]
- allowed_chains: [1, 8453, 42161]
- chain_actions:
  - "8453": [wallet.transfer]
  - "1": [wallet.transfer, contract.call]

## class2
- daily_limit_eth: 20.0

## class3
- consensus_threshold_eth: 10.0
- require_hold: false

# Sign this file using the Sigil ASSURANCE.md Drafter at sigilcore.com before deploying.
## signature
- algorithm: Ed25519
- policy_hash: PLACEHOLDER
- operator_signature: PLACEHOLDER
- operator_public_key: PLACEHOLDER
- signed_at: PLACEHOLDER
