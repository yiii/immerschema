# Fulldome Schema Suite

* **Core shot schema** – validates every scene or sub-scene.
* **Project schema** – wraps all shots for whole-show checks.
* **Enum packs** – single source for techniques, risk flags, zones.
* **Taxonomy packs** – human-friendly categorization for UI components.
* **LLM I/O schema** – guarantees safe, auditable AI edits.

## Validate a shot

```bash
npm i -g ajv-cli
ajv validate -s schemas/core.schema.json -d shots/sc01-ss01.json
```

## Validate whole project

```bash
ajv validate -s schemas/project.schema.json -d project.json
```

## Validate taxonomy pairs

```bash
python scripts/validate_taxonomy.py
```

## Contributing

1. Bump schemaVersion (SemVer) on every change.
2. Update CHANGELOG.md.
3. Run npm test (CI runs ajv on all fixtures).
4. Run taxonomy validation.
5. Open PR. 