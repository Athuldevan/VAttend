import {
  Clock3,
  CalendarDays,
  Users,
  ClipboardCheck,
  FileText,
  UserCircle,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
  {
    label: "Today",
    path: "/teacher/today",
    icon: Clock3,
  },
  {
    label: "Timetable",
    path: "/teacher/timetable",
    icon: CalendarDays,
  },
  {
    label: "My Classes",
    path: "/teacher/classes",
    icon: Users,
  },
  {
    label: "Attendance History",
    path: "/teacher/attendance",
    icon: ClipboardCheck,
  },
  {
    label: "Leave Requests",
    path: "/teacher/leave",
    icon: FileText,
    badge: 2,
  },
];

export function TeacherSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#E5E7EB] bg-white shadow-xs">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-[#E5E7EB] px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4F46E5] text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-gray-900">AMS Portal</h1>
            <p className="text-[11px] font-medium text-gray-500">Dept. Attendance Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-3 py-5">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Teacher Navigation
        </p>

        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-[#E0E7FF] text-[#4338CA] font-semibold shadow-xs"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                ].join(" ")
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#0EA5E9] px-1.5 text-[11px] font-bold text-white shadow-2xs">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Account / Bottom Actions */}
      <div className="border-t border-[#E5E7EB] p-3 space-y-1">
        <NavLink
          to="/teacher/profile"
          className={({ isActive }) =>
            [
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "bg-[#E0E7FF] text-[#4338CA] font-semibold"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
            ].join(" ")
          }
        >
          <UserCircle className="h-4 w-4 shrink-0" />
          <span>Profile</span>
        </NavLink>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-[#DC2626]"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

