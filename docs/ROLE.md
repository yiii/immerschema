**Cheat-sheet — Immerschema `role.enum.json` (focused 18-tag set)**

| Role tag                   | Dept / Phase            | What this person actually does                | Typical deliverables             | Legacy titles it replaces                  |
| -------------------------- | ----------------------- | --------------------------------------------- | -------------------------------- | ------------------------------------------ |
| **Director**               | Creative leadership     | Owns concept, story, final look               | Treatment, director’s cut notes  | Director                                   |
| **Producer**               | Budget & logistics      | Money, contracts, schedule, vendor wrangling  | Master schedule, cost reports    | Producer                                   |
| **ProjectManager**         | Ops & tracking          | Day-to-day task board, stand-ups, burn-downs  | Gantt, Jira/Trello dashboards    | Line Producer, Production Coordinator      |
| **ArtLead**                | Pre-pro / Look-dev      | Guides storyboards, concept art, style frames | Boards, style bible, colour keys | Writer, Storyboard Artist, Concept Artist  |
| **CGSupervisor**           | Show-level CG           | Defines pipeline, reviews every CG shot       | Pipeline doc, shot approvals     | VFX Supervisor, CG Supervisor, Pipeline TD |
| **HoudiniArtist**          | FX / Procedural         | Sims: fluids, particles, VDB, SOPs            | Houdini .hip files, VDB caches   | Houdini FX TD                              |
| **MotionDesigner**         | 2D / 3D motion-graphics | Kinetic type, UI, infographics                | AE comps, mograph rigs           | Motion Designer                            |
| **UnrealArtist**           | Realtime / Engine       | UE scenes, Lumen lighting, Blueprint logic    | .uproject, cooked builds         | Unreal Technical Artist                    |
| **TouchDesignerArtist**    | Realtime / VJ           | TD networks for interactive visuals           | .toe files, GLSL shaders         | TD content creator                         |
| **TouchDesignerDeveloper** | Realtime / Code         | Python/GLSL in TD, device I/O, OSC/MIDI       | Custom operators, integrations   | TD Python dev                              |
| **NotchArtist**            | Realtime / Show         | Notch blocks, particles, volumetrics          | .dfx blocks                      | Notch VFX artist                           |
| **AIArtist**               | Gen-AI pipeline         | Prompt crafting, model finetuning, upscales   | Seed logs, checkpoint files      | Prompt Engineer                            |
| **AudioLead**              | Music & SFX             | Oversees all audio, syncs with picture        | Music plan, mix stems            | Audio Supervisor                           |
| **Composer**               | Scoring                 | Writes original music cues                    | Stems, MIDI, final mix           | Composer                                   |
| **PostLead**               | Editorial               | Manages edit, grade, online, delivery         | EDL/AAF, graded masters          | Post Supervisor                            |
| **MontageArtist**          | Editorial support       | Fast cuts, temp reels, multicam selects       | Montaged offline edits           | Assistant Editor, Sizzle-reel editor       |
| **CameraOperator**         | Field capture           | Lens, focus, camera rigs, 360 shoots          | Footage cards, camera logs       | CameraMan                                  |
| **TechSupport**            | IT / QA                 | Hardware, render farm, show-control ops       | Uptime logs, render node configs | QA, IT, Researcher                         |
| **other**                  | —                       | Anything not covered                          | —                                | Hybrid / experimental titles               |

### How to tag in Immerschema

```jsonc
{
  "people": [
    {
      "role": "HoudiniArtist",
      "name": "Ada Lovelace",
      "customRole": "Flip fluids specialist"   // optional fine-grain note
    },
    {
      "role": "CGSupervisor",
      "name": "Grace Hopper"
    }
  ]
}
```

* **Exactly one `role` per person** from the list.
* Use `customRole` for extra flavour (LightingLead, RiggingTD, etc.).
* Keep permission sets, rate cards, and dashboards keyed to the 18 role tags—small, clear, future-proof.
