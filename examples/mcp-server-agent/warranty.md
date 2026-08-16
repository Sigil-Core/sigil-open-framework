---
title: "MCP Server Agent"
description: "Warranty policy for an agent that calls external tools through MCP servers: allowlists MCP servers and tools, blocks destructive tool patterns, holds email for approval, and requires a declared job type."
---

# Warranty Policy - MCP Server Agent

Copy the policy body below into Sigil Warrant, sign it, and deploy it with the API key used by this agent.

MCP intents are matched on trusted `metadata.serverId` and `metadata.toolName`, which fail closed when absent. Tool patterns match the tool name or `server.tool` form, with trailing-`*` wildcard support. This is the only canonical example that opts into Policy 2.3 inbound result inspection because it declares exact MCP tool identities.

```markdown
version: 2.3.0

## mcp
# Replace these placeholders with the real MCP servers this agent connects to.
allowed_servers: browser, github, http, slack, postgres-readonly
# Enumerate the real tools your deployment uses; a tool not on this list is
# denied. `github.*` allows every tool on the github server except those
# blocked below (blocked_tools is checked first).
allowed_tools: browser.open, github.*, http.request, slack.send_message, postgres-readonly.query
# Denies the listed destructive tools. `delete_*` matches any tool whose name
# starts with "delete_" on any allowed server.
blocked_tools: github.delete_repository, github.force_push, delete_*
# Only these exact tools have inbound result inspection. These opaque tokens
# must also be exact members of allowed_tools.
response.web_fetch_tools: browser.open
response.http_tools: http.request
response.deterministic_ruleset: sof-response-rules-v1
response.block_classes: malicious_url, prompt_injection
response.redact_classes: pii, secret
# The scanner profile selects operator-owned runtime configuration. It is not a
# URL, and no endpoint or credential belongs in the Warrant.
response.scanner.required: true
response.scanner.profile: operator-presidio-v1
response.scanner.classes: pii, prompt_injection
response.scanner.min_confidence: 0.85
# Observe findings never change disposition and expire at this UTC instant.
response.observe_classes: prompt_injection
response.observe_until: 2026-09-05T00:00:00Z

## tool_calls
# An MCP gateway agent does not need a raw shell, and every governed channel
# it does need is typed above — so only email.send remains here.
allowed: email.send
email.require_approval: true
email.allowed_recipients: *@sigilcore.com, partner@example.com
email.blocked_recipients: noreply@sigilcore.com

## custom
# Every governed intent must declare an approved job type. Fails closed on a
# missing job_type; the value is agent-declared unless intents arrive through
# a trusted shim.
allow_only.intent.metadata.job_type: tool_call, data_sync, notify
deny_if.intent.metadata.job_type contains test

# Denies listed credential strings anywhere in the intent. Case-sensitive
# substring matching: defense in depth, not a secrets control.
deny_string: "OPENAI_API_KEY"
deny_string: "ANTHROPIC_API_KEY"
deny_string: "AWS_SECRET_ACCESS_KEY"
deny_string: "DATABASE_URL"
deny_string: "BEGIN RSA PRIVATE KEY"
# Response-result literal. Bare deny_string rules above remain outbound intent
# checks and do not inspect tool results.
response.deny_string: "ignore all previous instructions"

## soft_limits
daily_tool_calls: 500

## execution_limits
max_tool_calls_per_task: 100
max_tool_calls_per_hour: 1000

## signature
sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL
```
