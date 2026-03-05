---
title: "Mock Engine"
description: "Setting up the local Express.js execution firewall."
---

# The Mock Engine

The `mock_server.js` file included in the developer toolkit acts as your local `https://sign.sigilcore.com` API. It validates bearer tokens, checks your agent's intent against simple mock logic, and returns a dummy Ed25519 signature.

## Installation & Setup

Navigate to your developer toolkit folder and initialize the Node environment:

```bash
npm init -y
npm install express
```

## **Running the Engine**

Start the mock firewall on Port 3000:

```bash
node mock_server.js
```

You should see the following console output indicating the firewall is active:

```text
======================================================
🚀 Sigil Open Framework - Mock Engine Server Running
======================================================
Listening on: http://localhost:3000
Send POST requests to: http://localhost:3000/v1/authorize
```

Keep this terminal window open. As your agent requests Intent Attestations, you will see the engine's real-time evaluation logs and policy violation rejections printed here.
