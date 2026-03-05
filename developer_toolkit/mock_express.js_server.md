### **Mock Express.js Server**

This acts as your local https://sign.sigilcore.com for offline testing. It validates the bearer token, checks the intent against a simple mock logic, and returns a dummy Ed25519 signature.

**Prerequisites for the developer:**

Bash

npm init \-y  
npm install express

_(Alternative: If they want auto-reloading during development, npm install \-g nodemon and run with nodemon mock_server.js)_

Instruct developers to save this as mock_server.js:

JavaScript

const express \= require('express');  
const crypto \= require('crypto');

const app \= express();  
app.use(express.json());

const PORT \= process.env.PORT || 3000;  
const EXPECTED_API_KEY \= "DEV_MOCK_KEY_123";

app.post('/v1/authorize', (req, res) \=\> {  
 console.log("🛡️ \[Sigil Engine Mock\] Received authorization request...");

    // 1\. Validate API Key
    const authHeader \= req.headers.authorization;
    if (\!authHeader || authHeader \!== \`Bearer ${EXPECTED\_API\_KEY}\`) {
        console.log("❌ \[Sigil Engine Mock\] Invalid API Key");
        return res.status(401).json({ rebound\_reason: "Unauthorized: Invalid API Key" });
    }

    const { agent\_intent, policy\_constraints } \= req.body;

    // 2\. Perform Mock Validation (e.g., checking if token is USDC)
    console.log(\`🔍 \[Sigil Engine Mock\] Evaluating intent to interact with: ${agent\_intent.to}\`);

    if (agent\_intent.asset \!== "USDC" && agent\_intent.asset \!== "WETH") {
        console.log("❌ \[Sigil Engine Mock\] Policy Violation: Asset not allowed");
        return res.status(403).json({
            rebound\_reason: \`Policy Violation: Asset ${agent\_intent.asset} is not in allowed\_assets.\`
        });
    }

    // 3\. Generate Mock Attestation
    console.log("✅ \[Sigil Engine Mock\] Intent matches policy. Issuing Attestation.");

    // Generate a random mock signature just to simulate Ed25519 payload
    const mockSignature \= crypto.randomBytes(64).toString('hex');
    const attestationId \= \`att\_${crypto.randomBytes(8).toString('hex')}\`;

    res.status(200).json({
        status: "AUTHORIZED",
        attestation\_id: attestationId,
        ed25519\_signature: mockSignature,
        timestamp: new Date().toISOString()
    });

});

app.listen(PORT, () \=\> {  
 console.log(\`\\n======================================================\`);  
 console.log(\`🚀 Sigil Open Framework \- Mock Engine Server Running\`);  
 console.log(\`======================================================\`);  
 console.log(\`Listening on: http://localhost:${PORT}\`);  
    console.log(\`Send POST requests to: http://localhost:${PORT}/v1/authorize\`);  
 console.log(\`Expected Bearer Token: ${EXPECTED_API_KEY}\\n\`);  
});

**To run the mock server:**

Bash

node mock_server.js
