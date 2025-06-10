# 📐  Schema Architecture

| Layer | File | Purpose |
|-------|------|---------|
| **Core** | `schemas/core.schema.json` | Immutable foundation used by every tool. |
| **Enums** | `schemas/enum/*.json` | Centralised lists; update freely without breaking structure. |
| **Taxonomy** | `schemas/taxonomy/*.json` | Human-friendly categorization for UI components. |
| **Extensions** | `schemas/ext/*.json` | Opt-in blocks (debug, alt-takes…). Core never references them. |
| **Project** | `schemas/project.schema.json` | Container for multi-shot films; enforces global fields. |
| **LLM I/O** | `schemas/io/*.json` | Contract between middleware and model; validates envelopes & patches. |

## LLM I/O Details

| File | Purpose |
|------|---------|
| `prompt_envelope.schema.json` | Validates input from author to LLM model |
| `response_envelope.schema.json` | Validates output from LLM model to middleware |
| `patch.schema.json` | RFC-6902 JSON Patch wrapper for scene updates |

*Versioning*: each schema has a **SemVer** string `schemaVersion`.  
Breaking change → bump MAJOR, optional additions → bump MINOR.

*Taxonomy Policy*:
- New enum value → add to enum & taxonomy (MINOR bump)
- Move value between categories → edit only taxonomy (NO bump)
- Rename category → edit only taxonomy (NO bump)
- Deprecate value → move to "Deprecated" category (NO bump)
- Remove value → delete from both files (MAJOR bump) 