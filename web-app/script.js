let processes = [];
let pidToColorMap = {};
let colorCounter = 0;

function showError(message) {
  Swal.fire({
    icon: "error",
    title: "Invalid input",
    text: message,
    confirmButtonColor: "#3085d6",
    confirmButtonText: "OK",
  });
}

// ==========================================
// 0. SCENARIO LOADER
// ==========================================
function loadScenario(type) {
  processes = [];
  document.getElementById("quantum").value = 2;
  document.getElementById("priorityRule").value = "lower";

  if (type === "A") {
    // General test
    processes = [
      { pid: "P1", arrival: 0, burst: 4, priority: 2 },
      { pid: "P2", arrival: 1, burst: 3, priority: 1 },
      { pid: "P3", arrival: 2, burst: 2, priority: 3 },
    ];
  } else if (type === "B") {
    // Urgency (Priority wins)
    processes = [
      { pid: "Heavy", arrival: 0, burst: 10, priority: 5 },
      { pid: "Urgent1", arrival: 2, burst: 2, priority: 1 },
      { pid: "Urgent2", arrival: 3, burst: 2, priority: 2 },
    ];
  } else if (type === "C") {
    // Fairness (RR wins)
    processes = [
      { pid: "P1", arrival: 0, burst: 10, priority: 2 },
      { pid: "P2", arrival: 0, burst: 2, priority: 2 },
      { pid: "P3", arrival: 0, burst: 2, priority: 2 },
    ];
  } else if (type === "D") {
    // Starvation risk
    processes = [
      { pid: "LowPri", arrival: 0, burst: 2, priority: 10 },
      { pid: "High1", arrival: 1, burst: 4, priority: 1 },
      { pid: "High2", arrival: 2, burst: 4, priority: 1 },
      { pid: "High3", arrival: 3, burst: 4, priority: 1 },
    ];
  } else if (type === "E") {
    // Validation case: Populate inputs with bad data to show error handling
    document.getElementById("pid").value = "";
    document.getElementById("arrival").value = "-2";
    document.getElementById("burst").value = "0";
    document.getElementById("priority").value = "1.5";

    Swal.fire({
      icon: "info",
      title: "Scenario E Loaded",
      text: "Click on the + Button",
      confirmButtonColor: "#3085d6",
    });
    return;
  }

  updateTable();
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: `Scenario ${type} Loaded`,
    showConfirmButton: false,
    timer: 1500,
  });
}

// ==========================================
// 1. INPUT HANDLING & VALIDATION
// ==========================================
function addProcess() {
  const pid = document.getElementById("pid").value.trim();
  const arrivalRaw = document.getElementById("arrival").value.trim();
  const burstRaw = document.getElementById("burst").value.trim();
  const priorityRaw = document.getElementById("priority").value.trim();

  if (!pid) return showError("Process ID is required.");
  if (processes.some((p) => p.pid === pid))
    return showError("Duplicate Process ID. Please use a unique ID.");

  if (arrivalRaw === "") return showError("Arrival time is required.");
  const arrival = Number(arrivalRaw);
  if (!Number.isInteger(arrival) || arrival < 0)
    return showError("Arrival time must be a non-negative whole number.");

  if (burstRaw === "") return showError("Burst time is required.");
  const burst = Number(burstRaw);
  if (!Number.isInteger(burst) || burst <= 0)
    return showError("Burst time must be a positive whole number.");

  if (priorityRaw === "") return showError("Priority is required.");
  const priority = Number(priorityRaw);
  if (!Number.isInteger(priority))
    return showError("Priority must be a whole number.");

  processes.push({ pid, arrival, burst, priority });
  updateTable();

  document.getElementById("pid").value = "";
  document.getElementById("arrival").value = "";
  document.getElementById("burst").value = "";
  document.getElementById("priority").value = "";
}

function updateTable() {
  const tbody = document.querySelector("#processTable tbody");
  if (processes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted py-4">No processes added yet. Enter a process above.</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  processes.forEach((p, index) => {
    tbody.innerHTML += `
      <tr>
          <td class="fw-bold">${p.pid}</td>
          <td>${p.arrival}</td>
          <td>${p.burst}</td>
          <td>${p.priority}</td>
          <td>
            <button class="btn btn-sm btn-light text-danger" onclick="removeProcess(${index})"><i class="bi bi-trash3-fill"></i></button>
          </td>
      </tr>`;
  });
}

function removeProcess(index) {
  processes.splice(index, 1);
  updateTable();
}

// ==========================================
// 2. SIMULATION TRIGGER
// ==========================================
function runSimulation() {
  if (processes.length === 0) {
    return Swal.fire({
      icon: "warning",
      title: "Oops...",
      text: "Please add at least one process to simulate.",
      confirmButtonColor: "#3085d6",
    });
  }

  const quantumRaw = document.getElementById("quantum").value.trim();
  const quantum = Number(quantumRaw);
  if (quantumRaw === "" || !Number.isInteger(quantum) || quantum < 1) {
    return showError("Invalid Time Quantum. Must be a whole number >= 1.");
  }

  const priorityRuleVal = document.getElementById("priorityRule").value;
  const isLowerBetter = priorityRuleVal === "lower";

  pidToColorMap = {};
  colorCounter = 0;

  const rrResults = simulateRoundRobin(processes, quantum);
  const priResults = simulatePriority(processes, isLowerBetter);

  const rrMetrics = calculateMetrics(processes, rrResults);
  const priMetrics = calculateMetrics(processes, priResults);

  document.getElementById("results").style.display = "block";
  renderGantt(rrResults.timeline, "rrGantt");
  renderTable(rrMetrics, "rrTableContainer");

  renderGantt(priResults.timeline, "priGantt");
  renderTable(priMetrics, "priTableContainer");

  generateConclusion(rrMetrics, priMetrics);

  document.getElementById("results").scrollIntoView({ behavior: "smooth" });
}

// ==========================================
// 3. ROUND ROBIN ALGORITHM
// ==========================================
function simulateRoundRobin(procs, quantum) {
  let n = procs.length;
  let remBurst = procs.map((p) => p.burst);
  let firstStart = new Array(n).fill(-1);
  let completionTime = new Array(n).fill(0);

  let sortedProcs = procs
    .map((p, i) => ({ ...p, id: i }))
    .sort((a, b) => a.arrival - b.arrival);

  let time = 0;
  let completed = 0;
  let queue = [];
  let timeline = [];
  let i = 0;

  while (completed < n) {
    while (i < n && sortedProcs[i].arrival <= time) {
      queue.push(sortedProcs[i].id);
      i++;
    }

    if (queue.length === 0) {
      let nextArrival = sortedProcs[i].arrival;
      timeline.push({ pid: "Idle", start: time, end: nextArrival });
      time = nextArrival;
      continue;
    }

    let currId = queue.shift();
    let p = procs[currId];

    if (firstStart[currId] === -1) firstStart[currId] = time;

    let execTime = Math.min(quantum, remBurst[currId]);
    timeline.push({ pid: p.pid, start: time, end: time + execTime });

    time += execTime;
    remBurst[currId] -= execTime;

    while (i < n && sortedProcs[i].arrival <= time) {
      queue.push(sortedProcs[i].id);
      i++;
    }

    if (remBurst[currId] > 0) {
      queue.push(currId);
    } else {
      completed++;
      completionTime[currId] = time;
    }
  }
  return { timeline: mergeTimeline(timeline), firstStart, completionTime };
}

// ==========================================
// 4. PREEMPTIVE PRIORITY ALGORITHM
// ==========================================
function simulatePriority(procs, isLowerBetter) {
  let n = procs.length;
  let remBurst = procs.map((p) => p.burst);
  let firstStart = new Array(n).fill(-1);
  let completionTime = new Array(n).fill(0);
  let timeline = [];

  let time = 0;
  let completed = 0;
  let prevIdx = -1;
  let currentBlockStart = 0;

  while (completed < n) {
    let bestIdx = -1;
    let bestPriority = isLowerBetter ? Infinity : -Infinity;
    let earliestArrival = Infinity;

    for (let i = 0; i < n; i++) {
      if (procs[i].arrival <= time && remBurst[i] > 0) {
        let betterPri = isLowerBetter
          ? procs[i].priority < bestPriority
          : procs[i].priority > bestPriority;
        let samePri = procs[i].priority === bestPriority;

        if (betterPri || (samePri && procs[i].arrival < earliestArrival)) {
          bestPriority = procs[i].priority;
          earliestArrival = procs[i].arrival;
          bestIdx = i;
        }
      }
    }

    if (bestIdx !== -1) {
      if (firstStart[bestIdx] === -1) firstStart[bestIdx] = time;

      if (bestIdx !== prevIdx) {
        if (prevIdx !== -1) {
          timeline.push({
            pid: prevIdx === -2 ? "Idle" : procs[prevIdx].pid,
            start: currentBlockStart,
            end: time,
          });
        }
        currentBlockStart = time;
        prevIdx = bestIdx;
      }

      remBurst[bestIdx]--;
      time++;

      if (remBurst[bestIdx] === 0) {
        completed++;
        completionTime[bestIdx] = time;
      }
    } else {
      if (prevIdx !== -2) {
        if (prevIdx !== -1)
          timeline.push({
            pid: procs[prevIdx].pid,
            start: currentBlockStart,
            end: time,
          });
        currentBlockStart = time;
        prevIdx = -2;
      }
      time++;
    }
  }

  if (prevIdx !== -1)
    timeline.push({
      pid: prevIdx === -2 ? "Idle" : procs[prevIdx].pid,
      start: currentBlockStart,
      end: time,
    });
  return { timeline: mergeTimeline(timeline), firstStart, completionTime };
}

function mergeTimeline(timeline) {
  if (timeline.length === 0) return [];
  let merged = [timeline[0]];
  for (let i = 1; i < timeline.length; i++) {
    let last = merged[merged.length - 1];
    if (last.pid === timeline[i].pid && last.end === timeline[i].start) {
      last.end = timeline[i].end;
    } else {
      merged.push(timeline[i]);
    }
  }
  return merged;
}

function calculateMetrics(procs, results) {
  let metrics = [];
  let totalWT = 0,
    totalTAT = 0,
    totalRT = 0;

  for (let i = 0; i < procs.length; i++) {
    let p = procs[i];
    let ct = results.completionTime[i];
    let tat = ct - p.arrival;
    let wt = tat - p.burst;
    let rt = results.firstStart[i] - p.arrival;

    totalTAT += tat;
    totalWT += wt;
    totalRT += rt;

    metrics.push({
      pid: p.pid,
      arrival: p.arrival,
      burst: p.burst,
      priority: p.priority,
      ct,
      tat,
      wt,
      rt,
    });
  }

  return {
    processMetrics: metrics,
    avgTAT: parseFloat((totalTAT / procs.length).toFixed(2)),
    avgWT: parseFloat((totalWT / procs.length).toFixed(2)),
    avgRT: parseFloat((totalRT / procs.length).toFixed(2)),
  };
}

// ==========================================
// 7. RENDER UI FUNCTIONS
// ==========================================
function renderGantt(timeline, containerId) {
  let html = `<div class="gantt-container">`;
  let totalTime = timeline[timeline.length - 1]?.end || 1;

  timeline.forEach((block) => {
    let blockClass = "";
    let duration = block.end - block.start;
    let widthPct = (duration / totalTime) * 100;

    if (block.pid === "Idle") {
      blockClass = "idle-color";
    } else {
      let pid = block.pid;
      if (pidToColorMap[pid] === undefined) {
        pidToColorMap[pid] = colorCounter;
        colorCounter = (colorCounter + 1) % 6;
      }
      blockClass = "gantt-bg-" + (pidToColorMap[pid] + 1);
    }

    html += `
      <div class="gantt-block ${blockClass}" style="width: ${widthPct}%;">
          <div class="fw-bold">${block.pid}</div>
      </div>`;
  });
  html += `</div><div class="gantt-ruler">`;

  // Render time ticks underneath the blocks
  timeline.forEach((block) => {
    let leftPct = (block.start / totalTime) * 100;
    html += `<div class="ruler-tick" style="left: ${leftPct}%;">${block.start}</div>`;
  });
  // Add the final end time tick
  html += `<div class="ruler-tick" style="left: 100%; transform: translateX(-100%); border-left: none; border-right: 2px solid #333; padding-right: 4px; padding-left: 0;">${totalTime}</div>`;
  html += `</div>`;

  document.getElementById(containerId).innerHTML = html;
}

function renderTable(data, containerId) {
  let html = `
    <div class="table-responsive border rounded-3 mb-3">
        <table class="table table-borderless table-hover text-center mb-0">
            <thead class="table-light border-bottom">
                <tr>
                    <th>PID</th><th>Arrival</th><th>Burst</th><th>Priority</th>
                    <th>CT</th><th>TAT</th><th>WT</th><th>RT</th>
                </tr>
            </thead>
            <tbody>`;

  data.processMetrics.forEach((m) => {
    html += `<tr>
                <td><strong>${m.pid}</strong></td><td>${m.arrival}</td><td>${m.burst}</td><td>${m.priority}</td>
                <td>${m.ct}</td><td class="text-primary fw-medium">${m.tat}</td><td class="text-danger fw-medium">${m.wt}</td><td class="text-success fw-medium">${m.rt}</td>
            </tr>`;
  });

  html += `</tbody></table></div>
    <div class="d-flex flex-wrap justify-content-around bg-light p-3 rounded-3 border">
        <span class="fs-6"><span class="text-muted me-2">Avg TAT:</span> <strong>${data.avgTAT}</strong></span>
        <span class="fs-6"><span class="text-muted me-2">Avg WT:</span> <strong>${data.avgWT}</strong></span>
        <span class="fs-6"><span class="text-muted me-2">Avg RT:</span> <strong>${data.avgRT}</strong></span>
    </div>`;

  document.getElementById(containerId).innerHTML = html;
}

// ==========================================
// 8. COMPARISON GENERATOR (Now slimmed down)
// ==========================================
function generateConclusion(rr, pri) {
  let html = `
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-header bg-success text-white fw-bold rounded-top">
        <i class="bi bi-table me-2"></i> Comparison Summary
      </div>
      <div class="card-body p-0">
        <table class="table table-bordered text-center mb-0">
          <thead class="table-light">
            <tr><th>Algorithm</th><th>Avg Turnaround (TAT)</th><th>Avg Waiting (WT)</th><th>Avg Response (RT)</th></tr>
          </thead>
          <tbody>
            <tr><td class="fw-bold text-primary">Round Robin</td><td>${rr.avgTAT}</td><td>${rr.avgWT}</td><td>${rr.avgRT}</td></tr>
            <tr><td class="fw-bold text-warning" style="color: #d39e00 !important;">Preemptive Priority</td><td>${pri.avgTAT}</td><td>${pri.avgWT}</td><td>${pri.avgRT}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById("comparisonContainer").innerHTML = html;
}
