# VAttend – Attendance Management System

**VAttend** is a mobile-based Attendance Management System developed for **Government Victoria College, Palakkad**, designed to digitize and simplify academic attendance management.

Built using React Native (Expo), TypeScript, Node.js, Express.js, and MongoDB, VAttend provides a centralized platform for faculty members and administrators to manage student attendance and academic schedules efficiently.

Faculty members can view their timetables, mark and update student attendance, while administrators can manage departments, classes, subjects, teachers, and academic schedules.

## ✨ Features

### 👨‍🏫 Faculty Module
- View assigned teaching timetables.
- Access assigned classes and subjects.
- Mark student attendance.
- Update previously recorded attendance.
- View attendance records.

### 🛡️ Administration Module
- Manage departments and academic programs.
- Create and manage classes and batches.
- Manage subjects and subject assignments.
- Add, update, and manage faculty members.
- Configure academic timetables and schedules.
- Centralized academic data management.

### 📱 Mobile Application
- Built with React Native and Expo.
- Clean and intuitive user interface.
- Secure authentication.
- Role-based access control.
- REST API integration.

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Mobile Application | React Native |
| Framework | Expo |
| Programming Language | TypeScript |
| Backend Runtime | Node.js |
| Backend Framework | Express.js |
| Database | MongoDB |
| API Architecture | REST API |

## 🎨 Design Theme

VAttend follows a modern **Academic Blue + Teal** design system.

| Purpose | Color | Hex |
|---|---|---|
| Primary | Academic Navy | `#163B65` |
| Secondary | Blue | `#2563EB` |
| Accent | Teal | `#0D9488` |
| Background | Light Gray | `#F5F7FA` |
| Surface | White | `#FFFFFF` |
| Primary Text | Slate | `#334155` |

### Attendance Status Colors

| Status | Color | Hex |
|---|---|---|
| Present | Green | `#16A34A` |
| Absent | Red | `#DC2626` |
| Late | Orange | `#EA580C` |
| Pending | Amber | `#D97706` |

## 🏗️ System Architecture

VAttend follows a client-server architecture where the mobile application communicates with the backend through REST APIs.

```text
       ┌────────────────────────────┐
       │       VAttend Mobile       │
       │    React Native + Expo     │
       │         TypeScript         │
       └─────────────┬──────────────┘
                     │
                     │ REST API
                     ▼
       ┌────────────────────────────┐
       │       Backend API          │
       │     Node.js + Express      │
       │         TypeScript         │
       └─────────────┬──────────────┘
                     │
                     │ Database Operations
                     ▼
       ┌────────────────────────────┐
       │          MongoDB           │
       │       Data Storage         │
       └────────────────────────────┘
```

## 📂 Project Structure

The project is organized into separate mobile and backend applications.

```text
VAttend/
│
├── mobile/
│   ├── src/
│   ├── assets/
│   ├── app.json
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.ts
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

*Note: Update the structure to reflect the actual repository.*

## ⚙️ Installation & Setup

### Prerequisites

- Node.js (LTS)
- npm
- MongoDB or MongoDB Atlas
- Expo Go
- Git

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd VAttend
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

Start the backend development server:

```bash
npm run dev
```

### 3. Mobile Application Setup

Open another terminal:

```bash
cd mobile
npm install
```

Configure the backend API base URL for your development environment.

Start the Expo development server:

```bash
npx expo start
```

Scan the QR code using Expo Go to run VAttend on your mobile device.

## 🔐 Security

- Authentication and authorization.
- Role-based access control.
- Protected API endpoints.
- Server-side input validation.
- Secure environment variable management.
- Access restrictions for administrative operations.

## 🎯 Project Objectives

- Digitize the college attendance management process.
- Minimize manual attendance tracking.
- Simplify attendance management for faculty.
- Centralize academic and administrative information.
- Improve the accessibility and accuracy of attendance records.
- Provide an efficient mobile-first experience.

## 🔮 Future Enhancements

- Attendance percentage calculation and analytics.
- Student attendance history.
- Low-attendance alerts and notifications.
- Export attendance reports to PDF and Excel.
- Push notifications for timetable updates.
- Advanced attendance reporting and dashboards.

## 🏛️ Institution

**Government Victoria College, Palakkad, Kerala, India**

VAttend is developed to support the institution's academic administration through a centralized, mobile-based attendance management platform.

---

## 📄 License

Licensing and distribution terms are subject to the project's ownership and institutional requirements.
