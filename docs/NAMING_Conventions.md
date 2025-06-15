| Token   | Meaning                                        | Example techniques                                                              |
| ------- | ---------------------------------------------- | ------------------------------------------------------------------------------- |
| **3D**  | Polygonal & volumetric CG (offline & realtime) | `3d_render`, `3d_realtime_prerender`                                            |
| **2D**  | Flat / motion-graphics / stylised 2-D          | `2d_hand_drawn`, `2d_motion_graphics`, `2d_montage`                             |
| **SIM** | Physics-based or solver-driven simulations     | `sim_fluid`, `sim_smoke_fire`, `sim_cloth_softbody`                             |
| **GEN** | Generative or procedural (rule/data-driven)    | `gen_procedural`, `gen_particle`, `gen_data_viz`, `gen_generative_art`          |
| **AI**  | Machine-learning / neural media                | `ai_generate`, `ai_style_transfer`, `ai_avatar`, `ai_face_swap`                 |
| **CAM** | Any camera-capture: video, timelapse, macro    | `capture_video`, `capture_macro`, `capture_timelapse`, `capture_photogrammetry` |


**Code Naming Pattern**


All technique codes follow this snake_case pattern:

<prefix>_<noun_or_action>



| Prefix    | Covers                             | Example codes                                       |
| --------- | ---------------------------------- | --------------------------------------------------- |
| `3d`      | Polygonal CG & realtime engines    | `3d_render`, `3d_realtime_prerender`                |
| `capture` | Camera‐based capture & scans       | `capture_video`, `capture_photogrammetry`           |
| `rig`     | Keyframe or performance animation  | `rig_animation`, `mocap_performance`                |
| `2d`      | 2-D & motion-graphics              | `2d_hand_drawn`, `2d_motion_graphics`, `2d_montage` |
| `gen`     | Generative / procedural pipelines  | `gen_procedural`, `gen_data_viz`                    |
| `sim`     | Physics / solver-based sims        | `sim_fluid`, `sim_smoke_fire`                       |
| `ai`      | AI / ML media generation & effects | `ai_generate`, `ai_style_transfer`                  |


Tip: if you ever add a text-to-X AI model that outputs audio, video, or 3-D, map it to ai_generate + a note, rather than exploding the enum.


3 Primary vs. Secondary Techniques
primaryTechnique (required in Review): the one dominant method for this shot.

otherTechniques (optional): any additional methods layered on top.

You might fill:

json
Copy
Edit
{
  "primaryTechnique": "gen_particle",
  "otherTechniques": ["sim_smoke_fire","2d_motion_graphics"]
}