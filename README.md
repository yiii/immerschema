# Fulldome Schema Suite

A JSON Schema designed to ensure consistent data structure across production pipelines.

## 🌟 Features

* **Core shot schema** – validates every scene or sub-scene with detailed metadata
* **Project schema** – wraps all shots for whole-show validation and global settings
* **Enum packs** – single source of truth for techniques, risk flags, screen zones, and more
* **Taxonomy packs** – human-friendly categorization for UI components
* **LLM I/O schema** – guarantees safe, auditable AI edits
* **Comprehensive examples** – real-world usage patterns and edge cases
* **Automated testing** – full validation suite with edge case coverage

## 📁 Project Structure

```
fulldome-schema-suite/
├── schemas/                    # Core JSON Schema files
│   ├── core.schema.json       # Individual shot validation
│   ├── project.schema.json    # Project-level validation
│   ├── enum/                  # Enumeration schemas
│   │   ├── technique.enum.json
│   │   ├── screenzone.enum.json
│   │   ├── riskflag.enum.json
│   │   ├── role.enum.json
│   │   └── software.enum.json
│   ├── ext/                   # Extension schemas
│   ├── io/                    # Input/Output schemas
│   └── taxonomy/              # Taxonomy definitions
├── examples/                   # Comprehensive examples
│   ├── simple_project.json    # Minimal valid project
│   ├── comprehensive_project.json  # Full-featured project
│   ├── ai_generated_shot.json # AI-focused techniques
│   ├── live_action_shot.json  # Photography/live-action
│   └── audio_reactive_shot.json    # Audio-reactive content
├── test/                      # Test files and validation
│   ├── test_project.json      # Legacy test project
│   ├── test_shot.json         # Legacy test shot
│   ├── validation_tests.json  # Comprehensive validation tests
│   └── edge_cases.json        # Edge cases and boundary tests
└── scripts/
    └── test_runner.js         # Automated test runner
```

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Or install AJV globally for command-line validation
npm run install-global-ajv
```

### Basic Validation

```bash
# Validate a shot against core schema
ajv validate -s schemas/core.schema.json -d examples/simple_shot.json

# Validate whole project
ajv validate -s schemas/project.schema.json -d examples/simple_project.json

# Run all automated tests
npm test
```

## 📋 Examples

### Simple Project (Minimal Fields)
```json
{
  "projectId": "simple-dome-001",
  "title": "Simple Fulldome Experience",
  "shots": [
    {
      "schemaVersion": "1.0.0",
      "id": "sc01-ss01",
      "index": 0,
      "scene": 1,
      "durationSec": 15,
      "voice": { "lang": "en", "text": "Welcome to the universe" },
      "screenZone": "full_dome",
      "primaryTechnique": "cgi_3d_pre_render"
    }
  ]
}
```

### Advanced Shot (All Features)
Our comprehensive examples demonstrate:
- **AI-Generated Content**: Using AI image/video techniques with proper copyright flagging
- **Live Action**: Macro photography with timelapse and proper talent releases
- **Audio-Reactive**: Music visualization with safety considerations for volume and seizures
- **Complex Workflows**: Multi-department task management and crew coordination

See the `examples/` directory for complete implementations.

## 🎯 Available Techniques

### 3D & CGI
- `cgi_3d_pre_render` - Traditional pre-rendered 3D
- `cgi_3d_realtime` - Real-time 3D rendering
- `volumetric_capture` - Volume-based capture
- `photogrammetry` - 3D reconstruction from photos

### 2D & Graphics
- `hand_drawn_2d` - Traditional hand-drawn animation
- `vector_2d` - Vector-based graphics
- `motion_graphics` - Animated graphics and typography
- `info_graphics` - Data visualization

### Simulation & Procedural
- `procedural_geometry` - Algorithm-generated shapes
- `particle_system` - Particle-based effects
- `fluid_sim` - Fluid dynamics simulation
- `smoke_fire_sim` - Volumetric effects

### AI & Machine Learning
- `ai_image` - AI-generated imagery
- `ai_video` - AI-generated video
- `style_transfer` - AI style transformation

### Live Action & Photography
- `live_action_plate` - Live-action footage
- `macro_photography` - Close-up photography
- `timelapse` - Time-compressed sequences
- `stereo_3d_capture` - Stereoscopic capture

### Audio-Visual
- `audio_reactive` - Audio-driven visuals
- `music_visualizer` - Music visualization

## 🗺️ Screen Zones

Fulldome experiences can target specific areas of the dome:

### Directional Zones
- `zenith` - Top of dome
- `nadir` - Bottom of dome (rare)
- `horizon_band` - Eye-level band
- `upper_band` / `lower_band` - Above/below horizon

### Compass Directions
- `north`, `south`, `east`, `west`
- `front`, `rear`, `left`, `right`

### Quadrants
- `upper_front_left`, `upper_front_right`
- `upper_rear_left`, `upper_rear_right`
- `lower_front_left`, `lower_front_right`
- `lower_rear_left`, `lower_rear_right`

### Full Coverage
- `full_dome` - Entire dome surface

## ⚠️ Risk Flags

The schema includes comprehensive risk assessment:

### Health & Safety
- `photosensitive_seizure` - Flashing lights concern
- `motion_sickness` - Camera movement issues
- `vertigo_trigger` - Height/movement sensitivity
- `claustrophobia_trigger` - Enclosed space anxiety
- `loud_volume` - Hearing protection needed

### Technical Risks
- `render_time_overrun` - Computationally expensive
- `hardware_overheat` - System stress concerns
- `sync_drift` - Audio/visual synchronization
- `frame_drop_risk` - Performance issues

### Content & Legal
- `copyright_unverified` - Rights clearance needed
- `ai_copyright_unclear` - AI-generated content concerns
- `talent_release_missing` - Model releases required
- `mature_themes` - Adult content considerations

## 🧪 Testing & Validation

### Automated Test Suite

Run the comprehensive test suite:

```bash
npm test
```

This validates:
- All example files against their schemas
- Edge cases and boundary conditions
- Invalid input detection
- Enum value validation
- Required field enforcement

### Manual Testing

```bash
# Test individual files
ajv validate -s schemas/core.schema.json -d test/edge_cases.json

# Test with verbose output
ajv validate -s schemas/project.schema.json -d examples/comprehensive_project.json --verbose
```

### Test Categories

1. **Validation Tests** (`test/validation_tests.json`)
   - Minimal valid configurations
   - Invalid patterns and formats
   - Enum value testing
   - Task and people validation

2. **Edge Cases** (`test/edge_cases.json`)
   - Boundary value testing
   - Unicode content support
   - Maximum complexity scenarios
   - Error condition validation

## 👥 Team Roles

The schema supports comprehensive crew management:

### Creative Roles
- `Director`, `Producer`, `Writer`
- `StoryboardArtist`, `ConceptArtist`

### Technical Roles
- `VFXSupervisor`, `CGSupervisor`, `PipelineTD`
- `Modeler`, `TextureArtist`, `Rigger`, `Animator`
- `LightingTD`, `Compositor`, `TouchDesignerDeveloper`

### Audio Roles
- `Composer`, `SoundFXDesigner`, `AudioEngineer`, `VOActor`

### Post Production
- `Editor`, `Colorist`, `QA`

### Custom Roles
Use `"role": "other"` with `"customRole": "Your Custom Title"` for specialized positions.

## 🛠️ Software Pipeline

Track software usage across the project:

### 3D & Animation
- `Houdini`, `Blender`, `Maya`, `Cinema4D`

### Real-time Engines
- `Unreal`, `Unity`, `Notch`, `TouchDesigner`

### Compositing & Editing
- `AfterEffects`, `Nuke`, `DaVinciResolve`

### Rendering
- `Redshift`, `Octane`, `Arnold`, `VRay`

### AI Tools
- `StableDiffusion`, `Midjourney`, `RunwayGen2`, `Veo`

### Audio
- `Ableton`, `ProTools`, `Reaper`

### Project Management
- `ShotGrid`, `FTrack`, `git`

## 📖 Contributing

1. **Schema Changes**: Bump `schemaVersion` (SemVer) for any breaking changes
2. **Documentation**: Update CHANGELOG.md for all modifications
3. **Testing**: Run `npm test` before submitting changes
4. **Examples**: Add examples for new features or use cases
5. **Pull Requests**: All changes require peer review

### Development Workflow

```bash
# Install dependencies
npm install

# Run tests during development
npm test

# Validate specific examples
npm run validate-shot examples/ai_generated_shot.json
npm run validate-project examples/comprehensive_project.json
```

## 📄 License

MIT License - see LICENSE file for details.

---
