---
title: "Quick Start"
description: "Run the Sigil execution firewall locally for offline agent testing."
---

# Developer Toolkit: Quick Start

The Developer Toolkit provides a localized testing environment to build and validate your Agentic VC or DAO treasury integrations entirely offline. You can test your agent's reasoning and policy compliance before ever interacting with the live Sigil OS production engine.

## The Workflow

The local toolkit simulates the exact production flow:

1. Your agent reads the `ASSURANCE.md` policy.
2. The agent proposes a transaction to the local Mock Engine.
3. The Mock Engine evaluates the intent and either deterministically rejects it or issues a simulated Ed25519 Intent Attestation.

## Prerequisites

To use the toolkit, ensure you have the following installed:

- Node.js 20+ (for the Mock Engine)
- Python 3.9+ (for the LangChain Authorizer)

## Testing Your Agent

We have provided a production-ready Python LangChain tool (`sigil_authorizer.py`) inside the toolkit. Once your Mock Engine is running (see the Mock Engine page), you can test the authorization flow.

Install the required Python dependencies:

```bash
pip install langchain-core pydantic pyyaml requests
```

Open an interactive Python shell and load the tool:

```bash
python -i sigil_authorizer.py
```

Simulate a compliant transaction:

```python
request_sigil_intent_attestation.invoke({
    "to_address": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    "amount": "1000000000",
    "token": "USDC",
    "contract_method": "exactInputSingle"
})
```

_Result: The Mock Engine will grant the simulated attestation._
