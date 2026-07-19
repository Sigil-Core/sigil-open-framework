---
title: "Read-Only Auditor Agent"
description: "Warrant policy for an audit agent that is read-only at the transport layer: only GET and HEAD requests are authorized (fail-closed), requests are pinned to the listed audited hosts (placeholders to replace with your audited surfaces), listed private-network hostnames are denied, and every intent requires a declared job type. GET endpoints with side effects remain the operator's residual risk."
---

# Warrant Policy - Read-Only Auditor Agent

Copy the policy body below into Sigil Warrant, sign it, and deploy it with the API key used by this agent.

```markdown
version: 2.0.0

## tool_calls
allowed: http
# Read-only at the transport layer: only GET and HEAD are authorized, and the
# method check fails closed. RESIDUAL RISK: a GET endpoint that performs a
# write on the server side is not detectable at this layer; keeping audited
# surfaces free of side-effectful GETs is the operator's concern.
http.allowed_methods: GET, HEAD
# Denies listed hostnames (hostname-parsed, subdomains included).
web_fetch.blocked_domains: localhost, 127.0.0.1, 0.0.0.0, 169.254.169.254, metadata.google.internal
# Pins the audited surfaces so every other host is denied; replace with your
# audited surfaces before signing.
http.allowed_hosts: api.audited.example.com, reports.audited.example.com

## custom
# Every governed intent must declare an approved read-only job type. Fails
# closed on a missing job_type; the value is agent-declared unless intents
# arrive through a trusted shim.
allow_only.intent.metadata.job_type: audit, report, scan
deny_if.intent.metadata.job_type contains test

# Denies intent URLs that start with the literal lowercase "http://",
# steering traffic to https. Case-sensitive prefix match.
deny_if.intent.url starts_with "http://"

# Denies listed credential strings anywhere in the intent. Case-sensitive
# substring matching: defense in depth, not a secrets control.
deny_string: "AWS_SECRET_ACCESS_KEY"
deny_string: "DATABASE_URL"
deny_string: "OPENAI_API_KEY"
deny_string: "BEGIN RSA PRIVATE KEY"

## soft_limits
daily_tool_calls: 200

## execution_limits
max_tool_calls_per_task: 25
max_tool_calls_per_hour: 200

## signature
sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL
```
