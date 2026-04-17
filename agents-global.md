# Sigil -- Global AI Agent Context

This is the canonical AI context file for all Sigil-Core repositories.

Every repo has a copy of this file. The root copy lives at the Sigil
directory root. The `sigil-documentation-sync` skill keeps repo copies
in sync. If you need to change a global rule, change it here and run
the sync.

Repo-level `AGENTS.md` files reference this file and add only
repo-specific overrides. Repo-level `_MANIFEST.md` files define the
tiered loading order for each repo.

---

## MANDATORY: Open Source First Rule

**Before writing any Codex prompt, Lovable prompt, or sprint plan for a
new component -- search GitHub for an existing open source solution.**

This rule exists because three out of twelve Phase 2 items were found to
be substantially pre-built as open source projects:
- Sigil Vault -> OneCLI (Apache 2.0)
- GRC Compiler -> GigaChad GRC (ELv2 -- legal review required)
- Metering -> Lago self-hosted (AGPL-3.0)

**Steps before any new sprint:**
1. Search GitHub for the problem domain
2. Confirm license: MIT or Apache 2.0 preferred, AGPL acceptable for
   self-hosted, ELv2 requires legal review before productizing
3. Document fork source, license, and Sigil-specific delta in the prompt
4. Build only the delta -- never rewrite what already works

Full rule reference: `/Users/vernon/Documents/Cowork/Claude Context/sigil-sprint-rules.md`

---

## MANDATORY: Contract Trace -- Schema, Validation, or Evaluation Changes

**After any sprint that touches `IntentSchema`, `evaluator.ts`, `IntentPayload`,
`parser.ts`, `WarrantyPolicy`, any `## policy block` in `warranty.md`, or
`@sigilcore/agent-hooks` request fields -- run the contract trace before
declaring the sprint done.**

For each policy block (`## evm`, `## tool_calls`, `## custom`), trace one
complete example intent through every layer:
1. HTTP request body
2. Zod `IntentSchema` validation
3. `evaluate()` function call signature
4. `IntentPayload` fields passed to the evaluator
5. Policy rule that should match

If any field is absent or dropped at any layer, it is a seam gap. The sprint
is not done until the trace is clean for all three blocks.

Full rule + output format: `/Users/vernon/Documents/Cowork/Claude Context/sigil-sprint-rules.md` -- Rule 4

**Origin:** April 1, 2026 -- the entire `## tool_calls` block was non-functional
due to three compounding seam bugs, none visible from a single-file review.

---

## MANDATORY: Self-verification rule -- applies to ALL repos

**A sprint is not done when the code is written. It is done when the
running service proves it.**

Three-layer verification required before reporting completion:

**Layer 1 -- Source is correct**
- `npm run typecheck` exits 0
- `npm run lint` exits 0
- `npm run test` exits 0
- `npm run build` exits 0

**Layer 2 -- The build reflects the source**
After build, grep compiled output for key new functions:
```bash
grep -c "<key_new_function>" dist/<file>.js  # must return > 0
```

**Layer 3 -- The running service is executing the new binary**
After deploy, journalctl must show the new log events.
If logs show the same sequence as before, the old binary is still running.

Report all three layers explicitly.

---

## GitHub -- PR & Commit Rules

- Do not add `Co-Authored-By: Claude` to PR comments. Instead, use
  `Co-Authored-By:` followed by a randomly selected name from this list:
  Bjarne Stroustrup, Brendan Eich, Guido van Rossum, Graydon Hoare,
  Chris Lattner, Dennis Nedry, Ray, Gennady Korotkevich, Benjamin Qi,
  Andrew He, Bamshad Akbar, The Architect, The Oracle, Neo

- Before committing any `.md` file, verify it contains no `[cite:...]`
  instances. Remove any that exist.

- Never push `claude.md` or `CLAUDE.md` to any repo. It is .gitignored
  and exists only as a local shim for Claude Code compatibility.

---

## Documentation Sync Rule

**When the user confirms a sprint has shipped, always do the following
before closing the conversation:**

1. Update the relevant Notion wiki page(s) to reflect completed work.
2. Update the runbook (`runbook.md`) in the affected repo.
3. If the sprint closed work referenced across multiple Notion pages,
   update all of them.

**Trigger phrases:** "this shipped", "tests are green", "my dev confirmed
it's done", or any summary of completed work. Do not wait to be asked.

---

## Repository Index

**GitHub Org:** Sigil-Core
**Notion Wiki:** https://www.notion.so/titanholdco/Sigil-301fc1e98c9c8079ba5cdd240d71eaca

| Repo                   | Visibility | Purpose                                                             |
|------------------------|------------|---------------------------------------------------------------------|
| `sigil-sign`           | Private    | Intent Attestation engine + Sigil Lex                               |
| `sigil-grc`            | Private    | GRC backend (Go) + PaddleOCR sidecar                                |
| `sigil-vault`          | Private    | Fork of OneCLI (Apache 2.0) + Sigil delta                          |
| `sigil-pulse`          | Private    | Threat intelligence engine                                          |
| `sigil-strike`         | Private    | Strike service                                                      |
| `sigil-watch`          | Private    | Sigil Watch dashboard (Lovable)                                     |
| `sigilcore`            | Private    | sigilcore.com website (Lovable) -- local dir: sigil-sigilcorewebsite|
| `sigil-governance`     | Private    | sigil-governance landing (Lovable)                                  |
| `sigil-attestations`   | Public     | Canonical spec + verification helpers                               |
| `sigil-open-framework` | Public     | Open agent governance framework (Mintlify)                          |
| `faf`                  | Public     | Fiduciary Agent Framework                                           |
| `oee`                  | Public     | Open Execution Engine                                               |
| `agent-hooks`          | Public     | PreToolUse interceptor npm package                                  |
| `mcp-proxy`            | Private    | MCP proxy for agent tooling                                         |

---

## Naming Conventions

- **Sigil Lex** -- internal component name. Lives in `sigil-sign/src/lex/`.
  Used in engineering docs, code, and runbooks only. Never in GTM or
  customer-facing materials.

- **Sigil Sign** -- external product name. Used in GTM, pitch decks, and
  customer-facing materials. Sign is the product. Lex is the engine
  that powers it.

- **Sigil Pulse** -- threat intelligence engine. Droplet: `pulse-intel-nyc2-01`.
  Do not use the deprecated name **Sigtel** in any new documentation.

---

## Architectural Principles

- Sigil is the governance layer. It is not a custody solution, agent
  runtime, or settlement layer. It sits in front of those things.
- Sigil integrates with open standards (AgentKit, ElizaOS, ERC-4337).
  It does not compete with or replace them.
- Agents never hold private keys. Execution requires a valid Intent
  Attestation from `sigil-sign`.
- Safety is a property of architecture, not prompts.

---

## Security Rules

- Never log private keys, raw JWTs, authorization headers, or RPC secrets.
- Never add hot secret reload. Secrets load once at boot via GSM.
- Never add stack traces to production error responses.
- `policyEngine.ts` must not be modified. It is the existing mock and must
  remain untouched until the formal swap is explicitly scoped.
- `LEX_MODE=ENFORCE` is always the production default. Never leave
  `OBSERVE` mode active after an audit engagement.

---

## Deployment -- General Rules

- Always deploy NYC2 first, health check, then AMS3.
- `runbook.md` is the authoritative operational reference per repo.
- Key rotation requires a service restart.
- Repo-specific infra details (droplets, secrets, topology) live in
  each repo's `SERVICE.md` or `architecture.md`. Read those files
  before any infra-touching sprint.
- Cross-repo infrastructure reference (Cloudflare LBs, shared Postgres,
  Tailscale, deploy procedures):
  `/Users/vernon/Documents/Developer/Sigil/Gateway Architecture.md`
- GCP credentials on production droplets (NYC2 and AMS3) live at
  `/root/.config/gcloud/`. Do not move, symlink, or duplicate them.
- All production infrastructure is managed as code through Pulumi.
  Credentials are established on the local machine. Do not provision
  infrastructure manually -- write or update the Pulumi stack in the
  repo's `infra/` directory.
- New services deployed to production must be added to Uptime Robot
  via the API. The API key is in GSM:
  `projects/229174415542/secrets/SIGIL_UPTIMEROBOT_API_KEY`
  (Project ID: sigtel).
- Eraser is used for technical documentation and visual diagrams
  (architecture, sequence, flow). API key in GSM:
  `projects/229174415542/secrets/SIGIL_ERASER_API_KEY`

---

## MANDATORY: Review Evidence Protocol

**When responding to code review findings, do not say a finding is fixed
without including a review-ready evidence bundle.**

This rule exists because review cycles blow up when the reviewer has to
ask for proof that should have been included up front. Every review
response must include the following.

**1 -- Identity**
- Current branch name
- Current commit SHA (`git rev-parse HEAD`)
- If work was done in a different worktree or branch than the one under
  review, say so explicitly

**2 -- Exact diff evidence**
- `git show --stat HEAD`
- `git show HEAD -- <changed files relevant to the finding>`
- If line numbers from a previous review round are stale, reference the
  fixing commit SHA instead of arguing from old line numbers

**3 -- Exact verification commands**
- Run the commands that prove the finding is fixed
- Paste the raw output, not a paraphrase
- Prefer the narrowest commands that directly prove the fix

**4 -- Workflow / CI findings**
If the finding is about CI, workflow logic, seam checks, artifacts, PR
comments, or generated reports, include:
- The exact workflow-equivalent shell commands run locally, with raw output
- The generated artifact contents (`cat <artifact>`) when relevant
- If the fix is about failure detection, include one forced-failure proof
  and one clean baseline proof

**5 -- No summary-only claims**
Do not say "all findings fixed", "tests are green", or "workflow passes"
unless the corresponding command output is included in the same response.

### Preferred command bundle

When practical, provide this exact bundle:

```bash
git rev-parse HEAD
git status --short --branch
git show --stat HEAD
```

Then add the repo-appropriate build/lint/test commands (e.g. `go build`,
`go vet`, `go test` for Go repos; `npm run typecheck`, `npm run lint`,
`npm run test`, `npm run build` for Node repos). Then add the smallest
extra commands that directly prove the specific fix.

### Seam / contract / workflow fixes

Always include:

```bash
# Go repos
go run scripts/seam/check_secrets.go
go run scripts/seam/generate_contract.go
cat seam-report.json
```

If fixing failure reporting, also include:
- One intentionally induced failure case with raw output
- One clean baseline run with raw output

### Output style

- Prefer raw command output over prose
- Keep prose to: one sentence explaining what changed, one sentence
  explaining why the attached output proves it
- Do not make the reviewer ask for basic evidence that could have been
  included up front

---

## State of the Build -- Post-Ship Sync

**After any code is shipped, always update the State of the Build page:**
https://www.notion.so/titanholdco/State-of-the-Build-March-11-2026-320fc1e98c9c810aad03e31db32a7817

**Trigger:** "this shipped", "tests are green", "deployed", "PR merged".
Surface the update automatically without being asked.
