# 🎓 College Student Leave Management System

A full-stack web application developed for higher education institutions to streamline student leave applications, faculty review workflows, departmental management, and administrative leave reporting.

---

## 🌟 Key Features & Role Specifications

### 1. 🧑‍🎓 Student Module
- **Registration & Authentication**: Student self-registration with register number, department, class, and advisor selection.
- **Leave Application**: Form with leave category selector, start/end date pickers with automatic total day calculation, reason text, and supporting document file attachment.
- **Leave Status Tracking**: Real-time status indicators (**Pending**, **Approved**, **Rejected**, **Cancelled**).
- **Cancellation**: Ability for students to withdraw pending leave applications before faculty review.
- **Notifications**: Instant notification drawer alerts upon approval or rejection.

### 2. 👨‍🏫 Faculty / Teacher Module
- **Faculty Dashboard**: Overview of leave requests submitted by assigned students.
- **Review & Remarks**: Inspect student leave reasons and uploaded medical/academic certificates, with **Approve** and **Reject** controls and required remark input.
- **Student History**: Lookup complete leave logs for any student in assigned classes.
- **Filter & Search**: Filter requests by status (Pending, Approved, Rejected) and search by student name or register number.

### 3. 🛡️ Administrator Module
- **System Overview Dashboard**: Live stat cards (Total Students, Total Faculty, Departments, Total Leaves, Pending, Approved, Rejected).
- **Student Management**: Add, edit, remove student records, and send email invitations.
- **Faculty Management**: Add and assign faculty members to academic departments.
- **Department & Class Management**: Manage academic departments (CSE, ECE, MECH, CIVIL) and their class sections.
- **Leave Type Configuration**: Manage leave categories (Sick Leave, Casual Leave, Emergency Leave, Academic Leave) with max annual day limits and document requirement rules.
- **Reports & Export**: Departmental breakdown, category distribution, and one-click CSV export / PDF printable summary report.

---

## 📁 Repository Folder Structure

```text
mysterious-fermi/
├── database/
│   ├── schema.sql         # Database DDL Script (PostgreSQL / MySQL / SQLite compatible)
│   └── seed.sql           # Database DML Seed Script with sample college data
├── server/
│   ├── index.js           # Express API Server entry point & REST endpoints
│   └── db.js              # Database connection & persistence engine
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx    # Role-based sidebar navigation bar
│   │   ├── Topbar.jsx     # Top header bar with profile & notifications drawer
│   │   └── StatCard.jsx   # Dynamic statistics card with color themes
│   ├── pages/
│   │   ├── Login.jsx      # Login page with role selector & demo quick-logins
│   │   ├── Register.jsx   # Student signup page
│   │   ├── AdminDashboard.jsx    # Admin visual dashboard matching design
│   │   ├── StudentsPage.jsx      # Student records management page
│   │   ├── FacultyPage.jsx       # Faculty records management page
│   │   ├── DepartmentsPage.jsx   # Department & class management page
│   │   ├── LeaveTypesPage.jsx    # Leave category configuration page
│   │   ├── FacultyDashboard.jsx  # Faculty approval portal page
│   │   ├── StudentDashboard.jsx  # Student leave portal page
│   │   ├── LeaveHistoryPage.jsx  # Leave history & detailed logs page
│   │   └── ReportsPage.jsx       # Leave reports & export page
│   ├── App.jsx            # Main SPA router & application state
│   ├── index.css          # Full CSS design system matching target mockups
│   └── main.jsx           # React app root entry
├── index.html             # HTML5 template
├── vite.config.js         # Vite configuration with API proxy
└── package.json           # Dependencies and scripts
```

---

## 🔑 Sample Login Credentials

For quick evaluation, use the one-click quick-login buttons on the Login page or enter these credentials:

| Role | Email Address | Password | Details |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@college.edu` | `password123` | Full system access & management |
| **Faculty / Teacher** | `faculty@college.edu` | `password123` | Prof. Sarah Jenkins (CSE Dept) |
| **Student** | `student@college.edu` | `password123` | Alex Morgan (Reg No: CS2023001) |

---

## 🚀 Setup & Execution Guide

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Application
Start the backend server and Vite frontend concurrently:

```bash
# Terminal 1: Run Express REST API Server (Port 5000)
npm run server

# Terminal 2: Run Vite React Frontend (Port 3000)
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

### 3. Production Build & Run (Single Command)
```bash
# Option A: Build and start in one command
npm run build:start

# Option B: Run separately
npm run build
npm run server
```
Navigate to `http://localhost:5000` in your browser.

---

## 🗄️ Database Setup (College Submission)

For standard RDBMS project submission (MySQL / PostgreSQL / Oracle):
1. Execute `database/schema.sql` in your SQL tool (MySQL Workbench, pgAdmin, phpMyAdmin) to construct table relationships and foreign keys.
2. Execute `database/seed.sql` to populate sample college data.

---

## 📄 License
This project is open-source and intended for educational & academic submission purposes.
