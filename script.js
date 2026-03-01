// --- STATE INITIALIZATION WITH LOCAL STORAGE ---

let gradeRules = JSON.parse(localStorage.getItem("studentMgmtRules")) || [
  { id: 1, min: 90, max: 100, grade: "A" },
  { id: 2, min: 80, max: 89, grade: "B" },
  { id: 3, min: 70, max: 79, grade: "C" },
  { id: 4, min: 60, max: 69, grade: "D" },
  { id: 5, min: 0, max: 59, grade: "F" },
];

let students = JSON.parse(localStorage.getItem("studentMgmtData")) || [];

// --- LOCAL STORAGE HELPERS ---

function saveRules() {
  localStorage.setItem("studentMgmtRules", JSON.stringify(gradeRules));
}

function saveStudents() {
  localStorage.setItem("studentMgmtData", JSON.stringify(students));
}

// --- DOM ELEMENTS ---

const minScoreInput = document.getElementById("minScore");
const maxScoreInput = document.getElementById("maxScore");
const gradeLetterInput = document.getElementById("gradeLetter");
const addRuleBtn = document.getElementById("addRuleBtn");
const ruleList = document.getElementById("ruleList");

const studentNameInput = document.getElementById("studentName");
const studentScoreInput = document.getElementById("studentScore");
const addStudentBtn = document.getElementById("addStudentBtn");
const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("searchInput");
const avgScoreEl = document.getElementById("avgScore");
const highScoreEl = document.getElementById("highScore");
const lowScoreEl = document.getElementById("lowScore");

// --- GRADE RULE LOGIC ---

// Render Grade Rules
function renderRules() {
  ruleList.innerHTML = "";
  const sortedRules = [...gradeRules].sort((a, b) => b.max - a.max);

  sortedRules.forEach((rule) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <span>Score: <strong>${rule.min} - ${rule.max}</strong> &rarr; Grade: <strong>${rule.grade}</strong></span>
            <button class="btn-danger" onclick="deleteRule(${rule.id})">Remove</button>
        `;
    ruleList.appendChild(li);
  });
}

// Add New Rule
addRuleBtn.addEventListener("click", () => {
  const min = parseFloat(minScoreInput.value);
  const max = parseFloat(maxScoreInput.value);
  const grade = gradeLetterInput.value.trim().toUpperCase();

  if (isNaN(min) || isNaN(max) || !grade) {
    alert("Please fill in Min Score, Max Score, and Grade Letter.");
    return;
  }

  if (min > max) {
    alert("Min score cannot be greater than Max score.");
    return;
  }

  const newRule = {
    id: Date.now(),
    min: min,
    max: max,
    grade: grade,
  };

  gradeRules.push(newRule);
  saveRules(); // Save to local storage

  minScoreInput.value = "";
  maxScoreInput.value = "";
  gradeLetterInput.value = "";

  renderRules();
  recalculateAllGrades();
});

// Delete Rule
function deleteRule(id) {
  gradeRules = gradeRules.filter((rule) => rule.id !== id);
  saveRules(); // Save to local storage
  renderRules();
  recalculateAllGrades();
}

// Calculate Grade based on current rules
function getGradeFromScore(score) {
  const sortedRules = [...gradeRules].sort((a, b) => b.max - a.max);

  for (let rule of sortedRules) {
    if (score >= rule.min && score <= rule.max) {
      return rule.grade;
    }
  }
  return "N/A (Out of Range)";
}

// --- STUDENT DATA LOGIC ---

// Render Student Table (UPDATED WITH EMPTY STATE)
function renderStudents() {
  tableBody.innerHTML = "";

  const searchTerm = searchInput.value.trim().toLowerCase();

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm),
  );

  // --- NEW: EMPTY STATE LOGIC ---
  if (filteredStudents.length === 0) {
    const tr = document.createElement("tr");

    // Determine which message to show based on whether the main array is empty or just the search results
    const message =
      students.length === 0
        ? "📝 No students added yet. Use the form above to add your first student!"
        : "🔍 No matching students found.";

    // colspan="4" makes this single cell stretch across all 4 columns of our table
    tr.innerHTML = `<td colspan="4" class="empty-state">${message}</td>`;
    tableBody.appendChild(tr);
  } else {
    // --- EXISTING RENDER LOGIC ---
    filteredStudents.forEach((student) => {
      const originalIndex = students.indexOf(student);

      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${student.name}</td>
                <td>${student.score}</td>
                <td><strong>${student.grade}</strong></td>
                <td><button class="btn-danger" onclick="deleteStudent(${originalIndex})">Delete</button></td>
            `;
      tableBody.appendChild(tr);
    });
  }

  // Call the analytics update every time the table is drawn
  updateAnalytics();
}

// Trigger re-render every time the user types in the search box
searchInput.addEventListener("input", renderStudents);

// Add New Student (WITH STRICT VALIDATION)
addStudentBtn.addEventListener("click", () => {
  // .trim() removes accidental spaces before or after the name
  const name = studentNameInput.value.trim();
  const score = parseFloat(studentScoreInput.value);

  // 1. Check for empty inputs
  if (!name) {
    alert("Error: Please enter a student name.");
    return;
  }

  if (isNaN(score)) {
    alert("Error: Please enter a valid score.");
    return;
  }

  // 2. Check for realistic score range
  if (score < 0 || score > 100) {
    alert("Error: Score must be between 0 and 100.");
    return;
  }

  // 3. Check for duplicate names (Case-insensitive)
  // .some() checks if any student in the array matches the condition
  const isDuplicate = students.some(
    (student) => student.name.toLowerCase() === name.toLowerCase(),
  );

  if (isDuplicate) {
    alert(`Error: A student named "${name}" already exists in the system.`);
    return;
  }

  // If all validations pass, calculate the grade and save
  const grade = getGradeFromScore(score);

  students.push({
    name: name,
    score: score,
    grade: grade,
  });

  saveStudents(); // Save to local storage

  // Clear inputs and set focus back to the name field for fast data entry
  studentNameInput.value = "";
  studentScoreInput.value = "";
  studentNameInput.focus();

  renderStudents();
});

// Delete Student
function deleteStudent(index) {
  students.splice(index, 1);
  saveStudents(); // Save to local storage
  renderStudents();
}

// Recalculate grades if rules change
function recalculateAllGrades() {
  students.forEach((student) => {
    student.grade = getGradeFromScore(student.score);
  });
  saveStudents(); // Save updated grades to local storage
  renderStudents();
}

// --- CLEAR ALL LOGIC ---

const clearAllBtn = document.getElementById("clearAllBtn");

clearAllBtn.addEventListener("click", () => {
  // Check if there are actually students to delete
  if (students.length === 0) {
    alert("The table is already empty.");
    return;
  }

  // Ask for confirmation before wiping data
  const confirmClear = confirm(
    "Are you sure you want to delete ALL student results? This cannot be undone.",
  );

  if (confirmClear) {
    students = []; // Empty the array
    saveStudents(); // Update local storage with the empty array
    renderStudents(); // Re-render the empty table
  }
});

// --- EXPORT TO CSV LOGIC ---

const exportCsvBtn = document.getElementById("exportCsvBtn");

exportCsvBtn.addEventListener("click", () => {
  // 1. Check if there is data to export
  if (students.length === 0) {
    alert("There is no student data to export.");
    return;
  }

  // 2. Create the CSV content
  // Start with the column headers
  let csvContent = "Name,Score,Grade\n";

  // Loop through students and add their data as rows
  students.forEach((student) => {
    // Use quotes around the name in case they have a comma in their name
    csvContent += `"${student.name}",${student.score},${student.grade}\n`;
  });

  // 3. Create a Blob (Binary Large Object) to hold the file data
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // 4. Create a temporary hidden link to trigger the download
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", "student_results.csv"); // Set the default filename
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click(); // Simulate a click to download
  document.body.removeChild(link); // Clean up the temporary link
});

// --- SORTING LOGIC ---

// State variables for sorting
let currentSortColumn = null;
let isAscending = true;

function sortTableData(column) {
  // If clicking the same column, toggle the direction. Otherwise, default to Ascending.
  if (currentSortColumn === column) {
    isAscending = !isAscending;
  } else {
    currentSortColumn = column;
    isAscending = true;
  }

  // Sort the main students array
  students.sort((a, b) => {
    let valueA = a[column];
    let valueB = b[column];

    // If we are sorting text (Name or Grade), convert to lowercase for accurate comparison
    if (typeof valueA === "string") {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();

      if (valueA < valueB) return isAscending ? -1 : 1;
      if (valueA > valueB) return isAscending ? 1 : -1;
      return 0;
    } else {
      // If we are sorting numbers (Score), use simple subtraction
      return isAscending ? valueA - valueB : valueB - valueA;
    }
  });

  saveStudents(); // Save the new sorted order to local storage
  renderStudents(); // Redraw the table with the new order
}

// Attach event listeners to the headers
document
  .getElementById("sortName")
  .addEventListener("click", () => sortTableData("name"));
document
  .getElementById("sortScore")
  .addEventListener("click", () => sortTableData("score"));
document
  .getElementById("sortGrade")
  .addEventListener("click", () => sortTableData("grade"));

// --- ANALYTICS LOGIC (UPDATED & BULLETPROOF) ---
function updateAnalytics() {
  // 1. If the table is empty, reset stats to 0
  if (students.length === 0) {
    avgScoreEl.textContent = "0";
    highScoreEl.textContent = "0";
    lowScoreEl.textContent = "0";
    return;
  }

  // 2. Extract just the scores into a simple array (e.g.,)
  const scores = students.map((student) => student.score);

  // 3. Use built-in Math functions to instantly find the highest and lowest
  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);

  // 4. Calculate average using .reduce() (adds all numbers in the array together)
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const average = (totalScore / students.length).toFixed(1);

  // 5. Update the DOM
  avgScoreEl.textContent = average;
  highScoreEl.textContent = highest;
  lowScoreEl.textContent = lowest;
}
// Initial Render on Page Load
renderRules();
renderStudents();
