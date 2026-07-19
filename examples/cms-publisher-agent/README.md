# CMS Publisher Agent

This policy governs a publisher that writes blog post rows and uploads cover images to a Supabase project. Replace `your-project-ref.supabase.co` with the project's exact API hostname before signing.

The policy uses policy format 2.0 typed HTTP intents. Sigil Sign derives the request host and path from the submitted URL, permits only `POST` and `PATCH`, blocks `DELETE`, and limits writes to `public.posts` plus category-scoped objects under `blog-images/covers/`.

Provision the publisher as a dedicated Supabase Auth user. Send a publishable project key in `apikey` and that user's access token in `Authorization`; the publishable key alone is not the publisher identity. Never give the agent a secret or legacy `service_role` key.

The publisher adapter must reject the request before dispatch if `apikey` contains a Supabase secret key or `Authorization` identifies the legacy `service_role`. The Warrant's `deny_string` rule is defense in depth for values projected into the intent; it cannot inspect unprojected HTTP headers.

Runtime posture: **ENFORCE-ready reference configuration** for the manual, human session-backed CMS publishing flow described here. This example does not claim that a publisher or dedicated admin user is deployed. After provisioning those prerequisites, a publish request must pass the typed HTTP path and host rules, the projected credential checks, and the daily named cap, which allows 10 publishes per category per UTC day through the `metadata.category` grouping. Scheduled or unattended publishing is outside this example and is currently unsupported.

The `authenticated` Postgres role needs `SELECT`, `INSERT`, and `UPDATE` grants on `public.posts`, with RLS enabled and separate `SELECT`, `INSERT`, and `UPDATE` policies limited to the dedicated publisher user's `auth.uid()` or a trusted publisher claim in `raw_app_meta_data`. Do not grant `DELETE`. PostgreSQL requires a matching `SELECT` policy for updates.

Storage needs its own policies on `storage.objects`; table RLS does not cover files. Grant `INSERT` for `bucket_id = 'blog-images'` only when the object name matches `covers/<category>/<slug>.png`. If the publisher uses upsert, add equally scoped `SELECT` and `UPDATE` policies. Do not grant Storage `DELETE` or access to other buckets or prefixes.

Keep `bash` outside `tool_calls.allowed`; the bash gate does not constrain network requests made by a child process.

See Supabase's current guidance for [API keys](https://supabase.com/docs/guides/getting-started/api-keys), [database RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), and [Storage access policies](https://supabase.com/docs/guides/storage/security/access-control).

The policy is a Policy 2.0 reference example. Keep the adapter's projected metadata and exact Supabase host aligned with the signed file, then verify the policy hash in the resulting attestations.
