---
title: "CMS Publisher Agent"
description: "Policy-format 2.0 Warrant for publishing blog posts and category-scoped cover images through typed HTTP intents."
---

# Warranty Policy - CMS Publisher Agent

This is a reference policy, not a deployable credential bundle. First provision a dedicated Supabase Auth publisher user. Use a publishable project key in `apikey` and that user's access token in `Authorization`; never use a secret or legacy `service_role` key. Replace the example host, then copy the policy body into Sigil Warrant and sign it.

```markdown
version: 2.0.0

## tool_calls
allowed: http
http.allowed_methods: POST, PATCH
http.blocked_methods: DELETE
http.allowed_hosts: your-project-ref.supabase.co

## custom
# The publisher may write the posts resource or a PNG cover at covers/<category>/<slug>.png only.
allow_only[action=http].intent.path matches: ^/rest/v1/posts$, ^/storage/v1/object/blog-images/covers/[a-z0-9]+(?:-[a-z0-9]+)*/[a-z0-9]+(?:-[a-z0-9]+)*[.]png$

# Defense in depth for projected intent strings. The adapter must reject privileged credentials in headers.
deny_if.intent.path contains "/user_roles"
deny_if.intent.path contains "/auth/"
deny_string: "service_role"

## execution_limits
max_tool_calls_per_task: 12

## signature
sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL
```
