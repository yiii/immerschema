# 📐 Immerschema Architecture (v1.4)

A modular JSON-Schema suite for fulldome / CG pipelines – now with **Agile hierarchy fields**, **feature tagging**, and an optional **Gantt UI overlay** on top of the core scheduling slices.

---

## 0 · Executive Summary

**Slices** are small reusable schema files; **profiles** are milestone bundles that `allOf` slices and decide what's mandatory.
Array-root slices (e.g. `assets`, `tasks`) are now imported through *property-slice wrappers* (`…_prop_slice.json`) to avoid `type` collisions.

**New in v1.4**: Themes→Initiatives→Epics fields, free-text `featureTag` with optional `featureId`, standalone crew & tasks collections, and non-breaking Gantt overlay properties for interactive timelines.

**Crew/Dept update**: The `dept` property is now part of the core crew slice and available everywhere. The `projectCrew` overlay adds only `shotIds` for cross-shot linkage—no duplicate dept definition. Shot-level and global crew share identical validation logic, so dashboards can join them easily.

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
| `slices/assets.prop.slice.json` | `assets.slice.schema.json` | `assets`         |
| `slices/tasks.prop.slice.json`  | `tasks.slice.schema.json`  | `tasks` + `projectTasks` |
| `slices/crew.prop.slice.json`   | `crew.slice.schema.json`   | `crew`  + `projectCrew`        |
| `slices/risks.prop.slice.json`  | `risk.slice.json`         | `risks`          |

---

## 2 · Profile Chain

```
Draft ─▶ Review ─▶ Plan ─▶ Assign ─▶ Lock
```

| Profile | Inherits | Adds (slices)                                                  | Must-have Keys                             |
| ------- | -------- | -------------------------------------------------------------- | ------------------------------------------ |
| Draft   | —        | id, note, timing, technique, voice, audio, description, screen | `id`                                       |
| Review  | Draft    | meta-scene, **assets\_prop\_slice**, additional-screens        | timing, technique, assets, description     |
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
| `tasks.slice.schema.json`     | array     | —                           | **Enhanced** with lifecycle tracking |
| `tasks-gantt.slice.json`      | object    | rowId, color, type, ganttFlags | Optional overlay for Gantt UIs |
| `crew.slice.schema.json`      | array     | —                           | Wrapped by crew_prop_slice; `dept` is core. |
| `risk.slice.json`             | array     | —                           | Wrapped by risks\_prop\_slice         |
| `voice.slice.schema.json`     | object    | voice                       | lang + text                           |
| `screen.slice.schema.json`    | object    | screen                      | **Now supports additional properties** |
| *others…*                     | object    | timing, screen, audio, etc. |                                       |

---

## 4 · Enhanced Task Management (v1.4)

### 4.1 Task Lifecycle Properties

```json
{
  "id": "t-001",
  "task": "Import dome model", 
  "dept": "CG",
  "prio": "high",
  "assignedTo": "ArtLead",
  "status": "in_progress",
  "hoursPlanned": 16,
  "hoursActual": 4,
  "timestamps": {
    "created": "2025-06-17T10:00:00+07:00",
    "started": "2025-06-18T09:00:00+07:00", 
    "due": "2025-06-20T18:00:00+07:00",
    "completed": "2025-06-21T16:30:00+07:00",
    "updated": "2025-06-21T16:35:00+07:00"
  },
  "dependsOn": ["t-000"],
  "parentId": "phase-preprod",
  "progress": 100,
  "baseline": {
    "start": "2025-06-17T09:00:00+07:00",
    "end": "2025-06-19T18:00:00+07:00"
  },
  "milestone": false
}
```

### 4.2 New Task Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `timestamps.due` | date-time | ✅ | **NEW**: Task deadline (ISO-8601) |
| `dependsOn` | string[] | — | **NEW**: Task IDs that must complete first |
| `progress` | number (0-100) | — | **NEW**: Completion percentage |
| `baseline` | object | — | **NEW**: Original schedule for slip tracking |
| `milestone` | boolean | — | **NEW**: Zero-duration milestone marker |
| `parentId` | string | — | **NEW**: Work breakdown structure parent |

### 4.3 Optional Gantt Overlay

To support interactive timeline tools, tasks can include a lightweight UI overlay:

```json
{
  "rowId": "feat_fog_interaction",
  "color": "#4C9AFF",
  "type": "task",
  "ganttFlags": { "critical": true }
}
```

The `tasks-gantt.slice.json` is an optional slice. Profiles **Plan** and **Assign** import `tasks-gantt.prop.slice.json`, adding these UI fields without affecting validation in Draft/Review or Lock.

### 4.3 Project-Level Task Management

All project schemas now include `projectTasks` property for cross-shot coordination:

```json
{
  "projectId": "brain-show",
  "title": "Вселенная внутри нас", 
  "shots": [...],
  "projectTasks": [
    {
      "id": "t-global-001",
      "task": "Dome calibration setup",
      "shotId": ["sc-01", "sc-02", "sc-03"],
      // ... standard task properties
    }
  ]
}
```

---

## 5 · Enhanced Screen Management

### 5.1 Screen Slice Improvements

The `screen.slice.schema.json` now supports:
- **Additional properties**: Extensible for custom screen configurations  
- **Multiple screen zones**: Integration with `additional-screens.slice.schema.json`
- **Enhanced motion tracking**: Camera transitions and immersive cues

```json
{
  "screen": {
    "screenZone": "dome_center",
    "cameraMotion": "slow zoom in",
    "transitionIn": "fade from black",
    "action": "particles begin to swirl",
    "transitionOut": "crossfade", 
    "immersiveCue": "spatial audio sweep",
    "floorAction": "subtle reflection",
    "rausAction": "ambient glow"
  }
}
```

---

## 6 · Project Schema Evolution

### 6.1 Project Container Schemas

Each profile tier now has a dedicated project schema:

| Schema | Profile Level | Key Features |
|--------|---------------|-------------|
| `project.draft.schema.json` | Draft | Basic project structure + `projectTasks` |
| `project.review.schema.json` | Review | Creative validation + global settings |
| `project.plan.schema.json` | Plan | Technical planning + resource allocation |  
| `project.assign.schema.json` | Assign | Team coordination + task distribution |
| `project.lock.schema.json` | Lock | Production-ready + final validation |

### 6.2 Global Project Properties

All project schemas share these enhanced properties:

```json
{
  "projectId": "string",
  "title": "string", 
  "schemaVersion": "1.0.0",
  "shots": [...],
  "projectTasks": [...],         // NEW: Cross-shot task coordination
  "globalSoftware": [...],
  "globalMusic": "string",
  "debug": {...}
}
```

---

## 7 · Minimal Starter Pack

```bash
schemas/
├─ slices/{id,note,timing,technique,voice,assets,tasks}.slice.json
├─ slices/{assets,tasks,crew,risks}.prop.slice.json
└─ profiles/{draft,lock}.schema.json
```

* **Draft**: loose, only ID + at least one content field.
* **Lock**: strict, all production fields required + enhanced task tracking.

---

## 8 · Project Root Schema Example

```json
{
  "projectId": "brain-show",
  "title": "Вселенная внутри нас",
  "shots": [
    { 
      "id": "sc-01", 
      "description": "Stars swirl into neural pathways",
      "tasks": [
        {
          "id": "t-001",
          "task": "Create particle system",
          "timestamps": { 
            "created": "2025-01-15T10:00:00Z",
            "due": "2025-01-20T18:00:00Z" 
          },
          "dependsOn": [],
          "progress": 0
        }
      ]
    }
  ],
  "projectTasks": [
    {
      "id": "t-global-001", 
      "task": "Dome calibration",
      "shotId": ["sc-01", "sc-02"],
      "timestamps": {
        "created": "2025-01-10T09:00:00Z",
        "due": "2025-01-25T17:00:00Z"
      }
    }
  ]
}
```

---

## 9 · CLI / CI Recipes

```bash
# Draft validation with task lifecycle
ajv validate -s schemas/profiles/draft.schema.json -d shots/draft/**/*.json

# Review validation with enhanced screen properties  
ajv validate -s schemas/profiles/review.schema.json -d shots/review/**/*.json

# Assign validation with full task coordination
ajv validate -s schemas/profiles/assign.schema.json -d shots/assign/**/*.json

# Project-level validation
ajv validate -s schemas/project.assign.schema.json -d projects/assign/**/*.json
```

Add these as steps in GitHub Actions to fail PRs on invalid shots or task dependencies.

---

## 10 · Versioning Rules (SemVer)

| Change                        | Bump      |
| ----------------------------- | --------- |
| Remove/rename field           | **MAJOR** |
| New required field in profile | **MAJOR** |
| Add optional field or enum    | **MINOR** |
| Task lifecycle enhancements   | **MINOR** |
| Screen property extensions    | **MINOR** |
| Taxonomy reorder              | patch     |

---

## 11 · Extension Guide

To add a new milestone (e.g. *AudioLock*), create a slice requiring final mix assets and `allOf` the prior profile.

For custom task properties, extend the `tasks.slice.schema.json` through profile-specific overlays.

---

## 12 · Migration Notes (v1.3)

### 12.1 Breaking Changes
- **REMOVED**: `test_shot.review.json` (deprecated test file)
- **ENHANCED**: All task objects now require `timestamps.due` field
- **ENHANCED**: Screen slice allows additional properties for extensibility

### 12.2 Upgrade Path
1. Add `due` timestamps to all existing task objects
2. Update task status validation for new lifecycle states  
3. Migrate any custom screen properties to new flexible structure
4. Update CI/CD pipelines to use project-level schemas

---

## 13 · Examples

### 13.1 Wrapper Slice Example

```json
// schemas/slices/crew.prop.slice.json
{
  "$id": "immerschema/slices/crew.prop.slice.json",
  "type": "object",
  "properties": {
    "crew": { "$ref": "./crew.slice.schema.json" },
    "projectCrew": {
      "allOf": [
        { "$ref": "./crew.slice.schema.json" },
        {
          "items": {
            "properties": {
              "shotIds": {
                "type": "array",
                "items": { "type": "string" },
                "description": "Optional linkage to shots this crew member touches"
              }
            }
          }
        }
      ]
    }
  },
  "required": ["crew"],
  "additionalProperties": true
}
```

*Note: `projectCrew` overlay adds only `shotIds` for cross-shot linkage. All other properties, including `dept`, are inherited from the core crew slice. Shot-level and global crew share identical validation logic.*

### 13.2 Profile Usage Example

```json
// schemas/profiles/assign.schema.json
{
  "allOf": [
    { "$ref": "./plan.schema.json" },
    { "$ref": "../slices/tasks.prop.slice.json" },
    { "$ref": "../slices/crew.prop.slice.json" },
    { "$ref": "../slices/audio.slice.schema.json" }
  ],
  "required": ["tasks", "crew", "voice", "audio", "description"]
}
```

### 13.3 Validation Command

```bash
ajv validate \
  -s schemas/project.assign.schema.json \
  -d projects/assign/brain-show.json
```

---

© 2025 Immerschema Team – Bangkok / Berlin
