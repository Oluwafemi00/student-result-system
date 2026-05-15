// ============================================================
//  GRADEX PRO — Student Result Management System
//  script.js
// ============================================================

// ─── STATE ───────────────────────────────────────────────────
let gradeRules = JSON.parse(localStorage.getItem("gradexRules")) || [
  { id: 1, min: 90, max: 100, grade: "A" },
  { id: 2, min: 80, max: 89, grade: "B" },
  { id: 3, min: 70, max: 79, grade: "C" },
  { id: 4, min: 60, max: 69, grade: "D" },
  { id: 5, min: 0, max: 59, grade: "F" },
];

let students = JSON.parse(localStorage.getItem("gradexStudents")) || [];

let sortColumn = null;
let sortAscending = true;

// ─── PERSIST ─────────────────────────────────────────────────
function saveRules() {
  localStorage.setItem("gradexRules", JSON.stringify(gradeRules));
}
function saveStudents() {
  localStorage.setItem("gradexStudents", JSON.stringify(students));
}

// ─── DOM REFS ────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

const minScoreInput = $("minScore");
const maxScoreInput = $("maxScore");
const gradeLetterInput = $("gradeLetter");
const addRuleBtn = $("addRuleBtn");
const ruleListEl = $("ruleList");

const studentNameInput = $("studentName");
const studentScoreInput = $("studentScore");
const scorePreviewEl = $("scorePreview");
const addStudentBtn = $("addStudentBtn");

const searchInput = $("searchInput");
const tableBody = $("tableBody");
const avgScoreEl = $("avgScore");
const highScoreEl = $("highScore");
const lowScoreEl = $("lowScore");
const totalStudentsEl = $("totalStudents");
const passRateEl = $("passRate");
const studentBadgeEl = $("student-count-badge");
const distBarsEl = $("distBars");

const exportCsvBtn = $("exportCsvBtn");
const clearAllBtn = $("clearAllBtn");

const toastEl = $("toast");
const modalOverlay = $("modalOverlay");
const modalMsg = $("modalMsg");
const modalConfirmBtn = $("modalConfirm");
const modalCancelBtn = $("modalCancel");

// ─── TOAST ───────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = "") {
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.className = "toast" + (type ? " " + type : "") + " show";
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2800);
}

// ─── CONFIRM MODAL ───────────────────────────────────────────
function showConfirm(message, onConfirm) {
  modalMsg.textContent = message;
  modalOverlay.classList.add("show");

  const cleanup = () => modalOverlay.classList.remove("show");

  modalConfirmBtn.onclick = () => {
    cleanup();
    onConfirm();
  };
  modalCancelBtn.onclick = cleanup;
}

// ─── GRADE HELPERS ───────────────────────────────────────────
function getGradeFromScore(score) {
  const sorted = [...gradeRules].sort((a, b) => b.max - a.max);
  for (const rule of sorted) {
    if (score >= rule.min && score <= rule.max) return rule.grade;
  }
  return "N/A";
}

function getGradeClass(grade) {
  const map = {
    A: "grade-A",
    B: "grade-B",
    C: "grade-C",
    D: "grade-D",
    F: "grade-F",
  };
  return map[grade] || "grade-NA";
}

function getPerformanceColor(score) {
  if (score >= 90) return "#4DB87A";
  if (score >= 75) return "#5B8FD4";
  if (score >= 60) return "#C9A84C";
  if (score >= 45) return "#C8963C";
  return "#D45C5C";
}

// ─── RENDER RULES ────────────────────────────────────────────
function renderRules() {
  ruleListEl.innerHTML = "";

  if (gradeRules.length === 0) {
    ruleListEl.innerHTML =
      '<li class="rule-empty">No grade rules defined.</li>';
    return;
  }

  const sorted = [...gradeRules].sort((a, b) => b.max - a.max);
  sorted.forEach((rule) => {
    const li = document.createElement("li");
    li.className = "rule-item";
    li.innerHTML = `
      <span class="rule-grade">${rule.grade}</span>
      <span class="rule-range"><strong>${rule.min}</strong> – <strong>${rule.max}</strong> pts</span>
      <button class="btn-rule-del" title="Remove rule" data-id="${rule.id}">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;
    ruleListEl.appendChild(li);
  });

  ruleListEl.querySelectorAll(".btn-rule-del").forEach((btn) => {
    btn.addEventListener("click", () => deleteRule(parseInt(btn.dataset.id)));
  });
}

// ─── ADD RULE ────────────────────────────────────────────────
addRuleBtn.addEventListener("click", () => {
  const min = parseFloat(minScoreInput.value);
  const max = parseFloat(maxScoreInput.value);
  const grade = gradeLetterInput.value.trim().toUpperCase();

  if (isNaN(min) || isNaN(max) || !grade) {
    showToast("Fill in min, max and grade letter.", "error");
    return;
  }
  if (min > max) {
    showToast("Min score cannot exceed max score.", "error");
    return;
  }
  if (min < 0 || max > 100) {
    showToast("Scores must be between 0 and 100.", "error");
    return;
  }

  // Check for overlap
  const overlaps = gradeRules.some(
    (r) => min <= r.max && max >= r.min && r.grade !== grade,
  );
  if (overlaps) {
    showToast("Score range overlaps an existing rule.", "error");
    return;
  }

  gradeRules.push({ id: Date.now(), min, max, grade });
  saveRules();

  minScoreInput.value = "";
  maxScoreInput.value = "";
  gradeLetterInput.value = "";

  renderRules();
  recalculateAllGrades();
  showToast("Grade rule added.", "success");
});

// ─── DELETE RULE ─────────────────────────────────────────────
function deleteRule(id) {
  gradeRules = gradeRules.filter((r) => r.id !== id);
  saveRules();
  renderRules();
  recalculateAllGrades();
  showToast("Rule removed.");
}

// ─── SCORE LIVE PREVIEW ──────────────────────────────────────
studentScoreInput.addEventListener("input", () => {
  const val = parseFloat(studentScoreInput.value);
  if (!isNaN(val) && val >= 0 && val <= 100) {
    scorePreviewEl.textContent = getGradeFromScore(val);
  } else {
    scorePreviewEl.textContent = "—";
  }
});

// ─── ADD STUDENT ─────────────────────────────────────────────
addStudentBtn.addEventListener("click", addStudent);
studentNameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addStudent();
});
studentScoreInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addStudent();
});

function addStudent() {
  const name = studentNameInput.value.trim();
  const score = parseFloat(studentScoreInput.value);

  if (!name) {
    showToast("Please enter a student name.", "error");
    return;
  }
  if (isNaN(score)) {
    showToast("Please enter a valid score.", "error");
    return;
  }
  if (score < 0 || score > 100) {
    showToast("Score must be between 0 and 100.", "error");
    return;
  }

  const isDuplicate = students.some(
    (s) => s.name.toLowerCase() === name.toLowerCase(),
  );
  if (isDuplicate) {
    showToast(`"${name}" already exists in the system.`, "error");
    return;
  }

  const grade = getGradeFromScore(score);
  students.push({ id: Date.now(), name, score, grade });
  saveStudents();

  studentNameInput.value = "";
  studentScoreInput.value = "";
  scorePreviewEl.textContent = "—";
  studentNameInput.focus();

  renderStudents();
  showToast(`${name} added successfully.`, "success");
}

// ─── DELETE STUDENT ──────────────────────────────────────────
function deleteStudent(id) {
  showConfirm("Delete this student's record? This cannot be undone.", () => {
    students = students.filter((s) => s.id !== id);
    saveStudents();
    renderStudents();
    showToast("Student removed.");
  });
}

// ─── RECALCULATE GRADES ──────────────────────────────────────
function recalculateAllGrades() {
  students.forEach((s) => {
    s.grade = getGradeFromScore(s.score);
  });
  saveStudents();
  renderStudents();
}

// ─── SORT ────────────────────────────────────────────────────
$("sortName").addEventListener("click", () => applySort("name"));
$("sortScore").addEventListener("click", () => applySort("score"));

function applySort(col) {
  if (sortColumn === col) {
    sortAscending = !sortAscending;
  } else {
    sortColumn = col;
    sortAscending = true;
  }

  // Reset arrows
  ["name", "score"].forEach((c) => {
    const el = $("arrow-" + c);
    el.className = "sort-arrow";
    el.textContent = "↕";
  });

  const arrow = $("arrow-" + col);
  arrow.className = "sort-arrow " + (sortAscending ? "asc" : "desc");
  arrow.textContent = "";

  renderStudents();
}

function getSortedStudents(list) {
  if (!sortColumn) return list;
  return [...list].sort((a, b) => {
    let va = a[sortColumn],
      vb = b[sortColumn];
    if (typeof va === "string") {
      va = va.toLowerCase();
      vb = vb.toLowerCase();
      return sortAscending ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    return sortAscending ? va - vb : vb - va;
  });
}

// ─── RENDER STUDENTS ─────────────────────────────────────────
searchInput.addEventListener("input", renderStudents);

function renderStudents() {
  tableBody.innerHTML = "";

  const term = searchInput.value.trim().toLowerCase();
  const filtered = students.filter((s) => s.name.toLowerCase().includes(term));
  const sorted = getSortedStudents(filtered);

  if (sorted.length === 0) {
    const tr = document.createElement("tr");
    tr.className = "empty-row";
    tr.innerHTML = `<td colspan="6">
      <span class="empty-icon">${students.length === 0 ? "📋" : "🔍"}</span>
      ${
        students.length === 0
          ? "No students added yet. Use the form above to get started."
          : "No students match your search."
      }
    </td>`;
    tableBody.appendChild(tr);
  } else {
    sorted.forEach((student, idx) => {
      const tr = document.createElement("tr");
      const gradeClass = getGradeClass(student.grade);
      const perfColor = getPerformanceColor(student.score);

      tr.innerHTML = `
        <td class="td-num">${idx + 1}</td>
        <td class="td-name">${escapeHtml(student.name)}</td>
        <td class="td-score">${student.score}</td>
        <td><span class="grade-chip ${gradeClass}">${student.grade}</span></td>
        <td>
          <div class="perf-wrap">
            <div class="perf-track">
              <div class="perf-fill" style="width:${student.score}%;background:${perfColor}"></div>
            </div>
            <span class="perf-num">${student.score}%</span>
          </div>
        </td>
        <td>
          <button class="btn-del-row" title="Delete student" data-id="${student.id}">
            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    tableBody.querySelectorAll(".btn-del-row").forEach((btn) => {
      btn.addEventListener("click", () =>
        deleteStudent(parseInt(btn.dataset.id)),
      );
    });
  }

  updateAnalytics();
  updateDistribution();
  updateBadge();
}

// ─── ANALYTICS ───────────────────────────────────────────────
function updateAnalytics() {
  if (students.length === 0) {
    avgScoreEl.textContent = "—";
    highScoreEl.textContent = "—";
    lowScoreEl.textContent = "—";
    totalStudentsEl.textContent = "0";
    passRateEl.textContent = "—";
    return;
  }

  const scores = students.map((s) => s.score);
  const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);
  const passing = students.filter((s) => s.score >= 60).length;
  const rate = ((passing / students.length) * 100).toFixed(0) + "%";

  avgScoreEl.textContent = avg;
  highScoreEl.textContent = highest;
  lowScoreEl.textContent = lowest;
  totalStudentsEl.textContent = students.length;
  passRateEl.textContent = rate;
}

// ─── DISTRIBUTION ────────────────────────────────────────────
function updateDistribution() {
  if (students.length === 0) {
    distBarsEl.innerHTML =
      '<p class="dist-empty">Add students to see distribution</p>';
    return;
  }

  // Build grade tally
  const tally = {};
  const sorted = [...gradeRules].sort((a, b) => b.max - a.max);
  sorted.forEach((r) => {
    tally[r.grade] = 0;
  });
  students.forEach((s) => {
    if (tally[s.grade] !== undefined) tally[s.grade]++;
    else tally[s.grade] = (tally[s.grade] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(tally), 1);
  distBarsEl.innerHTML = "";

  Object.entries(tally).forEach(([grade, count]) => {
    const pct = Math.round((count / maxCount) * 100);
    const div = document.createElement("div");
    div.className = "dist-row";
    div.innerHTML = `
      <span class="dist-grade-label">${grade}</span>
      <div class="dist-track">
        <div class="dist-fill" style="width:${pct}%"></div>
      </div>
      <span class="dist-count">${count}</span>
    `;
    distBarsEl.appendChild(div);
  });
}

// ─── BADGE ───────────────────────────────────────────────────
function updateBadge() {
  const n = students.length;
  studentBadgeEl.textContent = n === 1 ? "1 student" : `${n} students`;
}

// ─── CLEAR ALL ───────────────────────────────────────────────
clearAllBtn.addEventListener("click", () => {
  if (students.length === 0) {
    showToast("Nothing to clear.", "error");
    return;
  }
  showConfirm(
    `Permanently delete all ${students.length} student records? This cannot be undone.`,
    () => {
      students = [];
      saveStudents();
      renderStudents();
      showToast("All records cleared.");
    },
  );
});

// ─── EXPORT CSV ──────────────────────────────────────────────
exportCsvBtn.addEventListener("click", () => {
  if (students.length === 0) {
    showToast("No data to export.", "error");
    return;
  }

  const sorted = [...students].sort((a, b) => b.score - a.score);
  let csv = "Rank,Name,Score,Grade\n";
  sorted.forEach((s, i) => {
    csv += `${i + 1},"${s.name}",${s.score},${s.grade}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), {
    href: url,
    download: `gradex_results_${new Date().toLocaleDateString("en-GB").replace(/\//g, "-")}.csv`,
  });
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast("CSV exported successfully.", "success");
});

// ─── UTILITY ─────────────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── KEYBOARD SHORTCUTS ──────────────────────────────────────
document.addEventListener("keydown", (e) => {
  // Escape closes modal
  if (e.key === "Escape" && modalOverlay.classList.contains("show")) {
    modalOverlay.classList.remove("show");
  }
  // Ctrl/Cmd + E exports
  if ((e.ctrlKey || e.metaKey) && e.key === "e") {
    e.preventDefault();
    exportCsvBtn.click();
  }
  // Focus search on "/"
  if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
    e.preventDefault();
    searchInput.focus();
  }
});

// ─── INIT ────────────────────────────────────────────────────
renderRules();
renderStudents();
