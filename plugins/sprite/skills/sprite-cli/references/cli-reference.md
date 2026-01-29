# Sprite CLI Complete Reference

Full documentation for all `sprite` commands and options.

## Authentication Commands

### sprite login

Authenticate with Fly.io.

```
sprite login [api-url] [-o <org>]
```

**Arguments:**
- `api-url` - Optional custom API URL

**Options:**
- `-o, --org <name>` - Specify organization

### sprite logout

Remove Sprites configuration from the system.

```
sprite logout
```

### sprite auth setup

Configure authentication with a pre-generated token.

```
sprite auth setup --token <token>
```

**Required:**
- `--token <token>` - The authentication token

### sprite org auth

Add an API token to an organization. Supports custom API URLs and aliases.

```
sprite org auth
```

### sprite org list

Show all configured tokens.

```
sprite org list
```

### sprite org logout

Remove all stored tokens.

```
sprite org logout
```

### sprite org keyring disable

Disable keyring storage for credentials.

```
sprite org keyring disable
```

### sprite org keyring enable

Enable keyring storage for credentials.

```
sprite org keyring enable
```

## Sprite Management Commands

### sprite create

Create a new sprite in the selected organization.

```
sprite create [name]
```

**Arguments:**
- `name` - Optional sprite name (auto-generated if not provided)

### sprite use

Activate a sprite for the current directory. Creates a `.sprite` file similar to version manager workflows (`.nvmrc`, `.python-version`).

```
sprite use <name>
sprite use --unset
```

**Arguments:**
- `name` - Sprite name to activate

**Options:**
- `-u, --unset` - Remove sprite configuration from current directory

### sprite list

List all sprites in the organization.

```
sprite list
sprite ls
```

**Aliases:** `ls`

**Options:**
- `--prefix <string>` - Filter by name prefix

### sprite destroy

Remove a sprite permanently.

```
sprite destroy <name>
sprite destroy -f <name>
```

**Arguments:**
- `name` - Sprite name to destroy

**Options:**
- `-f, --force` - Skip confirmation prompt

## Command Execution

### sprite exec

Execute a command in the sprite environment.

```
sprite exec [options] <command> [args...]
sprite x [options] <command> [args...]
```

**Aliases:** `x`

**Options:**
- `-d, --directory <path>` - Working directory inside sprite
- `-e, --env <KEY=VALUE>` - Set environment variable (repeatable)
- `-f, --file <path>` - Upload file before execution (repeatable)
- `-t, --tty` - Allocate TTY for interactive commands

**Examples:**
```bash
sprite exec ls -la
sprite x npm install
sprite exec -e NODE_ENV=production node server.js
sprite exec -f ./config.json cat /tmp/config.json
sprite exec -t vim file.txt
sprite exec -d /app npm test
```

### sprite console

Open an interactive shell in the sprite environment.

```
sprite console
sprite c
```

**Aliases:** `c`

Auto-detects shell type: bash, zsh, fish, tcsh, ksh.

## Checkpoint Management

### sprite checkpoint create

Save current sprite state as a checkpoint.

```
sprite checkpoint create [-c <comment>]
```

**Options:**
- `-c, --comment <text>` - Description for the checkpoint

### sprite checkpoint list

Display all saved checkpoints.

```
sprite checkpoint list
sprite checkpoint ls
sprite checkpoints ls
```

**Aliases:** `ls`

### sprite checkpoint info

Show details about a specific checkpoint.

```
sprite checkpoint info <version-id>
```

**Arguments:**
- `version-id` - Checkpoint identifier

### sprite checkpoint delete

Remove a checkpoint (soft delete).

```
sprite checkpoint delete <version-id>
sprite checkpoint rm <version-id>
```

**Aliases:** `rm`

**Arguments:**
- `version-id` - Checkpoint identifier

### sprite restore

Restore sprite from a checkpoint version.

```
sprite restore [version-id]
```

**Arguments:**
- `version-id` - Checkpoint to restore (optional, prompts if not provided)

## Networking Commands

### sprite proxy

Forward local ports through the remote sprite.

```
sprite proxy <port> [<port>...]
sprite proxy <local:remote> [<local:remote>...]
```

**Arguments:**
- `port` - Single port number (same local and remote)
- `local:remote` - Map local port to different remote port

**Examples:**
```bash
sprite proxy 3000                    # Forward 3000:3000
sprite proxy 8080:3000               # Forward local 8080 to remote 3000
sprite proxy 3000 5432 6379          # Multiple ports
sprite proxy 8080:3000 5433:5432     # Multiple mapped ports
```

### sprite url update

Manage URL access settings for the sprite.

```
sprite url update --auth <type>
```

**Options:**
- `--auth <type>` - Access type: `public` or `default`

**Examples:**
```bash
sprite url update --auth public      # Make publicly accessible
sprite url update --auth default     # Require authentication
```

## Utility Commands

### sprite api

Make authenticated API calls using curl. Automatically adds authentication headers.

```
sprite api <path> [curl-options...]
```

**Arguments:**
- `path` - API endpoint path
- `curl-options` - Additional curl options passed through

**Examples:**
```bash
sprite api /sprites
sprite api /sprites/my-sprite -X DELETE
sprite api /sprites -d '{"name": "new-sprite"}'
```

### sprite upgrade

Update CLI to the latest version.

```
sprite upgrade [options]
```

**Options:**
- `--check` - Check for updates without installing
- `--force` - Force reinstall even if up to date
- `--channel <name>` - Use specific release channel
- `--version <version>` - Install specific version

## Global Options

Available with any command:

- `--debug[=<file>]` - Enable debug logging (optionally to file)
- `-o, --org <name>` - Specify organization context
- `-s, --sprite <name>` - Specify sprite context
- `-h, --help` - Display help message

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Command not found |
| 126 | Command cannot execute |
| 127+ | Command terminated by signal |

## Configuration Files

### Global Configuration

Location: `~/.sprites/sprites.json`

Stores authentication tokens and organization settings.

### Local Context

Location: `.sprite` (project directory)

Stores the active organization and sprite for the current project. Created by `sprite use`.
