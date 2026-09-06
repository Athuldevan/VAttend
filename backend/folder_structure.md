AMS/
│
├── backend/
│   │
│   ├── src/
│   │   │
│   │   ├── config/
│   │   │   ├── db.ts
│   │   │   ├── env.ts
│   │   │   └── swagger.ts
│   │   │
│   │   ├── modules/
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.validation.ts
│   │   │   │   └── auth.types.ts
│   │   │   │
│   │   │   ├── department/
│   │   │   │   ├── department.model.ts
│   │   │   │   ├── department.routes.ts
│   │   │   │   ├── department.controller.ts
│   │   │   │   ├── department.service.ts
│   │   │   │   └── department.validation.ts
│   │   │   │
│   │   │   ├── batch/
│   │   │   │   ├── batch.model.ts
│   │   │   │   ├── batch.routes.ts
│   │   │   │   ├── batch.controller.ts
│   │   │   │   ├── batch.service.ts
│   │   │   │   └── batch.validation.ts
│   │   │   │
│   │   │   ├── student/
│   │   │   │   ├── student.model.ts
│   │   │   │   ├── student.routes.ts
│   │   │   │   ├── student.controller.ts
│   │   │   │   ├── student.service.ts
│   │   │   │   └── student.validation.ts
│   │   │   │
│   │   │   ├── teacher/
│   │   │   │   ├── teacher.model.ts
│   │   │   │   ├── teacher.routes.ts
│   │   │   │   ├── teacher.controller.ts
│   │   │   │   ├── teacher.service.ts
│   │   │   │   └── teacher.validation.ts
│   │   │   │
│   │   │   ├── subject/
│   │   │   │   ├── subject.model.ts
│   │   │   │   ├── subject.routes.ts
│   │   │   │   ├── subject.controller.ts
│   │   │   │   ├── subject.service.ts
│   │   │   │   └── subject.validation.ts
│   │   │   │
│   │   │   ├── timetable/
│   │   │   │   ├── timetable.model.ts
│   │   │   │   ├── timetable.routes.ts
│   │   │   │   ├── timetable.controller.ts
│   │   │   │   ├── timetable.service.ts
│   │   │   │   └── timetable.validation.ts
│   │   │   │
│   │   │   ├── attendance/
│   │   │   │   ├── attendance.model.ts
│   │   │   │   ├── attendance.routes.ts
│   │   │   │   ├── attendance.controller.ts
│   │   │   │   ├── attendance.service.ts
│   │   │   │   ├── attendance.validation.ts
│   │   │   │   └── attendance.types.ts
│   │   │   │
│   │   │   ├── leave/
│   │   │   │   ├── leave.model.ts
│   │   │   │   ├── leave.routes.ts
│   │   │   │   ├── leave.controller.ts
│   │   │   │   ├── leave.service.ts
│   │   │   │   └── leave.validation.ts
│   │   │   │
│   │   │   ├── calendar/
│   │   │   │   ├── calendar.model.ts
│   │   │   │   ├── calendar.routes.ts
│   │   │   │   ├── calendar.controller.ts
│   │   │   │   ├── calendar.service.ts
│   │   │   │   └── calendar.validation.ts
│   │   │   │
│   │   │   └── reports/
│   │   │       ├── report.routes.ts
│   │   │       ├── report.controller.ts
│   │   │       └── report.service.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── authorize.middleware.ts
│   │   │   ├── departmentScope.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── notFound.middleware.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── constants/
│   │   │   │   ├── roles.ts
│   │   │   │   └── attendanceStatus.ts
│   │   │   │
│   │   │   ├── errors/
│   │   │   │   ├── AppError.ts
│   │   │   │   └── errorCodes.ts
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── jwt.ts
│   │   │   │   ├── password.ts
│   │   │   │   ├── asyncHandler.ts
│   │   │   │   └── apiResponse.ts
│   │   │   │
│   │   │   └── types/
│   │   │       ├── express.d.ts
│   │   │       └── common.types.ts
│   │   │
│   │   ├── routes/
│   │   │   └── index.ts
│   │   │
│   │   ├── docs/
│   │   │   ├── swagger.ts
│   │   │   └── openapi.ts
│   │   │
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   │
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
│
├── frontend/
│
└── README.md