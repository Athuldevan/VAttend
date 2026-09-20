import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {LoginPage} from "./pages/auth/LoginPage";



export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/dashboard" element={<p>Dashboard</p>} />
      </Routes>
    </Router>
  );
}
