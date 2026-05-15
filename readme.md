# Gradex Pro — Student Result Management System 🎓

> A premium academic result management dashboard with configurable grade boundaries, live distribution charts, sortable tables, and CSV export — built with vanilla HTML, CSS, and JS across three clean files.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![localStorage](https://img.shields.io/badge/localStorage-persistence-blue)
![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)

---

## Overview

Gradex Pro is a full-featured result management system for educators and academic administrators. Teachers can define custom grade boundaries, add student scores, and the system automatically assigns grades, tracks class analytics, and visualises grade distribution — all persisted across sessions with no backend.

---

## Features

| Feature                      | Details                                                            |
| ---------------------------- | ------------------------------------------------------------------ |
| **Custom Grade Rules**       | Define any number of score ranges with custom grade letters        |
| **Overlap Detection**        | Adding a rule that conflicts with an existing range shows an error |
| **Live Grade Preview**       | As you type a score, the assigned grade letter appears instantly   |
| **Auto Grade Assignment**    | Grades recalculate for all students when rules change              |
| **Class Analytics**          | Average, highest, lowest score, total students, and pass rate      |
| **Grade Distribution**       | Live horizontal bar chart showing student count per grade          |
| **Sortable Table**           | Sort by name or score ascending/descending with animated arrows    |
| **Search**                   | Filter students by name in real time                               |
| **Performance Bars**         | Each table row has a colour-coded progress bar (green → red)       |
| **Coloured Grade Chips**     | A = green, B = blue, C = gold, D = orange, F = red                 |
| **Export CSV**               | Ranked export with name, score, and grade                          |
| **Custom Confirm Modal**     | Replaces browser `confirm()` for consistent UX                     |
| **localStorage Persistence** | All data survives page reloads                                     |
| **XSS Protection**           | Student names are HTML-escaped before rendering                    |
| **Keyboard Shortcuts**       | `/` focuses search, `Ctrl+E` exports, `Esc` closes modal           |

---

## Technical Highlights

- **Grade overlap detection** — new rules are validated against all existing ranges before being saved
- **Rank in CSV** — export sorts by score descending and prepends a rank column
- **Sort state machine** — `sortColumn` and `sortAscending` are tracked separately; clicking the same column toggles direction, clicking a new column resets to ascending
- **XSS prevention** via `escapeHtml()` helper applied to all user-supplied strings before `innerHTML` insertion
- **Playfair Display + DM Sans** — editorial serif for numbers/headings, geometric sans for UI copy

---

## Project Structure

```
student-results/
├── index.html     ← Semantic markup, all sections and tables
├── style.css      ← Full dark theme design system, responsive layout
└── script.js      ← All logic: grade rules, student CRUD, analytics, sort, export
```

Separated into three files to demonstrate maintainable multi-file project organisation.

---

## Design Decisions

- **Dark navy palette** (`#0E0F14`) with warm gold (`#C9A84C`) — premium academic/institutional aesthetic
- **Frosted glass topbar** with sticky positioning keeps branding visible while scrolling
- **Pass rate stat** — a meaningful metric for educators beyond just average score
- **Distribution bars** update live — teachers get instant feedback as they add students

---

## Run Locally

```bash
# Serve the folder (required for multi-file links to resolve)
npx serve student-results/
# Visit http://localhost:3000
```

---

## What This Demonstrates

- Multi-file project organisation with clean separation of concerns
- Complex data validation (overlap detection, range checks, duplicate names)
- Dynamic table rendering with sorting, filtering, and pagination-ready architecture
- Building a tool with real professional utility, not just a demo
