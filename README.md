# VAttend – Attendance Management System

A mobile-based **Attendance Management System** developed for **Government Victoria College, Palakkad**, designed to simplify and digitize academic attendance management.

VMS enables faculty members to manage their timetables, mark and update student attendance, while administrators can manage departments, classes, subjects, teachers, and academic schedules through a centralized system.

## 🚀 Features

### 👨‍🏫 Faculty Module
- View assigned teaching schedules and timetables.
- View assigned classes and subjects.
- Mark student attendance.
- Update and manage previously recorded attendance.
- Access attendance records.

### 🛡️ Administration Module
- Manage departments and academic programs.
- Create and manage classes and batches.
- Manage subjects and subject assignments.
- Add, update, and manage faculty members.
- Configure academic timetables and schedules.
- Centralized academic data management.

### 📱 Mobile Application
- Mobile-first user experience.
- Intuitive and easy-to-use interface.
- Secure authentication and role-based access.
- Integration with the backend REST API.

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Mobile Application | React Native, Expo |
| Language | TypeScript |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| API Architecture | REST API |
| Development Environment | Expo CLI, Node.js |

## 🏗️ System Architecture

The application follows a client-server architecture.

```text
                    ┌──────────────────────┐
                    │   React Native App   │
                    │       (Expo)         │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │    Express.js API    │
                    │      Node.js         │
                    └──────────┬───────────┘
                               │
                               │ Mongoose / MongoDB Driver
                               ▼
                    ┌──────────────────────┐
                    │       MongoDB        │
                    │      Database        │
                    └──────────────────────┘
```

## 📂 Project Structure

The project is organized into separate frontend and backend applications.

```text
VMS/
│
├── mobile/                 # React Native Expo application
│   ├── src/
│   ├── assets/
│   ├── app.json
│   └── package.json
│
├── backend/                # Node.js Express API
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

*Note: The folder structure above is illustrative. Adjust it to match the actual repository structure.*

## ⚙️ Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

Make sure you have installed:

- Node.js (LTS)
- npm
- MongoDB (local instance or MongoDB Atlas)
- Expo Go (for physical device testing)
- Git

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd VMS
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
npm install
```

Configure your environment variables by creating a `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

Start the
