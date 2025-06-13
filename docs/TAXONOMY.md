# 🏷️ Taxonomy System

## Overview

The taxonomy system provides **human-friendly categorization** for UI components in the immerschema project. Unlike enums which are flat lists, taxonomies organize enum values into logical groups for better user experience and easier content management.

## Architecture

| Component | Purpose |
|-----------|---------|
| **Enum Files** | `schemas/enum/*.json` - Flat lists of valid values |
| **Taxonomy Files** | `schemas/taxonomy/*.json` - Categorized groupings of enum values |
| **UI Integration** | Dropdowns, filters, and form components use taxonomy structure |

## Current Taxonomies

### 🚨 Risk Flags (`riskflag.taxonomy.json`)
Categorizes project risks and issues:

- **Technical**: `render_overrun`, `software_failure`, `infrastructure_issue`, `realtime_sync`
- **Production**: `asset_block`, `schedule_scope`, `creative_alignment`, `talent_gap`
- **Compliance**: `compliance_delay`, `data_breach`

### 💻 Software (`software.taxonomy.json`)
Organizes production tools by workflow category:

- **3-D DCC**: `Houdini`, `Blender`, `Cinema4D`
- **Engines / Realtime**: `Unreal`, `Notch`, `TouchDesigner`
- **Compositing**: `AfterEffects`
- **Renderers**: `Redshift`, `Octane`
- **AI / Gen**: `Midjourney`, `RunwayGen2`, `Veo`, `ElevenLabs`
- **Audio DAW**: `Ableton`, `VCV`
- **Pipeline / Tracking**: `git`
- **Other**: `other`

### 🎨 Techniques (`technique.taxonomy.json`)
Groups production techniques by artistic approach:

- **3D Rendering & Realtime**: `3d_render`, `3d_realtime`
- **Capture & Scanning**: `capture_video`, `capture_volumetric`, `capture_photogrammetry`, `capture_360`, `capture_stock`
- **Character Animation**: `rig_animation`, `mocap_performance`
- **2D / Motion-Graphics**: `2d_montage`, `2d_multiscreen`, `2d_video_collage`, `2d_hand_drawn`, `2d_shape_animation`, `2d_info_graphics`, `2d_typography`
- **Generative & Procedural**: `gen_procedural`, `gen_particle`, `gen_data_viz`, `gen_audio_reactive`, `gen_generative_art`
- **Simulation (Physics)**: `sim_fluid`, `sim_smoke_fire`, `sim_cloth_softbody`
- **AI / ML**: `ai_generate`, `ai_style_transfer`, `ai_avatar`, `ai_face_swap`

### 📺 Screen Zones (`screenzone.taxonomy.json`)
Spatial organization for multi-screen installations:

- **Vertical**: `zenith`, `upper`, `horizon`, `lower`, `nadir`
- **Cardinal**: `front`, `rear`, `left`, `right`
- **Quadrants-Upper**: `upper_front_left`, `upper_front_right`, `upper_rear_left`, `upper_rear_right`
- **Quadrants-Lower**: `lower_front_left`, `lower_front_right`, `lower_rear_left`, `lower_rear_right`
- **Full**: `full_dome`

### 👤 Roles (`role.taxonomy.json`)
Production team organization by department and responsibility:

- **Direction & Production**: `Director`, `Producer`, `ProjectManager`
- **Art & Supervision**: `ArtLead`, `CGSupervisor`
- **Realtime & FX**: `HoudiniArtist`, `MotionDesigner`, `UnrealArtist`, `TouchDesignerArtist`, `TouchDesignerDeveloper`, `NotchArtist`, `AIArtist`
- **Audio**: `AudioLead`, `Composer`
- **Post Production**: `PostLead`, `MontageArtist`
- **Support**: `CameraOperator`, `TechSupport`
- **Other**: `other`

## Taxonomy Structure

Each taxonomy file follows this JSON Schema pattern:

```json
{
  "$id": "immerschema/schemas/taxonomy/[name].taxonomy.json",
  "title": "[Name] taxonomy (UI helper)",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "Category Name": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["value1", "value2", "value3"]
      },
      "minItems": 1
    }
  }
}
```

## Maintenance Guidelines

### Adding New Values
1. **Add to enum file first** → `schemas/enum/[name].enum.json`
2. **Add to appropriate taxonomy category** → `schemas/taxonomy/[name].taxonomy.json`
3. **Bump schema version** (MINOR)

### Reorganizing Categories
- **Moving values between categories** → Edit taxonomy only (NO version bump)
- **Renaming categories** → Edit taxonomy only (NO version bump)
- **Creating new categories** → Edit taxonomy only (MINOR version bump)

### Deprecation
- **Deprecate value** → Move to "Other" category (NO version bump)
- **Remove value** → Delete from both enum and taxonomy (MAJOR version bump)

### Category Design Principles
- **Functional Grouping**: Group by how items are used, not just what they are
- **Balanced Categories**: Aim for 3-8 items per category for optimal UX
- **Clear Boundaries**: Minimize ambiguity about which category an item belongs to
- **Future-Proof**: Design categories that can accommodate new values
- **User-Centric**: Name categories using terminology familiar to end users

## UI Integration Examples

### Dropdown with Categories
```javascript
// Taxonomy enables grouped dropdowns
<Select placeholder="Choose software...">
  <OptGroup label="3-D DCC">
    <Option value="Houdini">Houdini</Option>
    <Option value="Blender">Blender</Option>
  </OptGroup>
  <OptGroup label="Engines / Realtime">
    <Option value="Unreal">Unreal</Option>
    <Option value="Notch">Notch</Option>
  </OptGroup>
</Select>
```

### Filter Interface
```javascript
// Taxonomy powers faceted search
const filters = {
  "3D Rendering & Realtime": ["3d_render", "3d_realtime"],
  "AI / ML": ["ai_generate", "ai_style_transfer"]
}
```

## Schema References

- Core architecture: [`ARCHITECTURE.md`](ARCHITECTURE.md)
- Enum files: `schemas/enum/*.json`
- Taxonomy files: `schemas/taxonomy/*.json`
- Validation schemas: JSON Schema with semantic versioning 