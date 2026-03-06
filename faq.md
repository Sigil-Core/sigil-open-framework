---
title: "FAQ & Troubleshooting"
description: "Diagnosing policy violations, validation errors, and on-chain verification."
---

## Errors & Policy Violations

<AccordionGroup>  
 <Accordion title="Why was my transaction rejected with SIGIL_POLICY_VIOLATION?">  
 A `SIGIL_POLICY_VIOLATION` means your proposed transaction was successfully processed, but it deterministically breached a rule in your `ASSURANCE.md` policy. **This is not a bug; it is the firewall working as intended.**

    **To diagnose:**
    1. Read the `message` or `reason` field in the JSON-RPC error response.
    2. Open your `ASSURANCE.md` and locate the breached constraint.
    3. Verify your request's `amount`, `targetAddress`, and `chainId` match the policy.

    *Do not retry the exact same transaction.* If the evaluation is deterministic, it will fail again. Fix the intent or the policy first.

</Accordion>

<Accordion title="I'm getting SIGIL_VALIDATION errors. What's wrong?">  
 `SIGIL_VALIDATION_*` errors mean your request failed schema validation before policy evaluation even began.

    **Common culprits:**
    * **`framework`:** Must be exactly `"agentkit"` or `"eliza"`. `"coinbase-agentkit"` will fail.
    * **`txCommit`:** Must be a lowercase 64-character hex string. **Remove the `0x` prefix.**
    * **`chainId`:** Ensure you are targeting an allowlisted chain (1, 8453, 42161, 10, 137, 56, 999).

</Accordion>

<Accordion title="What does the JSON-RPC error response look like?">  
 Policy and validation failures on the `/rpc` and `/bundler` endpoints are returned as standard HTTP 200 JSON-RPC errors.

    Example:
    ```json
    {
      "jsonrpc": "2.0",
      "id": 1,
      "error": {
        "code": -32602,
        "message": "SIGIL_POLICY_VIOLATION",
        "data": {
          "reason": "Sigil receipt required for write methods"
        }
      }
    }
    ```

</Accordion>  
</AccordionGroup>

---

## Attestation Verification

<AccordionGroup>  
 <Accordion title="My attestation expired before I could use it. What do I do?">  
 Attestations expire exactly **60 seconds** from issuance. This strict window prevents replay attacks.

    1. Discard the expired token. It will be rejected.
    2. Request a new attestation by calling `POST /v1/authorize` again.
    3. Ensure your agent is not performing blocking operations (like heavy LLM reasoning) *between* receiving the attestation and submitting the transaction.

</Accordion>

<Accordion title="Can I cache and reuse an attestation for multiple transactions?">
  **No.** Attestations are single-use. They are cryptographically
  bound to a specific `txCommit` or `userOpHash`. Submitting an
  attestation with a different transaction hash will instantly fail
  validation.
</Accordion>

<Accordion title="How do I locally verify the Ed25519 signature?">  
 Intent Attestations are standard Ed25519-signed JWTs. You can verify them using the `jose` library and Sigil's public JWK endpoint.

    ```typescript
    import { createRemoteJWKSet, jwtVerify } from "jose";

    const JWKS = createRemoteJWKSet(
      new URL("https://sign.sigilcore.com/.well-known/jwks.json")
    );

    const { payload } = await jwtVerify(intent_attestation, JWKS, {
      issuer: "sigil-core",
      algorithms: ["EdDSA"],
    });

    // CRITICAL: Ensure payload.txCommit matches your transaction hash
    console.log(payload);
    ```

</Accordion>  
</AccordionGroup>

---

## Key Custody & Security

<AccordionGroup>  
 <Accordion title="Does Sigil store my private keys?">  
 **Never.** Sigil is explicitly non-custodial.

    We do not hold your private keys, custody your treasury assets, or issue long-lived credentials to your agents. Sigil operates strictly as an authorization firewall. The agent proposes, Sigil authorizes, and your own key infrastructure (e.g., Fireblocks, AWS KMS) physically signs the transaction.

</Accordion>  
</AccordionGroup>
