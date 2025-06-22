# Agile Manual

Immerschema v1.4 extends the data model with optional Agile hierarchy fields. This manual explains how to structure your project folders and JSON files when adopting Themes, Initiatives, Epics, Features, Stories and Tasks.

## 1 · Folder Layout

```text
projects/
└─ neuro-film/
   ├─ project.json
   ├─ features.json
   ├─ scenes/
   │   ├─ sc04.json
   │   ├─ sc07.json
   │   └─ …
   ├─ stories/
   │   ├─ fog_track_hand.json
   │   ├─ dot_audio_response.json
   │   └─ …
   ├─ tasks/
   │   └─ task_rsl_calib.json
   └─ crew/
       ├─ cg_supervisor.json
       └─ td_greg.json
```

*`features.json`* may start as an empty array and grow as reusable effects emerge. Each scene lists `storyIds` and `crewIds` instead of embedding the objects. Stories then reference the tasks that implement them.

## 2 · Agile Hierarchy

```
Theme → Initiative → Epic → [Feature] → Story → Task
```

- **Theme** – long term focus (6–12 months)
- **Initiative** – film or event level (1–4 months)
- **Epic** – major chapter or milestone (2–6 weeks)
- **Feature** – optional cross-shot capability (2–4 weeks)
- **Story** – concrete slice of work (1–2 weeks)
- **Task** – atomic step (hours or days)

Populate `themeId`, `initiativeId` and `epicIds` in `project.json` and refer to `featureId` from stories/tasks when you formalize features. Until then, use a free `featureTag` string.

## 3 · Gantt Overlay

The optional overlay slice `tasks-gantt.slice.json` lets you record UI hints like `rowId`, `color` and `ganttFlags`. Only Plan/Assign profiles require these fields.

## 4 · Migration Tips

1. Extract every task into `tasks/` and crew member into `crew/`.
2. Add minimal stories for each scene and list their IDs in `scenes/`.
3. Introduce `features.json` when you have stories shared across scenes.
4. Run AJV validation with the Draft or Plan profile to catch mistakes early.
