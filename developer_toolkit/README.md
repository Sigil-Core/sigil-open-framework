Markdown

\# 🛠️ Sigil Open Framework: Developer Toolkit

Welcome to the SOF local testing environment. This toolkit allows you to build, test, and validate your Agentic VC or DAO treasury integrations entirely offline before interacting with the live Sigil OS production engine.

\#\# What's Inside?  
\* \`mock_server.js\` — A local Express.js server that simulates the Sigil execution firewall (\`https://sign.sigilcore.com\`).  
\* \`sigil_authorizer.py\` — A production-ready Python LangChain tool that parses your policy and requests the cryptographic attestation.  
\* \`assurance_md_template.md\` — A boilerplate Fiduciary Assurance Policy containing the deterministic rules your agent must follow.

\---

\#\# 🚀 Quick Start Guide

\#\#\# Step 1: Set Up Your Policy  
The execution engine requires an \`ASSURANCE.md\` file to enforce boundaries.  
1\. Copy the provided template to active use:  
 \`\`\`bash  
 cp assurance_md_template.md ASSURANCE.md

2. Open ASSURANCE.md and review the sigil-policy YAML block. By default, it restricts the agent to USDC/WETH transactions and whitelists the Uniswap V3 Router.

### **Step 2: Boot the Mock Execution Engine**

Start the local server to act as your cryptographic firewall. You will need Node.js installed.

Bash

\# Initialize and install the Express framework  
npm init \-y  
npm install express

\# Start the mock firewall on Port 3000  
node mock_server.js

_Keep this terminal window open. You will see the engine's real-time evaluation logs here._

### **Step 3: Test the Agent Tooling**

In a new terminal window, set up your Python environment and test the LangChain authorizer against the local engine.

Bash

\# Install required Python dependencies  
pip install langchain-core pydantic pyyaml requests

\# Open a Python shell to test the tool  
python \-i sigil_authorizer.py

Once inside the interactive Python shell, manually trigger the tool to simulate your agent requesting an authorized trade:

Python

\# Simulate a compliant transaction (Swapping USDC on Uniswap)  
request_sigil_intent_attestation.invoke({  
 "to_address": "0xE592427A0AEce92De3Edee1F18E0157C05861564",  
 "amount": "1000000000",  
 "token": "USDC",  
 "contract_method": "exactInputSingle"  
})

\# Simulate a policy violation (Trying to swap an unauthorized token like PEPE)  
request_sigil_intent_attestation.invoke({  
 "to_address": "0xE592427A0AEce92De3Edee1F18E0157C05861564",  
 "amount": "1000000000",  
 "token": "PEPE",  
 "contract_method": "exactInputSingle"  
})

Watch your mock_server.js terminal. You will see the engine instantly grant the Ed25519 signature for the USDC trade, and deterministically REJECT the PEPE trade based on your ASSURANCE.md rules.

## ---

**🛑 Troubleshooting / Alternatives**

- **Port 3000 is already in use:** If the mock server fails to start, specify a different port dynamically:  
  Bash  
  PORT=8080 node mock_server.js

  _(Remember to update SIGIL_API_ENDPOINT in your Python script to match the new port)._

- **YAML Parsing Errors:** If your Python script crashes reading the policy, ensure your ASSURANCE.md strictly contains the \`\`\`yaml block. Do not use tabs for indentation in YAML; use spaces.

## **Next Steps**

Once your agent can successfully generate and handle Intent Attestations locally, you are ready to point your endpoint to the live production API and submit your transaction on-chain.

Return to the main [**Sigil Open Framework Documentation**](https://www.google.com/search?q=../README.md) for production integration guides.

\*\*\*

\#\#\# Next Step

This setup guarantees developers get their "Aha\!" moment within 60 seconds of cloning the toolkit.

Since you are restructuring the documentation pipeline for Mintlify, would you like me to map out the exact \`mint.json\` navigation structure so your \`docs/\` folder accurately categorizes OVE, FAF, the Attestations standard, and this Developer Toolkit on the final website?
