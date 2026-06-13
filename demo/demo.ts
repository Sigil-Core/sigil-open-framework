/**
 * Sigil Demo - five agent actions against the live /v1/authorize endpoint.
 *
 * Scene 1: APPROVED  - Base USDC contract.call under token cap
 * Scene 2: DENIED    - Base USDC contract.call over token cap
 * Scene 3: PENDING   - allowed email recipient held for approval
 * Scene 4: DENIED    - blocked email recipient
 * Scene 5: DENIED    - non-allowlisted AWP job type
 *
 * Requires: SIGIL_API_KEY env var and a deployed warranty.md with the policy
 * defined in this directory's warranty.md (or equivalent).
 *
 * Usage: SIGIL_API_KEY=sk_sigil_... npx tsx demo.ts
 */

import { createHash } from "node:crypto";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SIGIL_BASE_URL =
  process.env.SIGIL_BASE_URL || "https://sign.sigilcore.com";
const SIGIL_API_KEY = process.env.SIGIL_API_KEY;
const BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

if (!SIGIL_API_KEY) {
  console.error(
    "\x1b[31mError: SIGIL_API_KEY is not set.\x1b[0m\n" +
      "Get one at https://sigilcore.com/tools/keys and run:\n" +
      "  SIGIL_API_KEY=sk_sigil_... npm run demo\n",
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function txCommit(intent: Record<string, unknown>): string {
  return createHash("sha256")
    .update(JSON.stringify(intent))
    .digest("hex");
}

function header(label: string): void {
  const pad = "\u2501".repeat(42 - label.length);
  console.log(`\n\x1b[1m\u2501\u2501\u2501 ${label} ${pad}\x1b[0m`);
}

function desc(text: string): void {
  console.log(`\x1b[2m> ${text}\x1b[0m`);
}

async function authorize(body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${SIGIL_BASE_URL}/v1/authorize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SIGIL_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

async function scene1(): Promise<void> {
  header("Scene 1: APPROVED");
  desc("contract.call on Base USDC, amount: 2500.50 USDC");

  const intent = {
    action: "contract.call",
    token: "USDC",
    amount: "2500.50",
    targetAddress: BASE_USDC,
    metadata: { job_type: "research" },
  };
  const result = await authorize({
    framework: "demo",
    agentId: "demo-agent",
    chainId: 8453,
    txCommit: txCommit(intent),
    intent,
  });

  console.log(JSON.stringify(result, null, 2));
}

async function scene2(): Promise<void> {
  header("Scene 2: DENIED");
  desc("contract.call on Base USDC, amount: 12500 USDC");

  const intent = {
    action: "contract.call",
    token: "USDC",
    amount: "12500",
    targetAddress: BASE_USDC,
    metadata: { job_type: "research" },
  };
  const result = await authorize({
    framework: "demo",
    agentId: "demo-agent",
    chainId: 8453,
    txCommit: txCommit(intent),
    intent,
  });

  console.log(JSON.stringify(result, null, 2));
}

async function scene3(): Promise<void> {
  header("Scene 3: PENDING");
  desc("email.send to an allowed recipient, held for approval");

  const intent = {
    action: "email.send",
    to: "team@sigilcore.com",
    metadata: { job_type: "research" },
  };
  const result = await authorize({
    framework: "demo",
    agentId: "demo-agent",
    chainId: 8453,
    txCommit: txCommit(intent),
    intent,
  });

  console.log(JSON.stringify(result, null, 2));
}

async function scene4(): Promise<void> {
  header("Scene 4: DENIED");
  desc("email.send to a blocked recipient");

  const intent = {
    action: "email.send",
    to: "noreply@sigilcore.com",
    metadata: { job_type: "research" },
  };
  const result = await authorize({
    framework: "demo",
    agentId: "demo-agent",
    chainId: 8453,
    txCommit: txCommit(intent),
    intent,
  });

  console.log(JSON.stringify(result, null, 2));
}

async function scene5(): Promise<void> {
  header("Scene 5: DENIED");
  desc("AWP-style work claim with a non-allowlisted job_type");

  const intent = {
    action: "contract.call",
    token: "USDC",
    amount: "10",
    targetAddress: BASE_USDC,
    metadata: { job_type: "yield_farming" },
  };
  const result = await authorize({
    framework: "demo",
    agentId: "demo-agent",
    chainId: 8453,
    txCommit: txCommit(intent),
    intent,
  });

  console.log(JSON.stringify(result, null, 2));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log(
    "\x1b[1mSigil Demo\x1b[0m - five agent actions against the live policy engine\n",
  );

  await scene1();
  await scene2();
  await scene3();
  await scene4();
  await scene5();

  console.log(
    "\n\x1b[2mDone. See https://docs.sigilcore.com for full documentation.\x1b[0m\n",
  );
}

main().catch((err) => {
  console.error("\x1b[31mFatal:\x1b[0m", err);
  process.exit(1);
});
