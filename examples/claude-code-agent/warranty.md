---
title: "Protect Your Repository"
description: "Deny listed shell strings and named sensitive path patterns at the governed intent boundary."
---

# Warranty Policy - Protect Your Repository

This warranty.md governs a coding agent that writes, tests, and ships code. It denies the listed command strings and path patterns, holds outbound email for approval, and requires a known job type. It does not by itself attest child-process effects, Git topology, filesystem race safety, or network activity.

```markdown
version: 1.0.0

## tool_calls
allowed: bash, web_fetch, file_write, email.send
bash.blocked_commands: rm -rf, rm -r /, mkfs, dd if=, shutdown, reboot
web_fetch.blocked_domains: evil.com, malware.io
file_write.blocked_paths: /etc, /root, /var, /usr, /sys, /proc, /boot, ~/.ssh, ~/.gnupg, ~/.aws
email.require_approval: true
email.allowed_recipients: *@sigilcore.com, maintainer@example.com
email.blocked_recipients: noreply@sigilcore.com

## custom
# Require every governed intent to declare the kind of coding work requested.
allow_only.intent.metadata.job_type: code_review, test_run, documentation
deny_if.intent.metadata.job_type contains test_payload

# Block git push to main/master without human approval
deny_if.intent.command contains "git push origin main"
deny_if.intent.command contains "git push origin master"
deny_if.intent.command contains "git push --force"

# Block destructive git operations
deny_if.intent.command contains "git reset --hard"
deny_if.intent.command contains "git clean -fd"

# Block credential exfiltration
deny_string: AWS_SECRET_ACCESS_KEY
deny_string: ANTHROPIC_API_KEY
deny_string: OPENAI_API_KEY
deny_string: GITHUB_TOKEN
deny_string: BEGIN RSA PRIVATE KEY
deny_string: BEGIN OPENSSH PRIVATE KEY

# Block writes outside the project directory
deny_if.intent.path starts_with "/etc"
deny_if.intent.path starts_with "/root"
deny_if.intent.path starts_with "/var"
deny_if.intent.path contains ".ssh"
deny_if.intent.path contains ".env"

## soft_limits
daily_tool_calls: 1000

## execution_limits
max_tool_calls_per_task: 50

## signature
sigil-sig: REPLACE_WITH_OUTPUT_FROM_SIGNING_TOOL
```

This policy governs actions that reach Sigil enforcement. Review adapter coverage before relying on it. Shell command checks do not independently govern network activity started by a child process.
