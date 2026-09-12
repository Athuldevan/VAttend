Attendance Management System — Project Brief
Overview

A web-based Attendance Management System (AMS) that lets teachers mark and manage period-wise student attendance digitally, and lets students track their attendance and request leave online. Built first for a single department (Statistics), with a data model and access-control design that supports expanding to multiple departments without reworking the schema.

Problem it solves

Manual, paper-based or spreadsheet attendance tracking is error-prone, hard to audit, and gives students no visibility into their own standing until it's too late (e.g., falling below the minimum attendance required for exam eligibility). This system digitizes the process, adds role-based access, and surfaces low-attendance students proactively to both teachers and students.

Tech stack
Frontend: React + TypeScript
Backend: Node.js + Express + TypeScript
Database: MongoDB with Mongoose
Auth: JWT (access + refresh tokens), bcrypt for password hashing
Overall stack: MERN + TypeScript
User roles

Admin / HOD

Creates and manages the timetable (day-wise, period-wise), with clash detection so a teacher isn't double-booked
Manages subjects, teachers, and batches (year/section)
Adds and promotes students to the next academic year
Oversees leave request approvals
Views department-wide attendance reports and defaulter lists

Teacher

Views their assigned timetable
Views students by year/batch
Marks attendance per period (present / absent / half-day leave / full-day leave)
Edits previously marked attendance (changes are logged)
Views students with low attendance in their subjects
Reviews and approves/rejects student leave requests

Student

Views their timetable
Views attendance by period, subject, and day
Views overall and subject-wise attendance percentage
Requests leave with a reason and date range
Tracks the status of submitted leave requests
Core data entities
Department — top-level scope for everything else
Batch — a year + section within a department (e.g., "2nd year, Statistics")
Student — belongs to a batch
Teacher — belongs to a department
Subject — belongs to a department, tagged with semester
TimetableSlot — day, period, batch, subject, and teacher
Attendance — student, timetable slot, date, status, marked-by, and edit history
LeaveRequest — student, date range, status, reviewed-by
Key business rules
Attendance is recorded per period, per day. Daily, subject-wise, and overall views are all aggregations of period-level records — not separately tracked data.
Attendance status options: present, absent, half-day leave, full-day leave.
Approved leave requests update the corresponding attendance status automatically.
A holiday/working-day calendar excludes non-instructional days from percentage calculations.
A minimum attendance threshold (commonly 75%) flags students as "defaulters," visible to both teachers and the students themselves.
Every edit to an already-submitted attendance record is logged with the previous value, new value, editor, and timestamp.
Every entity is scoped by department (and batch, where relevant), so the system can expand to more departments without schema changes.
Architecture approach
Layered backend: routes/middleware (JWT auth, role-based authorization, department scoping, input validation) → controllers → services (business logic) → data access layer (Mongoose models) → MongoDB.
Feature-based module structure (auth, department, batch, student, teacher, subject, timetable, attendance, leave) rather than grouping by technical layer, so it scales cleanly as departments and features are added.
The JWT encodes the user's role and departmentId; every protected route enforces department scoping at the middleware level rather than trusting client input.
Non-functional requirements
Role-based authorization enforced at both the middleware and database-query level.
Full audit trail for attendance edits and leave approvals.
Designed from the start for multi-department, multi-year scale.
Server-side validation on every write endpoint.
Out of scope for phase 1

Fee management, exams/grades, and hostel management — potential future modules, not part of this build.