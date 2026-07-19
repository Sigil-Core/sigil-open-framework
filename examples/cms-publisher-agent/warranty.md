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

# RESIDUAL RISK: an authorized PATCH to /rest/v1/posts with no row filter is an
# unfiltered PostgREST update — it rewrites every row the credential can see,
# within the 12-call budget. Policy 2.0 custom rules are single-field and cannot
# express "PATCH requires a row filter while POST may have an empty query."
# For production, split this into two signed warrants: a create-only warrant
# (POST only) and an update-only warrant (PATCH only) that also requires a
# slug row filter on every call. The update-only variant looks like this:
#
#   http.allowed_methods: PATCH
#   allow_only[action=http].intent.path matches: ^/rest/v1/posts$
#   allow_only[action=http].intent.query matches: ^slug=eq\.[a-z0-9-]+$
#
# Storage uploads have no separate count cap; covers are bounded only by the
# path regex above and the per-task call budget.

# Defense in depth for projected intent strings. The adapter must reject privileged credentials in headers.
deny_if.intent.path contains "/user_roles"
deny_if.intent.path contains "/auth/"
deny_string: "service_role"

## execution_limits
max_tool_calls_per_task: 12

## soft_limits
cap.blog_posts.max_count: 10
cap.blog_posts.window: day
cap.blog_posts.action: http
cap.blog_posts.group_by: metadata.category

## signature
sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL
```
