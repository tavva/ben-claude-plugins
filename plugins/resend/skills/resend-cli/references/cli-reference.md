# Resend CLI Complete Reference

## Global Options

These options apply to all commands:

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |
| `--output <FILE>` | Write output to file |
| `--profile <NAME>` | Use specific config profile |
| `--verbose` | Enable verbose output |
| `--help` | Show help |
| `--version` | Show version |

## Commands

### resend config

Manage configuration profiles.

```bash
resend config setup    # Interactive profile setup
resend config show     # Display current configuration
resend config list     # List all profiles
```

### resend emails send

Send an email.

| Option | Description |
|--------|-------------|
| `--from <ADDRESS>` | Sender email address (required) |
| `--to <ADDRESS>` | Recipient email address (required, repeatable) |
| `--cc <ADDRESS>` | CC recipient (repeatable) |
| `--bcc <ADDRESS>` | BCC recipient (repeatable) |
| `--subject <TEXT>` | Email subject (required) |
| `--text <TEXT>` | Plain text body |
| `--html <HTML>` | HTML body |
| `--reply-to <ADDRESS>` | Reply-to address |
| `--scheduled-at <ISO8601>` | Schedule send time |

**Examples:**

```bash
# Simple text email
resend emails send \
  --from "sender@example.com" \
  --to "recipient@example.com" \
  --subject "Hello" \
  --text "Plain text body"

# HTML email
resend emails send \
  --from "sender@example.com" \
  --to "recipient@example.com" \
  --subject "Newsletter" \
  --html "<h1>Welcome</h1><p>Thanks for subscribing!</p>"

# Multiple recipients with CC
resend emails send \
  --from "sender@example.com" \
  --to "alice@example.com" \
  --to "bob@example.com" \
  --cc "manager@example.com" \
  --subject "Team Update" \
  --text "Weekly sync notes..."

# Scheduled email
resend emails send \
  --from "sender@example.com" \
  --to "recipient@example.com" \
  --subject "Reminder" \
  --text "Don't forget!" \
  --scheduled-at "2025-01-20T09:00:00Z"
```

### resend emails list

List emails.

```bash
resend emails list
resend emails list --json
```

### resend emails get

Get email by ID.

```bash
resend emails get <EMAIL_ID>

# Example
resend emails get email-abc123def456
```

### resend emails cancel

Cancel a scheduled email.

```bash
resend emails cancel <EMAIL_ID>
```

### resend emails update

Update a scheduled email.

```bash
resend emails update <EMAIL_ID> [OPTIONS]
```

### resend domains create

Add a domain.

| Option | Description |
|--------|-------------|
| `--region <REGION>` | AWS region (e.g., us-east-1, eu-west-1) |

```bash
# Add domain
resend domains create example.com

# Add domain in specific region
resend domains create example.com --region eu-west-1
```

### resend domains list

List all domains.

```bash
resend domains list
resend domains list --json
```

### resend domains get

Get domain details including DNS records for verification.

```bash
resend domains get <DOMAIN_ID>
```

### resend domains verify

Trigger domain DNS verification.

```bash
resend domains verify <DOMAIN_ID>
```

### resend domains update

Update domain settings.

| Option | Description |
|--------|-------------|
| `--open-tracking <BOOL>` | Enable/disable open tracking |
| `--click-tracking <BOOL>` | Enable/disable click tracking |

```bash
resend domains update <DOMAIN_ID> --open-tracking true --click-tracking true
```

### resend domains delete

Remove a domain.

```bash
resend domains delete <DOMAIN_ID>
```

### resend api-keys create

Create a new API key.

| Option | Description |
|--------|-------------|
| `--permission <PERM>` | Permission level (full_access, sending_access) |
| `--domain-id <ID>` | Restrict to specific domain |

```bash
# Create with full access
resend api-keys create "My CLI Key"

# Create with restricted permissions
resend api-keys create "Sending Only" --permission sending_access

# Create restricted to specific domain
resend api-keys create "Domain Key" --domain-id <domain-id>
```

### resend api-keys list

List all API keys.

```bash
resend api-keys list
resend api-keys list --json
```

### resend api-keys delete

Delete an API key.

```bash
resend api-keys delete <KEY_ID>
```

### resend templates create

Create a template.

| Option | Description |
|--------|-------------|
| `--subject <TEXT>` | Template subject (supports variables) |
| `--html <HTML>` | Template HTML body (supports variables) |

Variables use `{{variable_name}}` syntax.

```bash
resend templates create "Welcome Email" \
  --subject "Welcome to {{company}}!" \
  --html "<h1>Welcome, {{name}}!</h1>"
```

### resend templates list

List templates.

```bash
resend templates list
resend templates list --json
```

### resend templates get

Get template details.

```bash
resend templates get <TEMPLATE_ID>
```

### resend templates update

Update a template.

| Option | Description |
|--------|-------------|
| `--subject <TEXT>` | New subject |
| `--html <HTML>` | New HTML body |

```bash
resend templates update <TEMPLATE_ID> --subject "New Subject"
```

### resend templates delete

Delete a template.

```bash
resend templates delete <TEMPLATE_ID>
```

## Configuration File

Location: `~/.config/resend/config.yml`

Example structure:

```yaml
profiles:
  default:
    api_key: re_123456789
  production:
    api_key: re_prod_key
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | API key (takes precedence over config file) |
| `RESEND_PROFILE` | Profile name to use |

## Timestamp Format

Scheduled emails use ISO 8601 format:

```
2025-01-20T09:00:00Z          # UTC
2025-01-20T09:00:00+00:00     # With timezone offset
2025-01-20T04:00:00-05:00     # Eastern time
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Authentication error |
| 3 | Not found |
| 4 | Invalid arguments |
