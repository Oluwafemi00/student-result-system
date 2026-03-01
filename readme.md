# 🎓 Student Result Management System

A robust, responsive web application for teachers and administrators to easily input, track, and analyze student scores. Built entirely from scratch using Vanilla JavaScript, HTML5, and modern CSS.

## Live Demo

[View the Live Application Here](https://oluwafemi00.github.io/student-result-system/)

## Key Features

- **Dynamic Grading System:** Set custom score ranges (e.g., 90-100 = A) that automatically calculate grades as student data is entered.
- **Persistent Data Storage:** Uses browser `localStorage` to save all grade rules and student records. Your data remains perfectly intact even if you refresh or close the browser.
- **Real-Time Analytics Dashboard:** Automatically calculates and displays the Class Average, Highest Score, and Lowest Score.
- **Live Search & Filter:** Instantly find specific students in a large class using the responsive search bar.
- **Bidirectional Sorting:** Click column headers (Name, Score, Grade) to organize the table alphabetically or numerically (A-Z or Z-A).
- **CSV Data Export:** Download the entire student table as a `.csv` file with one click to open in Excel or Google Sheets.
- **Strict Data Validation:** Prevents duplicate student names, blank entries, and unrealistic scores (e.g., negative numbers or numbers over 100).
- **Smart UI/UX:** Features empty state messaging, hover effects, responsive grid layouts, and safety confirmation prompts before deleting data.

## Technologies Used

- **HTML5:** Semantic structure and accessibility.
- **CSS3:** Custom variables, flexbox/grid layouts, responsive media queries, and modern UI styling.
- **Vanilla JavaScript:** DOM manipulation, array methods (`.filter()`, `.map()`, `.reduce()`), object state management, and the Blob API for file exporting. No external libraries or frameworks were used.

## How to Run Locally

Since this project uses no build tools or frameworks, running it locally is incredibly simple:

1. Clone the repository: `git clone https://github.com/oluwafemi00/student-result-system.git`
2. Navigate to the project folder.
3. Open `index.html` directly in any modern web browser.

## Contributing

Contributions, issues, and feature requests are welcome!
