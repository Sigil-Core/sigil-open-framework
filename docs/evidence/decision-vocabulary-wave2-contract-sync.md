# Decision vocabulary Wave 2 contract sync

Recorded at `2026-08-21T23:21:56Z`.

- Sigil Sign source commit: `a9f718e33f38c3796742ad1ad057812a8d1ed047`
- Source artifact: `openapi.published.json`
- Published OpenAPI SHA-256: `cc400441b5aed8dc745fb5bd3c449c168b024a1622c6ebbbf529dfe00dd1c943`
- SOF destination: `api-reference/openapi.json`
- Contract version: `2.0.0`
- API version: `2.0.0`
- Schema source digest: `a50317e539dcf7a870c6c79ea23ea913b694126ed146bee5c99b00050863ea47`
- Published paths: 17
- Generated reference: `api-reference.md`, produced with `node scripts/generate-api-reference.mjs`

The source and destination OpenAPI SHA-256 values are identical. The five
overlapping conformance vectors already match the same Sigil Sign commit
byte-for-byte, so this sync does not rewrite them. This repository has zero
execution-authorizing entry points. Its Wave 2 scope is contract, reference,
vector, and literal-hygiene parity only.
