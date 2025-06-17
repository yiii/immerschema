Adding `projectCrew` is a solid step, but most production-grade PM tool-chains track **nine more data families** before teams feel “complete”. Below is a gap analysis against ISO 21500, PMI Practice Standards, and the data models used by Microsoft Project, Primavera P6, Asana and OpenProject.

---

## Executive snapshot

Your current root blocks (`shots`, `projectTasks`, `projectCrew) already cover **scope, time, team and high-level risk**. To reach the coverage of mainstream schedulers you still need:

| Domain                          | Missing object(s)                                   | Why it matters                                                                                                              |
| ------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Performance baselines**       | `scheduleBaseline`, `costBaseline`, `scopeBaseline` | Variance tracking is one of the three PMBOK “performance baselines” ([projectmanagementacademy.net][1], [pmi.org][2])       |
| **Budget & cost**               | `budget` (planned €), `actualCost`, `EAC/ETC`       | ISO 21500 lists **cost** as a core control area ([iso.org][3], [tensix.com][4])                                             |
| **Calendars**                   | `projectCalendar` (working days, holidays)          | Needed for correct CPM float just like in MSP & P6 schemas ([learn.microsoft.com][5], [planacademy.com][6])                 |
| **Resource ↔ task assignments** | `assignments` or `tasks[].resources`                | Explicit mapping is how MSP/P6 calculate effort and availability ([learn.microsoft.com][5], [learn.microsoft.com][7])       |
| **Deliverables register**       | `deliverables[]`                                    | Client hand-off list required by most SOWs ([watech.wa.gov][8], [ppm.express][9])                                           |
| **Change log / issues**         | `changes[]`, `issues[]`                             | PMBOK treats change & issue logs as mandatory project docs ([pmi.org][2])                                                   |
| **Quality & approvals**         | `approvals[]`, `qualityMetrics[]`                   | Tracks sign-offs and QC KPIs; mirrors OpenProject’s “status/approval” fields ([openproject.org][10], [openproject.org][11]) |
| **Comms / stakeholders**        | `stakeholders[]`, `communicationPlan`               | Smoothes review cycles; common in enterprise tools like Asana ([help.asana.com][12], [forum.asana.com][13])                 |
| **Comprehensive risk log**      | already present, but add `riskAudit` history        | Risk templates include audit & owner history ([projectmanagement.com][14], [projectmanager.com][15])                        |

---

## 1  Performance baselines

* Store the **original plan** once (`start`, `finish`, `budget`) and compare actuals each week. PMP study guides treat this trio as the central “performance baseline” ([projectmanagementacademy.net][1]).
* Schema fragment:

  ```jsonc
  "baselines": {
    "schedule": { "start": "...", "finish": "..." },
    "cost":     { "planned": 120000, "currency": "USD" },
    "scope":    { "shotsPlanned": 24 }
  }
  ```

## 2  Resource assignments

MS Project’s XML puts **Assignments** next to **Tasks** to calculate work and availability ([learn.microsoft.com][5], [learn.microsoft.com][7]).  You can:

* embed an array in each task (`resources:["r-bob","r-anna"]`), **or**
* create a global `assignments[]` slice with `{taskId, crewId, role, %allocation}`.

## 3  Budget & cost control

Primavera’s XER holds labour, equipment and materials cost tables ([planacademy.com][6], [help.deltek.com][16]).  A minimal slice:

```jsonc
"budget": {
  "currency": "USD",
  "planned": 150000,
  "committed": 90000,
  "actual": 82000,
  "eac": 155000   // Estimate At Completion
}
```

## 4  Calendars

*Needed for correct CPM/float.*  Both MSP and P6 define work/holiday calendars inside the root project element ([learn.microsoft.com][5], [planacademy.com][6]).
Simplest JSON:

```json
"projectCalendar": {
  "timezone": "Asia/Bangkok",
  "workWeek": ["Mon","Tue","Wed","Thu","Fri"],
  "holidays": ["2025-12-31","2026-01-01"]
}
```

## 5  Deliverables & approvals

Clients often demand a **deliverables register**; WA-Tech’s XLS template shows typical columns (ID, description, due, status) ([watech.wa.gov][8], [ppm.express][9]).  Link each deliverable to a shot or group.

## 6  Risks, issues & change log

You already log risks; add:

* `issues[]` – blockers not yet escalated to change requests.
* `changes[]` – approved scope/cost/schedule changes with `baselineImpact`.

Both fields appear in PMBOK’s Control Scope and Control Schedule processes ([pmi.org][2]).

## 7  Stakeholder & communication plan

Asana’s export includes “followers” and “stories” (comment threads) ([help.asana.com][12], [forum.asana.com][13]).  A lightweight slice:

```json
"stakeholders": [
  { "name":"Client Rep", "role":"Reviewer", "contact":"email@example.com" }
],
"communicationPlan": "weekly-sync, daily-scrum, ad-hoc Slack"
```

---

## Recommended slice additions

| Slice file                     | Exposes property     | Core fields                       |
| ------------------------------ | -------------------- | --------------------------------- |
| `schedule_baseline.slice.json` | `baselines.schedule` | start, finish                     |
| `cost_baseline.slice.json`     | `baselines.cost`     | planned, actual, eac              |
| `calendar_prop_slice.json`     | `projectCalendar`    | timezone, workWeek, holidays      |
| `deliverables_prop_slice.json` | `deliverables`       | id, title, due, status, shotIds?  |
| `assignments_prop_slice.json`  | `assignments`        | taskId, crewId, role, allocation  |
| `issues_prop_slice.json`       | `issues`             | id, description, severity, status |
| `changes_prop_slice.json`      | `changes`            | id, reason, approvedOn, impact    |

Add them to **Plan** (optional) and make most of them **required in Lock**, mirroring industry “control” gates.

---

## Verdict

*For day-to-day creative tracking* (shots, crew, tasks, risks) your schema **is already functional**.
*For full-fledged PM oversight* (budget, baselines, approvals, change control) you should extend with the blocks above to match standards followed by PMI, ISO 21500 and commercial schedulers.

Let me know which slices you’d like drafted next, and I can update the Architecture document or supply example JSON!

[1]: https://projectmanagementacademy.net/resources/blog/schedule-baseline/?utm_source=chatgpt.com "Schedule Baseline in Project Management: Definition and Use"
[2]: https://www.pmi.org/-/media/pmi/documents/public/pdf/certifications/practice-standard-scheduling.pdf?rev=eed9ee4249bf49df8b40fc2c54bb8000&v=c7ca2721-8c26-4e07-ba47-069d0987bc0c&utm_source=chatgpt.com "[PDF] practice standard for scheduling - pmi"
[3]: https://www.iso.org/standard/50003.html?utm_source=chatgpt.com "ISO 21500:2012 - Guidance on project management"
[4]: https://tensix.com/iso-21500-standards-for-project-management/?utm_source=chatgpt.com "ISO 21500 Standards for Project Management - Ten Six Consulting"
[5]: https://learn.microsoft.com/en-us/office-project/xml-data-interchange/xml-schema-for-the-tasks-element?view=project-client-2016&utm_source=chatgpt.com "XML Schema for the Tasks Element - Learn Microsoft"
[6]: https://www.planacademy.com/understanding-primavera-xer-files/?utm_source=chatgpt.com "Understanding Primavera XER Files - Plan Academy"
[7]: https://learn.microsoft.com/en-us/office-project/xml-data-interchange/xml-schema-for-the-project-element?view=project-client-2016&utm_source=chatgpt.com "XML Schema for the Project Element - Learn Microsoft"
[8]: https://watech.wa.gov/sites/default/files/2023-11/15.%2520Deliverables%2520Register.xlsx?utm_source=chatgpt.com "[XLS] Deliverables Register"
[9]: https://ppm.express/blog/project-deliverables/?utm_source=chatgpt.com "What Are Project Deliverables (with Examples and Templates)"
[10]: https://www.openproject.org/docs/api/endpoints/schemas/?utm_source=chatgpt.com "API: Schemas - OpenProject"
[11]: https://www.openproject.org/docs/development/concepts/resource-schemas/?utm_source=chatgpt.com "Resource schemas - OpenProject"
[12]: https://help.asana.com/s/article/project-importing-and-exporting?utm_source=chatgpt.com "Project importing and exporting - Asana Help Center"
[13]: https://forum.asana.com/t/export-json-format-including-stories/55398?utm_source=chatgpt.com "Export JSON format including stories - Asana Forum"
[14]: https://www.projectmanagement.com/deliverables/336668/Project-Risk-Register-Template?utm_source=chatgpt.com "Project Risk Register Template - ProjectManagement.com"
[15]: https://www.projectmanager.com/templates/risk-tracking-template?utm_source=chatgpt.com "Risk Register Template for Excel (Free Download) - ProjectManager"
[16]: https://help.deltek.com/product/acumentouchstone/8.2/ga/Primavera%20P6%20XER%20Calculated%20Fields.html?utm_source=chatgpt.com "Primavera P6 (XER) Calculated Fields - Deltek Software Manager"
