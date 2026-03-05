### **Mock Express.js Server**

This acts as your local https://sign.sigilcore.com for offline testing. It validates the bearer token, checks the intent against a simple mock logic, and returns a dummy Ed25519 signature.

**Prerequisites for the developer:**

```bash
npm init -y
npm install express
```

_(Alternative: If they want auto-reloading during development, npm install -g nodemon and run with nodemon mock_server.js)_

Instruct developers to save this as mock_server.js:

```javascript
const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const EXPECTED_API_KEY = "DEV_MOCK_KEY_123";

app.post("/v1/authorize", (req, res) => {
  console.log("🛡️ [Sigil Engine Mock] Received authorization request...");

  // 1. Validate API Key
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${EXPECTED_API_KEY}`) {
    console.log("❌ [Sigil Engine Mock] Invalid API Key");
    return res
      .status(401)
      .json({ rebound_reason: "Unauthorized: Invalid API Key" });
  }

  const { agent_intent, policy_constraints } = req.body;

  // 2. Perform Mock Validation (e.g., checking if token is USDC)
  console.log(
    `🔍 [Sigil Engine Mock] Evaluating intent to interact with: ${agent_intent.to}`,
  );

  if (agent_intent.asset !== "USDC" && agent_intent.asset !== "WETH") {
    console.log("❌ [Sigil Engine Mock] Policy Violation: Asset not allowed");
    return res.status(403).json({
      rebound_reason: `Policy Violation: Asset ${agent_intent.asset} is not in allowed_assets.`,
    });
  }

  // 3. Generate Mock Attestation
  console.log(
    "✅ [Sigil Engine Mock] Intent matches policy. Issuing Attestation.",
  );

  // Generate a random mock signature just to simulate Ed25519 payload
  const mockSignature = crypto.randomBytes(64).toString("hex");
  const attestationId = `att_${crypto.randomBytes(8).toString("hex")}`;

  res.status(200).json({
    status: "AUTHORIZED",
    attestation_id: attestationId,
    ed25519_signature: mockSignature,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`\\n======================================================`);
  console.log(`🚀 Sigil Open Framework - Mock Engine Server Running`);
  console.log(`======================================================`);
  console.log(`Listening on: http://localhost:${PORT}`);
  console.log(`Send POST requests to: http://localhost:${PORT}/v1/authorize`);
  console.log(`Expected Bearer Token: ${EXPECTED_API_KEY}\\n`);
});
```

**To run the mock server:**

```bash
node mock_server.js
```
