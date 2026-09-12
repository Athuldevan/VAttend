Attendance Management System — Full Technical Specification

This document is written to be handed to a coding agent (Claude Code or similar) as the source of truth for implementation. It contains the data models, API contract, permission rules, and business logic needed to build the backend and frontend without further clarification. Follow the build order in Section 9.

1. Project Summary

A role-based Attendance Management System, starting with one department (Statistics), built so it can expand to multiple departments without schema changes. Teachers mark period-wise attendance; students track their attendance and request leave; admins manage the academic structure.

2. Tech Stack
Frontend: React 18 + TypeScript, React Router, React Query (or Axios + hooks)
Backend: Node.js + Express + TypeScript
Database: MongoDB + Mongoose
Auth: JWT (short-lived access token + refresh token), bcrypt for password hashing
Validation: Zod
Testing: Jest + Supertest
3. Roles & Permissions Matrix
Action	Admin / HOD	Teacher	Student
Manage departments, batches, subjects	✅	❌	❌
Create teacher / student accounts	✅	❌	❌
Create / edit timetable	✅	❌ (view own only)	❌ (view own only)
Mark attendance for a period	❌	✅ (own subjects/batches only)	❌
Edit a submitted attendance record	✅ (any)	✅ (own, within edit window)	❌
View own attendance (%, by subject/day/period)	❌	❌	✅
View class attendance / defaulter list	✅ (all batches)	✅ (own subjects/batches)	❌
Submit leave request	❌	❌	✅
Approve / reject leave request	✅	✅ (own students)	❌
Promote students to next academic year	✅	❌	❌
Export attendance reports	✅	✅ (own batches)	❌

All server-side authorization is enforced by middleware reading the role and departmentId off the JWT — never off client-supplied values.

4. Data Models (Mongoose Schemas)
ts
// User — single collection, discriminated by role
User {
  _id: ObjectId
  name: string
  email: string            // unique
  passwordHash: string
  role: 'admin' | 'teacher' | 'student'
  departmentId: ObjectId   // ref Department
  isActive: boolean
  // present only when role === 'student'
  batchId?: ObjectId       // ref Batch
  rollNo?: string
  // present only when role === 'teacher'
  employeeId?: string
  createdAt, updatedAt
}

Department {
  _id: ObjectId
  name: string
  code: string             // e.g. "STAT"
}

Batch {
  _id: ObjectId
  departmentId: ObjectId   // ref Department
  year: number             // 1, 2, 3
  section: string          // "A", "B" (default "A" for now)
  academicYear: string     // "2026-27"
}

Subject {
  _id: ObjectId
  departmentId: ObjectId
  name: string
  code: string
  semester: number
}

TimetableSlot {
  _id: ObjectId
  departmentId: ObjectId
  batchId: ObjectId        // ref Batch
  subjectId: ObjectId      // ref Subject
  teacherId: ObjectId      // ref User (role=teacher)
  dayOfWeek: number        // 0=Mon .. 5=Sat
  period: number           // 1..8
  startTime: string        // "09:00"
  endTime: string          // "09:50"
}
// unique index: { batchId, dayOfWeek, period } — a batch can't have two subjects in one slot
// unique index: { teacherId, dayOfWeek, period } — a teacher can't teach two slots at once

Attendance {
  _id: ObjectId
  studentId: ObjectId      // ref User
  timetableSlotId: ObjectId
  date: Date               // normalized to midnight UTC
  status: 'present' | 'absent' | 'half_day' | 'leave'
  markedBy: ObjectId       // ref User (teacher)
  markedAt: Date
  editHistory: [{
    editedBy: ObjectId
    previousStatus: string
    newStatus: string
    editedAt: Date
  }]
}
// unique index: { studentId, timetableSlotId, date } — prevents duplicate marking

LeaveRequest {
  _id: ObjectId
  studentId: ObjectId
  fromDate: Date
  toDate: Date
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: ObjectId
  reviewedAt?: Date
  createdAt: Date
}

Holiday {
  _id: ObjectId
  departmentId?: ObjectId  // omit for a global holiday
  date: Date
  description: string
}
5. API Endpoints

Auth

POST /api/auth/login — public — {email, password} → {accessToken, refreshToken, user}
POST /api/auth/refresh — public (valid refresh token required)
POST /api/auth/logout — authenticated
POST /api/auth/change-password — authenticated

Departments / Batches / Subjects (admin writes; authenticated reads, scoped to caller's department)

GET /api/departments
POST /api/departments — admin
GET /api/batches?departmentId=
POST /api/batches — admin
GET /api/subjects?departmentId=&semester=
POST /api/subjects — admin

Users

POST /api/users/teachers — admin
POST /api/users/students — admin (supports bulk create)
GET /api/users/students?batchId= — admin, teacher
GET /api/users/teachers?departmentId= — admin

Timetable

GET /api/timetable?batchId= — any authenticated role in that department
GET /api/timetable/me — teacher's own schedule
POST /api/timetable — admin (rejects on clash, see Section 6)
PATCH /api/timetable/:id — admin
DELETE /api/timetable/:id — admin

Attendance

POST /api/attendance/mark — teacher — {timetableSlotId, date, records: [{studentId, status}]}
PATCH /api/attendance/:id — teacher (own, within edit window) / admin — appends to editHistory
GET /api/attendance/student/:studentId?subjectId=&from=&to= — self (student) / teacher / admin
GET /api/attendance/summary/:studentId — overall % and subject-wise %
GET /api/attendance/defaulters?batchId=&threshold=75 — teacher, admin
GET /api/attendance/slot/:timetableSlotId/date/:date — teacher, to view/edit an already-marked period

Leave

POST /api/leave — student — {fromDate, toDate, reason}
GET /api/leave/me — student
GET /api/leave/pending?batchId= — teacher, admin
PATCH /api/leave/:id/review — teacher, admin — {status: 'approved'|'rejected', comment?}

Reports

GET /api/reports/attendance-export?batchId=&from=&to= — admin, teacher — returns CSV
6. Business Logic Rules
Attendance granularity: every record is per period. Day-wise, subject-wise, and overall percentages are computed by aggregating period records — never stored redundantly.
Percentage formula: (present + half_day*0.5) / (total scheduled periods − holiday periods) * 100, computed per subject and overall.
Holidays: any date present in the Holiday collection is excluded from the denominator for that department.
Leave approval sync: when a LeaveRequest is approved, any Attendance records in that date range with no existing entry are auto-created with status 'leave'; already-marked 'absent' records in range are updated to 'leave'.
Timetable clash check: on POST /api/timetable, reject if {batchId, dayOfWeek, period} or {teacherId, dayOfWeek, period} already exists.
Attendance edit window: teachers can edit a record only within 48 hours of markedAt; after that, only admin can edit. Every edit appends to editHistory rather than overwriting silently.
Defaulter threshold: configurable per department (default 75%); GET /api/attendance/defaulters returns students below it.
Duplicate marking prevention: the unique index on {studentId, timetableSlotId, date} blocks double-marking; use PATCH to correct instead.
7. Backend Folder Structure
src/
├── config/            # env, db connection, constants
├── middleware/
│   ├── authenticate.ts    # verifies JWT
│   ├── authorize.ts       # role check
│   ├── scopeDepartment.ts # enforces departmentId on queries
│   ├── validate.ts        # Zod schema validation
│   └── errorHandler.ts
├── modules/
│   ├── auth/
│   ├── department/
│   ├── batch/
│   ├── subject/
│   ├── user/            # teacher + student accounts
│   ├── timetable/
│   ├── attendance/
│   └── leave/
│       ├── *.routes.ts
│       ├── *.controller.ts
│       ├── *.service.ts
│       ├── *.model.ts
│       └── *.validation.ts
├── utils/               # jwt.ts, apiResponse.ts, logger.ts
├── types/
├── app.ts
└── server.ts
8. Auth & Security
JWT access token payload: {userId, role, departmentId, iat, exp}, expires in 15 minutes.
Refresh token: longer-lived, stored hashed in DB, rotated on each use.
Passwords hashed with bcrypt (cost factor 10+).
Rate-limit /api/auth/login to slow brute force.
Every route validates departmentId server-side from the token — request bodies must never be trusted to set it.
9. Suggested Build Order
Project scaffolding, DB connection, User model, auth (login, JWT issue/verify, role middleware)
Department / Batch / Subject CRUD (admin only)
Timetable CRUD with clash validation
Attendance marking + edit + audit log
Attendance aggregation endpoints (summary, defaulters)
Leave request + approval workflow + sync to attendance
Reports/export
Frontend: auth screens → admin setup screens → teacher screens (timetable, mark attendance) → student screens (attendance view, leave request)

Each phase should be testable end-to-end (via Postman/tests) before moving to the next — attendance logic depends on timetable existing, and leave sync depends on attendance existing.

10. Out of Scope for Phase 1

Fee management, exams/grades, hostel management.