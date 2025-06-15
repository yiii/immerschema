Here’s a self-contained JavaScript example that:

Imports your enum_dept and enum_role definitions

Walks through project.shots[].tasks[]

Sums up hoursPlanned (or hoursActual if you prefer) by dept and role

Calculates totalPlanned, applies a bufferPct, and stamps generatedFromTasksAt

js
Copy
Edit
// File: generateWorkload.js

// 1️⃣ Load your enums (adjust paths as needed)
const { enum: enum_dept } = require('./enum/dept.enum.json');
const { enum: enum_role } = require('./enum/role.enum.json');

/**
 * Given a project object, mutates project.workloadBreakdown
 * following the schema with deptHours, roleHours, totals, and buffer.
 *
 * @param {Object} project 
 * @param {Object}   project.shots    – array of shot objects
 * @param {number}  [defaultBuffer=20] – fallback % if none on project
 */
function generateWorkloadSnapshot(project, defaultBuffer = 20) {
  const deptHours = {};
  const roleHours = {};

  // initialize every dept to 0
  enum_dept.forEach(d => { deptHours[d] = 0; });
  // initialize every role to 0
  enum_role.forEach(r => { roleHours[r] = 0; });

  for (const shot of project.shots || []) {
    for (const task of shot.tasks || []) {
      const h = (task.hoursPlanned != null ? task.hoursPlanned : task.hoursActual) || 0;

      // 2️⃣ Dept sum
      if (deptHours.hasOwnProperty(task.dept)) {
        deptHours[task.dept] += h;
      } else {
        console.warn(`Unknown dept "${task.dept}", skipping…`);
      }

      // 3️⃣ Role sum (if assignedTo matches a known role token)
      if (enum_role.includes(task.assignedTo)) {
        roleHours[task.assignedTo] += h;
      }
    }
  }

  // 4️⃣ Totals
  const totalPlanned = Object.values(deptHours).reduce((a, b) => a + b, 0);
  const bufferPct   = project.workloadBreakdown?.bufferPct ?? defaultBuffer;
  const totalWithBuffer = totalPlanned * (1 + bufferPct / 100);

  // 5️⃣ Stamp the snapshot
  project.workloadBreakdown = {
    generatedFromTasksAt: new Date().toISOString(),
    deptHours,
    roleHours,
    totalPlanned,
    bufferPct,
    totalWithBuffer
  };

  return project.workloadBreakdown;
}

// — Example usage —
if (require.main === module) {
  // mock project
  const project = {
    shots: [
      {
        tasks: [
          { id: 'T1', dept: 'CG', assignedTo: 'ArtLead', hoursPlanned: 10 },
          { id: 'T2', dept: 'FX', assignedTo: 'HoudiniArtist', hoursPlanned:  8 },
          { id: 'T3', dept: 'CG', assignedTo: 'ArtLead', hoursPlanned:  5 }
        ]
      },
      {
        tasks: [
          { id: 'T4', dept: 'CG', assignedTo: 'MotionDesigner', hoursPlanned: 12 },
          { id: 'T5', dept: 'EDIT', assignedTo: 'PostLead', hoursPlanned:  4 }
        ]
      }
    ],
    workloadBreakdown: { bufferPct: 15 }  // existing buffer?
  };

  const snapshot = generateWorkloadSnapshot(project);
  console.log(JSON.stringify(snapshot, null, 2));
}

module.exports = generateWorkloadSnapshot;
What this does

Imports your enums to seed and validate keys

Warns on any unknown dept

Accumulates hours into deptHours and roleHours

Calculates totalPlanned, retrieves or defaults bufferPct, and computes totalWithBuffer

Stamps generatedFromTasksAt with the current ISO timestamp

Plug this into your build or CI pipeline to keep workloadBreakdown perfectly in sync with your tasks[].