# 📐 Immerschema Architecture (v1.3)

A modular JSON-Schema suite for fulldome / CG pipelines – now with **property-wrapped array slices**.

---

## 0 · Executive Summary

**Slices** are small reusable schema files; **profiles** are milestone bundles that `allOf` slices and decide what’s mandatory.
Array-root slices (e.g. `assets`, `tasks`) are now imported through *property-slice wrappers* (`…_prop_slice.json`) to avoid `type` collisions.

---

## 1 · Folder Layout

```
schemas/
├─ enum/                # Controlled vocabularies (single source of truth)
├─ slices/              # LEGO bricks – 5–30 lines each
│   ├─ …*.slice.schema.json          # object-root slices
│   └─ …*_prop_slice.json            # wrappers for array-root slices
├─ profiles/            # Milestone bundles: Draft → Lock
├─ taxonomy/            # UI helper groupings (non-breaking)
├─ project/             # Project container schemas (one per profile tier)
├─ io/                  # LLM prompt/response contracts
└─ ext/                 # Optional extensions (debug, alt-takes)
```

### 1.1 Wrapper Naming Convention

| Wrapper File                    | Wraps Raw Slice            | Exposes Property |
| ------------------------------- | -------------------------- | ---------------- |
| `slices_assets_prop_slice.json` | `assets.slice.schema.json` | `assets`         |
| `slices_tasks_prop_slice.json`  | `tasks.slice.schema.json`  | `tasks`          |
| `slices_crew_prop_slice.json`   | `crew.slice.schema.json`   | `crew`           |
| `slices_risks_prop_slice.json`  | `risk.slice.schema.json`   | `risks`          |

---

## 2 · Profile Chain

```
Draft ─▶ Review ─▶ Plan ─▶ Assign ─▶ Lock
```

| Profile | Inherits | Adds (slices)                                                  | Must-have Keys                             |
| ------- | -------- | -------------------------------------------------------------- | ------------------------------------------ |
| Draft   | —        | id, note, timing, technique, voice, audio, description, screen | `id`                                       |
| Review  | Draft    | meta-scene, **assets\_prop\_slice**                            | timing, technique, assets, description     |
| Plan    | Review   | software, workload, bottleneck, **risks\_prop\_slice**         | softwarePipeline, workloadBreakdown, risks |
| Assign  | Plan     | **tasks\_prop\_slice**, **crew\_prop\_slice**, audio           | tasks, crew, audio                         |
| Lock    | Assign   | **risks\_prop\_slice** (recheck)                               | voice, risks, description                  |

---

## 3 · Slice Cheat-Sheet

| Slice                         | Root Type | Key(s)                      | Notes                                 |
| ----------------------------- | --------- | --------------------------- | ------------------------------------- |
| `id.slice.schema.json`        | object    | id, scene, subScene, index  | Universal                             |
| `technique.slice.schema.json` | object    | technique.\*                | primaryTechnique + optional techGroup |
| `assets.slice.schema.json`    | array     | —                           | Wrapped by assets\_prop\_slice        |
| `tasks.slice.schema.json`     | array     | —                           | Wrapped by tasks\_prop\_slice         |
| `crew.slice.schema.json`      | array     | —                           | Wrapped by crew\_prop\_slice          |
| `risk.slice.json`             | array     | —                           | Wrapped by risks\_prop\_slice         |
| `voice.slice.schema.json`     | object    | voice                       | lang + text                           |
| *others…*                     | object    | timing, screen, audio, etc. |                                       |

---

## 4 · Minimal Starter Pack

```bash
schemas/
├─ slices/{id,note,timing,technique,voice,assets}.slice.json
└─ profiles/{draft,lock}.schema.json
```

* **Draft**: loose, only ID + at least one content field.
* **Lock**: strict, all production fields required.

---

## 5 · Project Root Schema Example

```json
{
  "projectId": "brain-show",
  "title": "Вселенная внутри нас",
  "profile": "review",          // choose validation tier
  "shots": [
    { "id": "sc-01", "action": "Stars swirl…" }
  ]
}
```

CI swaps the `$ref` inside `project.review.schema.json` to validate against the chosen profile.

---

## 6 · CLI / CI Recipes

```bash
# Draft validation
ajv validate -s schemas/profiles/draft.schema.json -d shots/draft/**/*.json

# Review validation
ajv validate -s schemas/profiles/review.schema.json -d shots/review/**/*.json

# Assign validation
ajv validate -s schemas/profiles/assign.schema.json -d shots/assign/**/*.json
```

Add these as steps in GitHub Actions to fail PRs on invalid shots.

---

## 7 · Versioning Rules (SemVer)

| Change                        | Bump      |
| ----------------------------- | --------- |
| Remove/rename field           | **MAJOR** |
| New required field in profile | **MAJOR** |
| Add optional field or enum    | **MINOR** |
| Taxonomy reorder              | patch     |

---

## 8 · Extension Guide

To add a new milestone (e.g. *AudioLock*), create a slice requiring final mix assets and `allOf` the prior profile.

---

## 9 · Examples

### 9.1 Wrapper Slice Example

```json
// schemas/slices/assets_prop_slice.json
{
  "$id": "immerschema/slices/assets_prop_slice.json",
  "type": "object",
  "properties": {
    "assets": { "$ref": "assets.slice.schema.json" }
  },
  "required": ["assets"]
}
```

### 9.2 Profile Usage Example

```json
// schemas/profiles/review.schema.json
{
  "allOf": [
    { "$ref": "draft.schema.json" },
    { "$ref": "meta-scene.slice.schema.json" },
    { "$ref": "screen.slice.schema.json" },
    { "$ref": "../slices/assets_prop_slice.json" }
  ],
  "required": ["timing","technique","assets"]
}
```

### 9.3 Validation Command

```bash
ajv validate \
  -s schemas/profiles/review.schema.json \
  -d shots/review/**/*.json
```

---

© 2025 Immerschema Team – Bangkok / Berlin
