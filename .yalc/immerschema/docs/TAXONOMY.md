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
Categorizes safety and compliance warnings for immersive content:

- **Viewer Health**: `photosensitive_seizure`, `motion_sickness`, `vertigo_trigger`, `claustrophobia_trigger`, `fear_of_heights_trigger`
- **Audio SPL**: `loud_volume`, `low_frequency_rumble`
- **Environmental FX**: `laser_hazard`, `strobe_light`, `heavy_fog`, `scent_allergy`
- **Content Sensitivity**: `graphic_medical_content`, `body_horror`, `religious_sensitivity`, `political_sensitivity`, `mature_themes`
- **IP / Legal**: `copyright_unverified`, `ai_copyright_unclear`, `talent_release_missing`
- **Technical**: `render_time_overrun`, `hardware_overheat`, `projector_alignment_risk`, `sync_drift`, `frame_drop_risk`
- **Narrative / UX**: `narrative_confusion`, `translation_required`

### 💻 Software (`software.taxonomy.json`)
Organizes production tools by workflow category:

- **3-D DCC**: `Houdini`, `Blender`, `Maya`, `Cinema4D`
- **Engines / Realtime**: `Unreal`, `Unity`, `Notch`, `TouchDesigner`
- **Compositing**: `AfterEffects`, `Nuke`, `DaVinciResolve`
- **Renderers**: `Redshift`, `Octane`, `Arnold`, `VRay`
- **AI / Gen**: `StableDiffusion`, `Midjourney`, `RunwayGen2`, `Veo`
- **Audio DAW**: `Ableton`, `ProTools`, `Reaper`
- **Pipeline / Tracking**: `ShotGrid`, `FTrack`, `git`

### 🎨 Techniques (`technique.taxonomy.json`)
Groups production techniques by artistic approach:

- **3D CGI**: `3d_render`, `cgi_3d_realtime`, `volumetric_capture`, `photogrammetry`
- **2D & Motion-Graphics**: `hand_drawn_2d`, `vector_2d`, `cutout_animation`, `motion_graphics`, `info_graphics`
- **Procedural / Generative**: `procedural_geometry`, `particle_system`, `fractal_render`, `data_driven_visual`
- **Simulation**: `fluid_sim`, `smoke_fire_sim`, `cloth_softbody_sim`
- **AI / ML**: `ai_image`, `ai_video`, `style_transfer`
- **Live-action & Hybrid**: `live_action_plate`, `macro_photography`, `timelapse`, `stereo_3d_capture`, `mixed_media_collage`
- **Stylised**: `cel_shaded`, `toon_shader`, `stop_motion`
- **Audio-Reactive**: `audio_reactive`, `music_visualizer`

### 📺 Screen Zones (`screenzone.taxonomy.json`)
Spatial organization for multi-screen installations:

- **Physical Layout**: Standard screen positioning and arrangement categories
- **Content Zones**: Logical content areas within the display space

### 👤 Roles (`role.taxonomy.json`)
Production team organization by department and responsibility:

- **Creative Leadership**: Director, producer, creative director roles
- **Technical Teams**: Engineering, pipeline, and technical artist roles
- **Content Creation**: Artists, designers, and content specialist roles

## Taxonomy Structure

Each taxonomy file follows this JSON Schema pattern:

```json
{
  "$id": "https://example.com/schemas/taxonomy/[name].taxonomy.json",
  "title": "[Name] taxonomy (UI helper)",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "Category Name": {
      "type": "array",
      "items": {
        "$ref": "../enum/[name].enum.json"
      },
      "minItems": 1,
      "enum": ["value1", "value2", "value3"]
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
- **Deprecate value** → Move to "Deprecated" category (NO version bump)
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
    <Option value="Unity">Unity</Option>
  </OptGroup>
</Select>
```

### Filter Interface
```javascript
// Taxonomy powers faceted search
const filters = {
  "3D CGI": ["3d_render", "cgi_3d_realtime"],
  "AI / ML": ["ai_image", "ai_video"]
}
```

## Schema References

- Core architecture: [`ARCHITECTURE.md`](ARCHITECTURE.md)
- Enum files: `schemas/enum/*.json`
- Taxonomy files: `schemas/taxonomy/*.json`
- Validation schemas: JSON Schema with semantic versioning 