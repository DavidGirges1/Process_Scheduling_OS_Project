# 🧠 OS CPU Scheduling Simulator

A clean, browser-based operating systems simulator for comparing **Round Robin Scheduling** and **Preemptive Priority Scheduling**. The app lets users add custom processes, load ready-made test scenarios, run both algorithms, and compare their results using Gantt charts and performance tables.

> Built as an educational project to visualize how different CPU scheduling strategies affect process execution, waiting time, turnaround time, and overall fairness.

---

## ✨ Features

- ➕ Add custom processes with:
  - Process ID
  - Arrival Time
  - Burst Time
  - Priority
- 🔁 Simulate **Round Robin Scheduling** with a configurable time quantum
- 🚦 Simulate **Preemptive Priority Scheduling**
- ⚙️ Choose the priority rule:
  - Lower number = higher priority
  - Higher number = higher priority
- 📊 View Gantt charts for both scheduling algorithms
- 📋 Compare scheduling results in tables
- 🧪 Load built-in test scenarios:
  - **A: General**
  - **B: Urgency / Priority-focused**
  - **C: Fairness / Round Robin-focused**
  - **D: Starvation case**
  - **E: Validation case**
- 🎨 Responsive Bootstrap-based UI
- 🔔 User-friendly alerts powered by SweetAlert2

---

## 🖥️ Demo Preview

Add a screenshot here after uploading one to your repository:

```md
![CPU Scheduling Simulator Screenshot](./screenshots/demo.png)
```

---

## 🛠️ Tech Stack

- **HTML5**
- **CSS3**
- **JavaScript**
- **Bootstrap 5**
- **Bootstrap Icons**
- **Google Fonts: Inter**
- **SweetAlert2**

---

## 📁 Project Structure

 web-app
   index.html
   script.js

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/cpu-scheduling-simulator.git
```

### 2. Open the project folder

```bash
cd cpu-scheduling-simulator
```

### 3. Run the app

Because this is a static front-end project, you can open it directly in your browser:

```bash
open index.html
```

Or simply double-click `index.html`.

For a local development server, you can also use VS Code’s **Live Server** extension.

---

## 📌 How to Use

1. Enter the **Time Quantum** for Round Robin scheduling.
2. Select the **Priority Rule**.
3. Add processes manually by filling in:
   - Process ID
   - Arrival Time
   - Burst Time
   - Priority
4. Or click one of the built-in scenario buttons.
5. Click **Run Simulation & Compare**.
6. Review:
   - Round Robin Gantt chart
   - Priority Scheduling Gantt chart
   - Result tables
   - Comparison summary

---

## 🧮 Scheduling Algorithms

### Round Robin Scheduling

Round Robin gives each process a fixed time slice called a **time quantum**. If a process does not finish during its time slice, it returns to the ready queue and waits for its next turn.

Best for:

- Fair CPU sharing
- Time-sharing systems
- Preventing one process from dominating the CPU

### Preemptive Priority Scheduling

Preemptive Priority Scheduling always runs the process with the highest priority among the arrived processes. If a new process arrives with a higher priority, it can interrupt the currently running process.

Best for:

- Urgent tasks
- Priority-based workloads
- Systems where important processes must run first

---

## 📊 Output Metrics

The simulator is designed to help compare algorithms using common CPU scheduling metrics such as:

- Completion Time
- Turnaround Time
- Waiting Time
- Average Waiting Time
- Average Turnaround Time
- Execution order through Gantt charts

---

## 🧪 Test Scenarios

The project includes five scenario buttons to quickly test different scheduling behaviors:

| Scenario | Purpose |
|---|---|
| A: General | Basic mixed workload |
| B: Urgency | Shows how priority scheduling handles urgent processes |
| C: Fairness | Highlights Round Robin fairness |
| D: Starvation | Demonstrates possible starvation in priority scheduling |
| E: Validation | Helps verify algorithm correctness |

---

## 👥 Contributors

- David Elks
- Mostafa Sobhy
- Menna
- Asmaa
- Shama
- Marwan

---

## 💡 Future Improvements

- Add export options for simulation results
- Add dark mode
- Add more scheduling algorithms such as FCFS, SJF, and SRTF
- Add animations for process execution
- Add downloadable reports
- Add automated test cases for scheduling logic

---

## 📄 License

This project is for educational purposes. You can add a license such as MIT if you want others to freely use and modify it.

Example:

```text
MIT License
```

---

## ⭐ Acknowledgment

This project was created as part of an Operating Systems learning exercise to make CPU scheduling concepts easier to understand through visualization.
