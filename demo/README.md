## Run the Sigil demo

1. Get an API key at [sigilcore.com/tools/keys](https://sigilcore.com/tools/keys)
2. Deploy the included `warranty.md` via [Sigil Warrant](https://sigilcore.com/tools/warrant) (or use an existing policy with equivalent rules)
3. `cd demo && npm ci` using Node 22.22.0 and npm 11.12.1
4. `SIGIL_API_KEY=sk_sigil_... npm run demo`
5. Watch six agent actions exercise token caps, recipient bounds, job-type allowlisting, and an MCP approval boundary.

### What it does

The demo sends five `POST /v1/authorize` requests to the live Sigil Sign API:

| Scene | Intent | Expected |
|-------|--------|----------|
| 1 | `contract.call` on Base, 2,500.50 USDC | **APPROVED** - under `token.USDC.max_transaction` |
| 2 | `contract.call` on Base, 12,500 USDC | **DENIED** - exceeds `token.USDC.max_transaction: 10000` |
| 3 | `email.send` to `team@sigilcore.com` | **PENDING** - recipient allowed, `email.require_approval: true` |
| 4 | `email.send` to `noreply@sigilcore.com` | **DENIED** - recipient is blocked before approval |
| 5 | AWP-style `contract.call` with `metadata.job_type: "yield_farming"` | **DENIED** - not on `allow_only.intent.metadata.job_type` |
| 6 | `mcp.buffer.create_post` for the LinkedIn channel | **PENDING** - MCP tool requires approval |

### Notes

- Nothing is mocked. All requests hit `https://sign.sigilcore.com/v1/authorize`.
- The `warranty.md` in this directory is a format 2.0 reference showing the policy your API key must be associated with. Sign and deploy it via Sigil Warrant before running.
- Requires Node.js >= 20 (native `fetch`).
- `package-lock.json` is the authoritative demo inventory. Run `npm ci` rather
  than `npm install` for a reproducible dependency tree.
- `framework` is set to `"demo"` - a custom testing framework identifier. Custom identifiers are accepted by the [Framework Registry](../framework-registry.md) validation rules.

### Integration gap flag

The demo relies on `intent.token`, `intent.to`, `intent.targetAddress`, and `intent.metadata.job_type` surviving request validation. If any field is stripped before evaluation, the expected denial code will shift from the primitive-specific code to a broader policy or schema error.
