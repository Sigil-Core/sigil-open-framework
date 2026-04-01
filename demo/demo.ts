/**
 * Sigil Demo — three agent actions against the live /v1/authorize endpoint.
 *
 * Scene 1: APPROVED  — contract.call on Base, 0.5 ETH (under threshold)
 * Scene 2: DENIED    — bash rm -rf (blocked command)
 * Scene 3: PENDING   — wallet.transfer 1.5 ETH (above consensus threshold)
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
  console.log(`\x1b[2m\u2192 ${text}\x1b[0m`);
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
  desc("contract.call on chain 8453, amount: 0.5 ETH");

  const intent = { action: "contract.call", amount: "500000000000000000" };
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
  desc("bash: rm -rf /var/data");

  const intent = { action: "bash", command: "rm -rf /var/data" };
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
  desc("wallet.transfer on chain 1, amount: 1.5 ETH");

  const intent = {
    action: "wallet.transfer",
    amount: "1500000000000000000",
  };
  const result = await authorize({
    framework: "demo",
    agentId: "demo-agent",
    chainId: 1,
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
    "\x1b[1mSigil Demo\x1b[0m \u2014 three agent actions against the live policy engine\n",
  );

  await scene1();
  await scene2();
  await scene3();

  console.log(
    "\n\x1b[2mDone. See https://docs.sigilcore.com for full documentation.\x1b[0m\n",
  );
}

main().catch((err) => {
  console.error("\x1b[31mFatal:\x1b[0m", err);
  process.exit(1);
});
