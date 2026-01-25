# Langfuse CLI Complete Reference

## Global Options

These options apply to all commands that interact with the Langfuse API:

| Option | Environment Variable | Description |
|--------|---------------------|-------------|
| `--profile <NAME>` | - | Config profile to use |
| `--public-key <KEY>` | `LANGFUSE_PUBLIC_KEY` | Langfuse public key |
| `--secret-key <KEY>` | `LANGFUSE_SECRET_KEY` | Langfuse secret key |
| `--host <URL>` | `LANGFUSE_HOST` | Langfuse host URL |
| `-v, --verbose` | - | Enable verbose output |
| `-f, --format <FMT>` | - | Output format: table, json, csv, markdown |
| `-o, --output <PATH>` | - | Write output to file |

## Commands

### lf config

Manage configuration profiles.

```bash
lf config setup                       # Interactive profile setup
lf config setup --non-interactive     # Use env vars instead of prompts
lf config set --public-key <K> ...    # Set config for a profile
lf config show                        # Show current config
lf config list                        # List all profiles
```

### lf traces list

List traces with optional filters.

| Option | Description |
|--------|-------------|
| `-n, --name <NAME>` | Filter by trace name |
| `-u, --user-id <ID>` | Filter by user ID |
| `-s, --session-id <ID>` | Filter by session ID |
| `-t, --tags <TAG>` | Filter by tag (repeatable) |
| `--from <ISO8601>` | Start timestamp |
| `--to <ISO8601>` | End timestamp |
| `-l, --limit <N>` | Max results (default: 50) |
| `-p, --page <N>` | Page number (default: 1) |

**Examples:**

```bash
# Recent traces
lf traces list --limit 10

# Filter by name and time
lf traces list --name "chat" --from 2024-01-01T00:00:00Z

# Multiple tags
lf traces list --tags production --tags important

# Export to JSON
lf traces list --format json --output traces.json
```

### lf traces get

Get a specific trace by ID.

| Option | Description |
|--------|-------------|
| `--with-observations` | Include observations in the response |
| `--summary` | Strip large input/output fields from observations, keeping only metadata (requires `--with-observations`) |

```bash
lf traces get <TRACE_ID>

# Example
lf traces get tr-abc123def456

# Include observation metadata (recommended for investigation)
lf traces get tr-abc123def456 --with-observations --summary

# Include full observations with input/output content
lf traces get tr-abc123def456 --with-observations
```

### lf sessions list

List sessions with optional filters.

| Option | Description |
|--------|-------------|
| `--from <ISO8601>` | Start timestamp |
| `--to <ISO8601>` | End timestamp |
| `-l, --limit <N>` | Max results (default: 50) |
| `-p, --page <N>` | Page number (default: 1) |

### lf sessions show

Show details of a specific session.

| Option | Description |
|--------|-------------|
| `--with-traces` | Include associated traces in the response |

```bash
lf sessions show <SESSION_ID>

# Include traces
lf sessions show sess-abc123 --with-traces
```

### lf observations list

List observations (spans, generations, and events).

| Option | Description |
|--------|-------------|
| `-t, --trace-id <ID>` | Filter by trace ID |
| `-n, --name <NAME>` | Filter by observation name |
| `--type <TYPE>` | Filter by type (span, generation, event) |
| `-u, --user-id <ID>` | Filter by user ID |
| `--from <ISO8601>` | Start timestamp |
| `--to <ISO8601>` | End timestamp |
| `-l, --limit <N>` | Max results (default: 50) |
| `-p, --page <N>` | Page number (default: 1) |

### lf observations get

Get a specific observation by ID.

```bash
lf observations get <OBSERVATION_ID>
```

### lf scores list

List scores with optional filters.

| Option | Description |
|--------|-------------|
| `-n, --name <NAME>` | Filter by score name |
| `--from <ISO8601>` | Start timestamp |
| `--to <ISO8601>` | End timestamp |
| `-l, --limit <N>` | Max results (default: 50) |
| `-p, --page <N>` | Page number (default: 1) |

### lf scores get

Get a specific score by ID.

```bash
lf scores get <SCORE_ID>
```

### lf scores create

Create a new score attached to a trace, observation, or session.

| Option | Description |
|--------|-------------|
| `-n, --name <NAME>` | Score name (required, e.g., "accuracy", "relevance") |
| `-v, --value <VALUE>` | Score value (required, numeric) |
| `-t, --trace-id <ID>` | Trace ID to attach the score to |
| `--observation-id <ID>` | Observation ID to attach the score to |
| `--session-id <ID>` | Session ID to attach the score to |
| `-d, --data-type <TYPE>` | Data type: NUMERIC, CATEGORICAL, BOOLEAN |
| `-c, --comment <TEXT>` | Comment or annotation |

**Examples:**

```bash
# Score a trace with numeric value
lf scores create --name accuracy --value 0.95 --trace-id tr-abc123

# Score an observation with comment
lf scores create --name relevance --value 0.8 \
  --observation-id obs-xyz789 \
  --comment "Good but could be more specific"

# Categorical score (e.g., sentiment: -1, 0, 1)
lf scores create --name sentiment --value 1 \
  --data-type CATEGORICAL --trace-id tr-abc123

# Boolean score (0 or 1)
lf scores create --name approved --value 1 \
  --data-type BOOLEAN --trace-id tr-abc123

# Score a session
lf scores create --name satisfaction --value 4 --session-id sess-123
```

### lf metrics query

Query aggregated metrics with flexible dimensions.

**Required options:**

| Option | Values |
|--------|--------|
| `--view` | `traces`, `observations` |
| `--measure` | `count`, `latency`, `input-tokens`, `output-tokens`, `total-tokens`, `input-cost`, `output-cost`, `total-cost` |
| `--aggregation` | `count`, `sum`, `avg`, `p50`, `p95`, `p99`, `histogram` |

**Optional options:**

| Option | Description |
|--------|-------------|
| `-d, --dimensions <DIM>` | Group by dimension (repeatable) |
| `--from <ISO8601>` | Start timestamp |
| `--to <ISO8601>` | End timestamp |
| `--granularity <G>` | Time bucket: auto, minute, hour, day, week, month |
| `-l, --limit <N>` | Max results |

**Dimensions:**
- `traceName` - Group by trace name
- `model` - Group by model name
- `environment` - Group by environment tag
- `version` - Group by version tag
- `release` - Group by release tag

**Examples:**

```bash
# Daily cost trend
lf metrics query \
  --view traces \
  --measure total-cost \
  --aggregation sum \
  --granularity day \
  --from 2024-01-01T00:00:00Z

# Cost breakdown by model
lf metrics query \
  --view observations \
  --measure total-cost \
  --aggregation sum \
  --dimensions model

# P99 latency by trace name
lf metrics query \
  --view traces \
  --measure latency \
  --aggregation p99 \
  --dimensions traceName

# Token usage histogram
lf metrics query \
  --view observations \
  --measure total-tokens \
  --aggregation histogram

# Multiple dimensions
lf metrics query \
  --view observations \
  --measure total-cost \
  --aggregation sum \
  --dimensions model \
  --dimensions environment
```

### lf prompts list

List prompts with optional filters.

| Option | Description |
|--------|-------------|
| `-n, --name <NAME>` | Filter by prompt name |
| `-l, --label <LABEL>` | Filter by label |
| `-t, --tag <TAG>` | Filter by tag |
| `--limit <N>` | Max results (default: 50) |
| `--page <N>` | Page number (default: 1) |

### lf prompts get

Get a specific prompt by name.

```bash
lf prompts get <NAME>
```

| Option | Description |
|--------|-------------|
| `--version <N>` | Specific version number |
| `-l, --label <LABEL>` | Fetch by label (default: production) |
| `--raw` | Output raw content only (for piping) |

**Examples:**

```bash
# Get production version
lf prompts get my-prompt

# Get specific version
lf prompts get my-prompt --version 3

# Get staging version
lf prompts get my-prompt --label staging

# Get raw content for piping
lf prompts get my-prompt --raw > prompt.txt
```

### lf prompts create-text

Create a text prompt.

| Option | Description |
|--------|-------------|
| `--name <NAME>` | Prompt name (required) |
| `-f, --file <FILE>` | Read content from file (stdin if omitted) |
| `-m, --message <TEXT>` | Commit message for this version |
| `-l, --labels <LABELS>` | Labels to apply |
| `-t, --tags <TAGS>` | Tags to apply |
| `--config <JSON>` | Model config as JSON string |

**Examples:**

```bash
# Create from file
lf prompts create-text --name my-prompt -f prompt.txt

# Create with commit message
lf prompts create-text --name my-prompt -f prompt.txt \
  -m "Add context about user preferences"

# Create from stdin
echo "You are a helpful assistant." | lf prompts create-text --name my-prompt

# Create with labels and config
lf prompts create-text --name my-prompt -f prompt.txt \
  --labels production \
  --tags summarisation \
  --config '{"model": "gpt-4", "temperature": 0.7}'
```

### lf prompts create-chat

Create a chat prompt from JSON messages.

| Option | Description |
|--------|-------------|
| `--name <NAME>` | Prompt name (required) |
| `-f, --file <FILE>` | Read JSON messages from file (stdin if omitted) |
| `-m, --message <TEXT>` | Commit message for this version |
| `-l, --labels <LABELS>` | Labels to apply |
| `-t, --tags <TAGS>` | Tags to apply |
| `--config <JSON>` | Model config as JSON string |

**Messages JSON format:**

```json
[
  {"role": "system", "content": "You are a helpful assistant."},
  {"role": "user", "content": "{{user_input}}"}
]
```

### lf prompts label

Set labels on a prompt version.

```bash
lf prompts label <NAME> <VERSION> --labels <LABELS>
```

**Examples:**

```bash
# Promote version 5 to production
lf prompts label my-prompt 5 --labels production

# Set multiple labels
lf prompts label my-prompt 5 --labels production --labels reviewed
```

### lf prompts delete

Delete a prompt or specific version.

```bash
lf prompts delete <NAME>
```

| Option | Description |
|--------|-------------|
| `--version <N>` | Delete specific version only |
| `-l, --label <LABEL>` | Delete versions with this label only |

**Examples:**

```bash
# Delete entire prompt
lf prompts delete old-prompt

# Delete specific version
lf prompts delete my-prompt --version 2

# Delete all staging versions
lf prompts delete my-prompt --label staging
```

### lf datasets list

List datasets.

| Option | Description |
|--------|-------------|
| `-l, --limit <N>` | Max results (default: 50) |
| `-p, --page <N>` | Page number (default: 1) |

```bash
lf datasets list
lf datasets list --limit 100
```

### lf datasets get

Get a dataset by name.

```bash
lf datasets get <NAME>

# Example
lf datasets get my-eval-dataset
```

### lf datasets create

Create a new dataset.

| Option | Description |
|--------|-------------|
| `-d, --description <TEXT>` | Dataset description |
| `-m, --metadata <JSON>` | Metadata as JSON string |

```bash
# Create simple dataset
lf datasets create my-eval-dataset

# Create with description
lf datasets create my-eval-dataset -d "Test cases for summarisation"

# Create with metadata
lf datasets create my-eval-dataset \
  -d "Test cases" \
  -m '{"version": "1.0", "owner": "team-ml"}'
```

### lf datasets items

List dataset items.

| Option | Description |
|--------|-------------|
| `-d, --dataset <NAME>` | Filter by dataset name |
| `-l, --limit <N>` | Max results (default: 50) |
| `-p, --page <N>` | Page number (default: 1) |

```bash
# List all items
lf datasets items

# List items for specific dataset
lf datasets items --dataset my-eval-dataset
```

### lf datasets item-get

Get a dataset item by ID.

```bash
lf datasets item-get <ID>

# Example
lf datasets item-get item-abc123def456
```

### lf datasets item-create

Create a dataset item.

| Option | Description |
|--------|-------------|
| `-d, --dataset <NAME>` | Dataset name (required) |
| `-i, --input <JSON>` | Input data as JSON string (required) |
| `-e, --expected-output <JSON>` | Expected output as JSON string |
| `-m, --metadata <JSON>` | Metadata as JSON string |
| `--source-trace-id <ID>` | Source trace ID (for linking) |
| `--source-observation-id <ID>` | Source observation ID (for linking) |

**Examples:**

```bash
# Create item with input and expected output
lf datasets item-create --dataset my-eval-dataset \
  --input '{"text": "Long article content..."}' \
  --expected-output '{"summary": "Brief summary..."}'

# Create item from existing trace
lf datasets item-create --dataset my-eval-dataset \
  --input '{"prompt": "Summarise this article"}' \
  --source-trace-id tr-abc123

# Create item with metadata
lf datasets item-create --dataset my-eval-dataset \
  --input '{"text": "Content to process"}' \
  --expected-output '{"result": "Expected output"}' \
  --metadata '{"category": "short-form", "difficulty": "easy"}'

# Create item linked to specific observation
lf datasets item-create --dataset my-eval-dataset \
  --input '{"query": "What is X?"}' \
  --source-trace-id tr-abc123 \
  --source-observation-id obs-xyz789
```

### lf datasets runs

List runs for a dataset.

| Option | Description |
|--------|-------------|
| `-l, --limit <N>` | Max results (default: 50) |
| `-p, --page <N>` | Page number (default: 1) |

```bash
lf datasets runs <DATASET>

# Example
lf datasets runs my-eval-dataset
lf datasets runs my-eval-dataset --limit 10
```

### lf datasets run-get

Get a specific run.

```bash
lf datasets run-get <DATASET> <RUN>

# Example
lf datasets run-get my-eval-dataset run-2024-01-15
```

## Timestamp Format

All timestamp filters use ISO 8601 format:

```
2024-01-15T14:30:00Z          # UTC
2024-01-15T14:30:00+00:00     # With timezone offset
2024-01-15T09:30:00-05:00     # Eastern time
```

**Bash helpers for dynamic timestamps:**

```bash
# Current time
date -u +%Y-%m-%dT%H:%M:%SZ

# Start of today
date -u +%Y-%m-%dT00:00:00Z

# 24 hours ago (macOS)
date -u -v-1d +%Y-%m-%dT%H:%M:%SZ

# 24 hours ago (Linux)
date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%SZ

# 7 days ago (macOS)
date -u -v-7d +%Y-%m-%dT%H:%M:%SZ
```

## Pagination

For large result sets, use pagination:

```bash
# First page (default)
lf traces list --limit 100 --page 1

# Second page
lf traces list --limit 100 --page 2
```

The response includes pagination metadata when using JSON format.

## Configuration File

Location: `~/.config/langfuse/config.yml`

Example structure:

```yaml
default_profile: production

profiles:
  production:
    public_key: pk-lf-xxx
    secret_key: sk-lf-xxx
    host: https://cloud.langfuse.com

  development:
    public_key: pk-lf-yyy
    secret_key: sk-lf-yyy
    host: http://localhost:3000
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Authentication error |
| 3 | Not found |
| 4 | Invalid arguments |
