import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/auth/LoginPage";
import { TeacherLayout } from "./components/TeacherLayout";
import { TeacherToday } from "./TeacherToday";
import { TeacherDashboard } from "./pages/dashboard/TeacherDashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/teacher/today" replace />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Teacher Routes wrapped in layout */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<Navigate to="/teacher/today" replace />} />
          <Route path="today" element={<TeacherToday />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="timetable" element={<TeacherToday />} />
          <Route path="classes" element={<TeacherToday />} />
          <Route path="attendance" element={<TeacherToday />} />
          <Route path="leave" element={<TeacherToday />} />
          <Route path="profile" element={<TeacherToday />} />
        </Route>

        <Route path="/dashboard" element={<Navigate to="/teacher/today" replace />} />
      </Routes>
    </Router>
  );
}

