# 📐  Schema Architecture

| Layer | File | Purpose |
|-------|------|---------|
| **Profiles** | `schemas/profiles/*.json` | Milestone validation for production stages. |
| **Slices** | `schemas/slices/*.json` | Reusable schema components (5-30 lines each). |
| **Enums** | `schemas/enum/*.json` | Centralized lists; update freely without breaking structure. |
| **Taxonomy** | `schemas/taxonomy/*.json` | Human-friendly categorization for UI components. |
| **Extensions** | `schemas/ext/*.json` | Opt-in blocks (debug, alt-takes…). Core never references them. |
| **Project** | `schemas/project.*.schema.json` | Container for multi-shot films; enforces global fields. |
| **LLM I/O** | `schemas/io/*.json` | Contract between middleware and model; validates envelopes & patches. |

## Simplified Schema Structure

For quick starts or smaller projects, we provide a minimal schema setup:

```
schemas/
├─ slices/
│   id.schema.json      # ID, scene/subScene, versioning
│   note.schema.json    # Action, notes, timing, technique, voice
│   assets.schema.json  # Simple asset paths
└─ profiles/
    draft.schema.json   # Minimal validation
    lock.schema.json    # Final production validation
```

### Key Features

1. **Loose IDs**: Simple alphanumeric patterns (e.g., "shot42")
2. **Scene/SubScene**: 
   - Scene: Integer ≥ 1
   - SubScene: Integer or letter suffix (e.g., "1a" for inserts)
3. **Two-Stage Validation**:
   - Draft: ID + at least one content field
   - Lock: All required production fields

### Example Shots

```json
// Draft (shots/draft/shot42.json)
{
  "id": "shot42",
  "scene": 3,
  "subScene": 1,
  "action": "Stars swirl into a brain.",
  "durationSec": 7.5
}

// Lock (shots/lock/shot42.json)
{
  "id": "shot42",
  "scene": 3,
  "subScene": 1,
  "durationSec": 7.5,
  "primaryTechnique": "particle_system",
  "voice": { 
    "lang": "ru", 
    "text": "Рождение разума." 
  },
  "assets": [
    { "path": "./boards/shot42_key.png" }
  ]
}
```

### Helper Tools

1. **Reindex Script** (`tools/reindex.py`):
   - Sorts shots by scene/subScene
   - Updates index fields
   - Usage: `python tools/reindex.py shots/**/*.json`

2. **Validation Scripts**:
   ```bash
   npm run lint:draft  # Validate draft shots
   npm run lint:lock   # Validate locked shots
   npm run reindex     # Update shot ordering
   ```

### Growing the Schema

| Need | Add |
|------|----|
| Tasks/Crew | New slice, add to Lock profile |
| Asset Types | Extend assets.schema.json |
| Software | New slice, add to Lock profile |

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

## Immerschema — Modular Schema Suite
The lean, slice-based metadata framework for fulldome / CG pipelines

### 1. Why "slices + profiles"?

| Layer | Purpose |
|-------|---------|
| **Slices** (tiny JSON-Schema files) | One responsibility each—ID, timing, technique, crew, etc. 5-30 lines, reusable across projects. |
| **Profiles** (bundle schemas) | Milestones in the production calendar. They allOf a set of slices and decide what is mandatory at that stage. |

This lets you start a shot with two lines of JSON, then progressively enrich it without breaking early drafts.

### 2. Directory map

```
schemas/
├─ slices/            # LEGO bricks - reusable schema components
│   id.slice.schema.json    # Unique identifiers, scene/subscene structure, versioning
│   note.slice.schema.json  # Action descriptions, user notes, LLM-generated notes
│   timing.slice.schema.json    # Base timing schema
│   timing-seconds.slice.schema.json    # Duration in seconds (for creative/drafting phase)
│   timing-frames.slice.schema.json # Frame-accurate timing with FPS (for production)
│   meta-scene.slice.schema.json    # Scene metadata, grouping, and organization
│   technique.slice.schema.json     # Primary and secondary techniques for the shot
│   screen.slice.schema.json        # Screen zones and display configuration
│   software.slice.schema.json      # Software pipeline and tool requirements
│   tasks.slice.schema.json         # Task tracking, assignments, and status
│   crew.slice.schema.json          # Team assignments and responsibilities
│   risk.slice.json        # Risk flags and safety considerations
│   voice.slice.schema.json         # Voice-over with language and text (inherits projectLang)
│   audio.slice.schema.json         # Music and sound effects management
│   assets.slice.schema.json        # Asset management with paths, types, and roles
│   description.slice.schema.json   # Detailed shot descriptions
│   workload.slice.json             # Workload tracking and management
│   bottleneck.slice.json           # Production bottleneck identification
│   tech-group.slice.schema.json    # Technical group assignments
├─ enum/              # Controlled vocabularies - single source of truth
│   technique.enum.json   # Allowed techniques (CG, live-action, etc.)
│   software.enum.json    # Supported software tools
│   role.enum.json        # Team roles and responsibilities
│   riskflag.enum.json    # Safety and risk identifiers
│   screenzone.enum.json  # Screen placement zones
└─ profiles/          # Milestone bundles - validation stages
    draft.schema.json      # Initial creative validation (minimal requirements)
    review.schema.json     # Director review (timing + technique + assets)
    plan.schema.json       # Technical planning and resource allocation
    assign.schema.json     # Team and task assignments
    lock.schema.json       # Final production lock (safety + VO + assets)
```

### 3. Key slices at a glance

| Slice file | Top-level keys | Required inside slice |
|------------|----------------|----------------------|
| id.slice | id, schemaVersion | none (profile enforces id) |
| note.slice | action, userNote | none |
| timing-seconds.slice | durationSec | durationSec |
| timing-frames.slice | durationFrames, fps | durationFrames |
| technique.slice | primaryTechnique, otherTechniques | none (profile enforces primary) |
| software.slice | softwarePipeline | none (profile decides) |
| tasks.slice | tasks[] | id, task, dept, prio, status inside each item |
| crew.slice | people[] | role, name inside each item |
| risk.slice | riskFlags[] | none (profile enforces) |
| voice.slice | voice | voice required (nested object with lang, text) |
| assets.slice | assets[] | path, kind inside each item |
| description.slice | description | none |
| workload.slice | workload | workload metrics |
| bottleneck.slice | bottlenecks[] | bottleneck details |
| tech-group.slice | techGroups[] | group assignments |

### 4. Profile Hierarchy

The profiles follow a progressive validation model, where each stage builds upon the previous one:

```
Draft → Review → Plan → Assign → Lock
```

#### Profile Dependencies

| Profile | Inherits From | Adds Requirements |
|---------|---------------|-------------------|
| **Draft** | None | Basic ID and content |
| **Review** | Draft | Timing, technique, assets |
| **Plan** | Review | Software pipeline |
| **Assign** | Plan | Team, tasks, and audio |
| **Lock** | Assign | Safety and final checks |

#### Validation Flow

1. **Draft** (Creative Phase)
   - ✅ Basic ID
   - ✅ At least one content field
   - ✅ Optional timing and notes
   - ✅ Optional audio (music/sound effects)

2. **Review** (Director Approval)
   - ✅ All Draft requirements
   - ✅ Timing (seconds or frames)
   - ✅ Primary technique
   - ✅ Initial assets

3. **Plan** (Technical Planning)
   - ✅ All Review requirements
   - ✅ Software pipeline
   - ✅ Technical specifications

4. **Assign** (Team Setup)
   - ✅ All Plan requirements
   - ✅ Team assignments
   - ✅ Task breakdown
   - ✅ Required audio assets (music/sound effects)

5. **Lock** (Production Ready)
   - ✅ All Assign requirements
   - ✅ Safety checks
   - ✅ Final voice-over
   - ✅ Complete assets
   - ✅ Final audio mix

This hierarchy ensures that each stage builds upon the previous one, maintaining data integrity throughout the production pipeline.

### 5. Project root schema

Minimal fields plus an array of shots that must validate against one chosen profile:

```json
{
  "projectId": "brain-show",
  "title": "Вселенная внутри нас",
  "fps": 24,
  "projectLang": "ru",  // default language for voice
  "shots": [
    { "id": "sc-01", "action": "Stars swirl…" }  // Draft
  ]
}
```

Swap the $ref in `schemas/project.*.schema.json` to Draft/Review/Plan/Assign/Lock to control CI strictness.

### 6. CI / CLI recipes

```bash
# draft validation
ajv validate -s schemas/profiles/draft.schema.json   -d shots/draft/*.json

# review validation
ajv validate -s schemas/profiles/review.schema.json  -d shots/review/*.json

# plan validation
ajv validate -s schemas/profiles/plan.schema.json    -d shots/plan/*.json

# assign validation
ajv validate -s schemas/profiles/assign.schema.json  -d shots/assign/*.json

# final lock
ajv validate -s schemas/profiles/lock.schema.json    -d shots/lock/*.json
```

Add these commands to GitHub Actions to fail a pull-request when a shot hasn't met the milestone's requirements.

### 7. Extending the schema

| Need | Do |
|------|----|
| New technique value | Append to enum/technique.enum.json; update taxonomy if used. Bump minor version. |
| New profile (e.g., "audio") | Create audio.schema.json slice; make audio.schema.json profile that allOf lower tier and requires new keys. |
| Replace seconds with frames globally | Retire timing.sec.schema.json, make Review require durationFrames. Bump major version. |
| Add new asset type | Append to assets.schema.json kind enum. Bump minor version. |
| Add new asset role | Append to assets.schema.json role enum. Bump minor version. |

Slices are additive; removing a slice or moving a requirement to a higher tier is a versioned breaking change.

### 8. FAQ

**Q: Can I put timing inside a timing object?**  
A: Yes—wrap the slice properties in a "timing" sub-object and update profiles' required lists accordingly.

**Q: What if a shot needs both RU and EN voice?**  
A: Use the alias pattern:
```json
{
  "id": "scene-04",
  "voiceRU": { "lang": "ru", "text": "Рождение разума." },
  "voiceEN": { "lang": "en", "text": "Birth of the mind." }
}
```

**Q: How do I handle different types of assets?**  
A: Use the assets slice with appropriate kind and role:
```json
{
  "assets": [
    {
      "path": "./boards/sc07_key.png",
      "kind": "image",
      "role": "storyboard"
    },
    {
      "path": "https://cdn.example.com/animatics/sc07_lores.mp4",
      "kind": "video",
      "role": "animatic"
    }
  ]
}
```

**Q: How do I handle preview assets?**  
A: When you have a heavy asset (like a 4K video) and need a lighter preview version, use the preview role and link it to the source:
```json
{
  "assets": [
    {
      "path": "./renders/scene_01_4k.mp4",
      "kind": "video",
      "role": "reference"
    },
    {
      "path": "./previews/scene_01_720p.mp4",
      "kind": "video",
      "role": "preview",
      "sourcePath": "./renders/scene_01_4k.mp4"
    }
  ]
}
```
The sourcePath field is required when role is "preview" and must point to the original asset.

**Q: How do I generate TS/Python types?**  
A: Use quicktype (TS) or datamodel-code-generator (Python) on the profile schema you care about; it will inline the referenced slices.

## 9. ID Patterns and Validation Troubles

### ID Generation Strategy

The schema uses a flexible ID pattern that balances human readability with system requirements:

```json
{
  "id": "sc01",  // Scene-based: sc + zero-padded index
  "index": 1,    // Original numeric index for sorting/reference
  "scene": 1,    // Scene number for grouping
  "subScene": 1  // Sub-scene for detailed breakdown
}
```

**ID Format**: `sc##` where `##` is a zero-padded 2-digit number (e.g., `sc01`, `sc22`, `sc99`)

### Common Validation Issues

#### 1. Schema Reference Resolution Problems

**Problem**: Infinite recursion in schema `$ref` resolution causing paths like:
```
immerschema/schemas/profiles/immerschema/schemas/profiles/...
```

**Root Cause**: 
- Incorrect base URI calculation in `RefResolver`
- Relative path resolution creating circular references
- Schema files referencing each other in complex dependency chains

**Solution**:
```python
# Simplified approach - disable complex schema validation during development
def create_resolver(schema_file):
    # Return None to skip RefResolver complexity
    return None

# Use basic field validation instead
required_fields = ['id', 'action', 'timing', 'voice']
missing_fields = [field for field in required_fields 
                 if field not in shot or shot[field] is None]
```

#### 2. NoneType Iteration Errors

**Problem**: `argument of type 'NoneType' is not iterable` during validation

**Root Cause**:
- Missing or null values in required fields
- Schema validation attempting to iterate over None values
- Incomplete data transformation leaving null references

**Solution**:
```python
# Safe field access and validation
shot_id = shot.get('id', 'unknown')
if not isinstance(shot, dict):
    logger.error(f"Invalid shot data type: {type(shot)}")
    continue

# Check for null values explicitly
missing_fields = [field for field in required_fields 
                 if field not in shot or shot[field] is None]
```

#### 3. Index-Image Filename Mismatch

**Problem**: Shot index doesn't match the numeric part of image filenames

**Implementation**:
```python
def validate_index_matches_image(shot):
    """Validate that the index number matches the digits in the image filename."""
    index = shot['index']
    if shot.get('assets') and len(shot['assets']) > 0:
        image_file = shot['assets'][0].get('path', '')
        image_digits = ''.join(filter(str.isdigit, image_file))
        
        if str(index) != image_digits:
            logger.warning(f"Index {index} does not match image filename digits {image_digits}")
```

### Best Practices for ID Management

1. **Consistent Formatting**: Always use zero-padded format (`sc01` not `sc1`)
2. **Index Preservation**: Keep original numeric index for sorting and reference
3. **Validation Layers**: 
   - Basic field presence checks
   - Type validation
   - Cross-reference validation (index vs filename)
4. **Error Handling**: Graceful degradation when validation fails
5. **Debug Modes**: Comprehensive logging for troubleshooting

### Troubleshooting Validation

When encountering validation errors:

1. **Enable Debug Mode**:
   ```python
   validate_and_fix_json(input_file, output_file, schema_file, debug=True)
   ```

2. **Check Common Issues**:
   - Missing required fields (`id`, `action`, `timing`, `voice`)
   - Null values in required fields
   - Type mismatches (expecting dict, got None)
   - Schema reference resolution failures

3. **Fallback Strategy**:
   - Disable complex schema validation temporarily
   - Use basic field validation
   - Focus on data transformation first
   - Add schema validation back incrementally

### Migration Notes

When migrating from complex validation to simplified validation:
- Data transformation logic remains unchanged
- Basic field validation replaces schema validation
- Index-image validation continues to work
- Output format stays consistent
- Debug information becomes more focused and actionable

This document is now your single-page reference for creating, validating, and extending Immerschema's modular metadata across every stage of a fulldome or CG project.