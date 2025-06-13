| New flag                  | Former granular flags rolled inside                                                                             | Typical mitigation                                               |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **render\_overrun**       | render\_time\_overrun · render\_queue\_block · gpu\_memory\_overflow                                            | Add nodes, optimise samples, pre-cache                           |
| **asset\_block**          | asset\_backlog · missing\_dependency · cache\_corruption · version\_control\_conflict                           | Upstream deadlines, auto-dependency check, branch-locking        |
| **software\_failure**     | license\_expiry · software\_crash                                                                               | Floating-license monitor, nightly stability build                |
| **infrastructure\_issue** | hardware\_failure · hardware\_overheat · data\_loss · network\_latency                                          | Redundant RAID, temperature alerts, QoS VLAN                     |
| **realtime\_sync**        | sync\_drift · frame\_drop · projection\_alignment\_error · calibration\_drift · tracking\_loss · latency\_spike | Genlock/Timecode, auto-warp recalibration, buffer health         |
| **schedule\_scope**       | scope\_creep · schedule\_slip · budget\_overrun                                                                 | Formal change-request board, burn-down chart, contingency buffer |
| **creative\_alignment**   | creative\_deadlock · stakeholder\_indecision · incomplete\_brief · feedback\_loop\_overload                     | Single source of truth, locked look-dev, max review rounds       |
| **compliance\_delay**     | legal\_clearance\_delay · client\_version\_mismatch                                                             | Early rights check, version-matrix hand-off                      |
| **talent\_gap**           | talent\_gap (kept explicit)                                                                                     | Freelance bench, cross-training                                  |
| **data\_breach**          | data\_privacy\_breach                                                                                           | MFA, encrypted transfer, audit logs                              |



3 — How to use the slim list
Tag wisely – One shot or task rarely needs more than two umbrella flags at once.

Dashboard heat-map – Ten colours max stay readable; product owners see hot zones instantly.

Playbooks – Pair each umbrella flag with a one-page mitigation SOP; no micro-management required.





| Umbrella flag          | Typical sub-risks it absorbs              | JSON location  |
| ---------------------- | ----------------------------------------- | -------------- |
| `render_overrun`       | slow frames, queue jams, out-of-VRAM      | per-shot       |
| `asset_block`          | missing LUT, late models, merge conflicts | asset task     |
| `software_failure`     | crashes, licence lock-outs                | render node    |
| `infrastructure_issue` | disk death, overheat, lost files          | facility-level |
| `realtime_sync`        | genlock drift, frame drops, tracking loss | show node      |
| `schedule_scope`       | scope creep, slips, cost overruns         | project root   |
| `creative_alignment`   | deadlocked look-dev, mixed feedback       | episode root   |
| `compliance_delay`     | legal clearance, client build mismatch    | delivery task  |
| `talent_gap`           | key artist unavailable                    | HR task        |
| `data_breach`          | leak, hack, insecure transfer             | IT task        |


_Implementation note_: For traceability, the pipeline DB stores both the umbrella flag **and** an optional `detail` string (e.g. `"render_overrun – GPU at 98 % for 5 hrs"`).

### 2 Tagging in Immerschema JSON

json

CopyEdit

`{   "id": "sc_05_storm_cloud",   "riskFlags": ["render_overrun", "asset_block"],   "riskDetail": "Queue saturated; missing sky texture v12" }`

_Who tags?_

- **Artists** tag when they notice a blocker.
    
- **CI scripts** tag automatically (e.g. farm > 95 % queue → `render_overrun`).
    
- **Producers** tag global items like `schedule_scope` at project level.
    

### 3 Aggregation & dashboard

A nightly Python job walks all JSON files:

pseudo

CopyEdit

`FOR each file IN project:     FOR flag IN file.riskFlags:         counters[flag] += 1`

Results feed a Heat-Map panel (red = 10+ hits, orange = 5-9, green < 5). Producers instantly spot spikes—say, `asset_block` at 14 occurrences.

### 4 Playbook trigger

Each flag has a one-page SOP. Example:

|Flag|Trigger threshold|Automatic action|
|---|---|---|
|`render_overrun`|≥ 3 shots flagged|Add 2 GPU nodes, lower samples 10 %|
|`asset_block`|≥ 5 open tasks|Daily 9 AM asset-stand-up|

The dashboard fires Jira tasks or Slack alerts referencing the SOP section.

### 5 Review & close

When a mitigation works (queue clears, assets land), the owner deletes the flag or flips `status:"cleared"`. The next aggregation cycle drops the heat, confirming resolution.

---

## Why it works

1. **Signal, not noise** – Ten flags fit one glance; no one drowns in 30 line items.
    
2. **Traceability preserved** – Optional `detail` holds the granular story.
    
3. **Automation-friendly** – CI tools can tick flags with a simple string match.
    
4. **Human ownership** – Every flag has a playbook, so the team knows exactly _who_ acts and _how_.