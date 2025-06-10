# 🤖  LLM Workflow Contract

## 1. Author → LLM (prompt envelope)

The prompt envelope follows `schemas/io/prompt_envelope.schema.json`:

```json
[
  "USER_MESSAGE",
  { "id":"sc01-ss01", "rev":3, "body": { …core shot… } },
  null            // optional: FULL_PIPELINE array for global checks
]
```

**Structure:**
- `[0]` **USER_MESSAGE** (string): Human instruction or question
- `[1]` **CURRENT_ITEM** (object): The scene JSON being edited (follows core.schema.json)
- `[2]` **FULL_PIPELINE** (array, optional): Complete project scenes for global validation

## 2. LLM → Middleware (response envelope)

The response envelope follows `schemas/io/response_envelope.schema.json`:

```json
[
  "CHAIN_OF_THOUGHTS",
  "LLM_ANSWER", 
  [
    {
      "id":"sc01-ss01",
      "baseRev":3,
      "patch":[
        { "op":"replace", "path":"/durationSec", "value":42 }
      ]
    }
  ]
]
```

**Structure:**
- `[0]` **CHAIN_OF_THOUGHTS** (string): Model's internal reasoning (for logs, hidden from user)
- `[1]` **LLM_ANSWER** (string): Human-readable response to display
- `[2]` **ITEMS_UPDATE** (array): List of RFC-6902 patches to apply (may be empty)

## 3. Patch Format

Each patch follows `schemas/io/patch.schema.json`:

```json
{
  "id": "sc01-ss01",           // Target scene ID
  "baseRev": 3,                // Optimistic lock revision
  "patch": [                   // RFC-6902 operations
    { "op": "replace", "path": "/durationSec", "value": 42 },
    { "op": "add", "path": "/tags/-", "value": "new-tag" },
    { "op": "remove", "path": "/metadata/oldField" }
  ]
}
```

**Supported Operations:**
- `add`, `remove`, `replace`, `move`, `copy`, `test`

**Workflow:**
1. Middleware validates `baseRev` against current scene revision
2. Applies patch operations in sequence
3. Increments revision number
4. Commits updated scene

See `schemas/io/*.json` for formal schema definitions. 