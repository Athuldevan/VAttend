import { Outlet } from "react-router-dom";
import { TeacherHeader } from "./Header";
import { TeacherSidebar } from "./TeacherSidebar";

export function TeacherLayout() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TeacherSidebar />

      <div className="pl-64">
        <TeacherHeader />
        <main className="min-h-[calc(100vh-64px)] p-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}




