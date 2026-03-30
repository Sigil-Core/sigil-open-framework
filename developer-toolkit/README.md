# 🛠️ Sigil Open Framework: Developer Toolkit

Welcome to the SOF local testing environment. This toolkit allows you to build, test, and validate your agent integrations entirely offline before connecting to the live Sigil Sign production firewall.

## What's Inside?

- `mock_server.js` — A local Express.js server that simulates the Sigil execution firewall (`https://sign.sigilcore.com`).
- `sigil_authorizer.py` — A production-ready Python LangChain tool that requests the cryptographic attestation.
- `warranty-policy.md` — Documentation on the `warranty.md` policy format and how to generate a signed policy using Sigil Warrant.

---

## 🚀 Quick Start Guide

### Step 1: Generate and deploy your policy

The execution engine requires a signed `warranty.md` file to enforce boundaries.

1. Go to [sigilcore.com/tools/warrant](https://sigilcore.com/tools/warrant) and choose your path:
   - **Warrant Builder** — guided step-by-step form, no policy syntax required
   - **Manual Warrant** — write your policy directly in the `warranty.md` format

2. Generate your Ed25519 keypair, define your policy rules, sign, and download `warranty.md`.

3. Deploy the signed file to your server and set `LEX_WARRANTY_PATH` to its location. Set `LEX_OPERATOR_PUBLIC_KEY` to the public key value Sigil Warrant provides.

### Step 2: Boot the Mock Execution Engine

Start the local server to act as your cryptographic firewall. You will need Node.js installed.

```bash
# Initialize and install the Express framework
npm init -y
npm install express

# Start the mock firewall on Port 3000
node mock_server.js
```

_Keep this terminal window open. You will see the engine's real-time evaluation logs here._

### Step 3: Test the Agent Tooling

In a new terminal window, set up your Python environment and test the LangChain authorizer against the local engine.

```bash
# Install required Python dependencies
pip install langchain-core pydantic pyyaml requests

# Open a Python shell to test the tool
python -i sigil_authorizer.py
```

Once inside the interactive Python shell, manually trigger the tool to simulate your agent requesting an authorized trade:

```python
# Simulate a compliant transaction (Swapping USDC on Uniswap)
request_sigil_intent_attestation.invoke({
 "to_address": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
 "amount": "1000000000",
 "token": "USDC",
 "contract_method": "exactInputSingle"
})

# Simulate a policy violation (Trying to swap an unauthorized token like PEPE)
request_sigil_intent_attestation.invoke({
 "to_address": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
 "amount": "1000000000",
 "token": "PEPE",
 "contract_method": "exactInputSingle"
})
```

Watch your `mock_server.js` terminal. You will see the engine instantly grant the Ed25519 signature for the USDC trade, and deterministically reject the PEPE trade based on your `warranty.md` rules.

---

## 🛑 Troubleshooting

- **Port 3000 is already in use:** Specify a different port dynamically:

```bash
PORT=8080 node mock_server.js
```

_(Remember to update `SIGIL_API_ENDPOINT` in your Python script to match the new port.)_

- **YAML Parsing Errors:** If your Python script crashes, ensure your policy file uses spaces for indentation — not tabs.

## Next Steps

Once your agent can successfully generate and handle Intent Attestations locally, you are ready to point your endpoint to the live production API.

Return to the main [**Sigil Open Framework Documentation**](../README.md) for production integration guides.
