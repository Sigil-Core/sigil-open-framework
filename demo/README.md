## Run the Sigil demo

1. Get an API key at [sigilcore.com/tools/keys](https://sigilcore.com/tools/keys)
2. Deploy the included `warranty.md` via [Sigil Warrant](https://sigilcore.com/tools/warrant) (or use an existing policy with equivalent rules)
3. `cd demo && npm install`
4. `SIGIL_API_KEY=sk_sigil_... npm run demo`
5. Watch three agent actions: approved, blocked, held.

### What it does

The demo sends three `POST /v1/authorize` requests to the live Sigil Sign API:

| Scene | Intent | Expected |
|-------|--------|----------|
| 1 | `contract.call` on Base, 0.5 ETH | **APPROVED** — under threshold, allowed action |
| 2 | `bash: rm -rf /var/data` | **DENIED** — blocked command in `tool_calls` policy |
| 3 | `wallet.transfer` on mainnet, 1.5 ETH | **PENDING** — exceeds `consensus_threshold_eth: 1.0` |

### Notes

- Nothing is mocked. All requests hit `https://sign.sigilcore.com/v1/authorize`.
- The `warranty.md` in this directory is a reference showing the policy your API key must be associated with. Sign and deploy it via Sigil Warrant before running.
- Requires Node.js >= 20 (native `fetch`).
- `framework` is set to `"demo"` — a registered testing framework in the [Framework Registry](../framework-registry).

### Integration gap flag

Scene 2 relies on `intent.command` being passed through to the tool-call evaluator for blocked-command matching. If the authorize controller strips unrecognized fields from the intent payload, Scene 2 will return `LEX_TOOL_CALL_NOT_ALLOWED` instead of `LEX_TOOL_CALL_BLOCKED_COMMAND`. Verify that `command` survives the `AuthorizeRequest` schema.
