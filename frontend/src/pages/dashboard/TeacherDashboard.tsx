import {
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  CircleX,
  Clock3,
  FileCheck2,
  type LucideIcon,
  Sparkles,
} from "lucide-react";
import TodayScheduleCard from "../../components/TodayScheduleCard";
import { Link } from "react-router-dom";

export function TeacherDashboard() {
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E0E7FF] px-3 py-1 text-xs font-bold text-[#4338CA]">
            <Sparkles className="h-3.5 w-3.5 text-[#4F46E5]" />
            <span>Dashboard Overview</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Welcome back, Dr. Sarah
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here is your department attendance summary and teaching schedule.
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-2.5 shadow-2xs">
          <p className="text-xs font-bold text-gray-700">{todayFormatted}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today's Classes"
          value="5"
          description="5 sessions scheduled"
          icon={CalendarDays}
          iconClassName="bg-gray-100 text-gray-700"
        />

        <StatCard
          title="Classes Completed"
          value="3"
          description="3 marked out of 5"
          icon={CheckCircle2}
          iconClassName="bg-[#DCFCE7] text-[#16A34A]"
        />

        <StatCard
          title="Attendance Rate"
          value="88.5%"
          description="Class average today"
          icon={CheckCircle2}
          iconClassName="bg-[#E0E7FF] text-[#4338CA]"
        />

        <StatCard
          title="Low Attendance Alert"
          value="3"
          description="Students below 75%"
          icon={AlertTriangle}
          iconClassName="bg-[#FEE2E2] text-[#DC2626]"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TodayScheduleCard />
        </div>

        <AttendanceOverviewCard />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <LowAttendanceCard />
        <PendingLeaveCard />
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconClassName?: string;
}

export default function StatCard({
  title,
  value,
  description = "Overall status",
  icon: Icon,
  iconClassName = "bg-[#E0E7FF] text-[#4338CA]",
}: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </p>

          <p className="mt-1 text-xs font-medium text-gray-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-2xs ${iconClassName}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

const attendanceData = [
  {
    label: "Present",
    value: 82,
    icon: CheckCircle2,
    badgeStyle: "bg-[#DCFCE7] text-[#16A34A]",
  },
  {
    label: "Absent",
    value: 10,
    icon: CircleX,
    badgeStyle: "bg-[#FEE2E2] text-[#DC2626]",
  },
  {
    label: "Half Day",
    value: 3,
    icon: Clock3,
    badgeStyle: "bg-[#FEF3C7] text-[#D97706]",
  },
  {
    label: "Leave",
    value: 5,
    icon: FileCheck2,
    badgeStyle: "bg-[#E0F2FE] text-[#0EA5E9]",
  },
];

export function AttendanceOverviewCard() {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
      <div className="border-b border-[#E5E7EB] px-6 py-4.5">
        <h2 className="text-base font-bold text-gray-900">
          Attendance Distribution
        </h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Daily status breakdown based on design.md
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 p-6">
        {attendanceData.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-xl border border-gray-100 bg-[#F8FAFC] p-4.5 transition-all hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${item.badgeStyle}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-bold text-gray-700">
                  {item.label}
                </span>
              </div>

              <p className="mt-3 text-2xl font-bold text-gray-900">
                {item.value}%
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const lowAttendanceStudents = [
  {
    id: "1",
    name: "Rahul Kumar",
    className: "2nd Year B.Sc Statistics",
    attendance: 68,
  },
  {
    id: "2",
    name: "Anjali S",
    className: "2nd Year B.Sc Statistics",
    attendance: 71,
  },
  {
    id: "3",
    name: "Muhammed Rafi",
    className: "3rd Year BCA",
    attendance: 73,
  },
];

export function LowAttendanceCard() {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4.5">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            Defaulter Warning (&lt; 75%)
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Students requiring attendance intervention
          </p>
        </div>

        <span className="rounded-full border border-[#FECACA] bg-[#FEE2E2] px-3 py-1 text-xs font-bold text-[#DC2626]">
          3 students
        </span>
      </div>

      <div className="divide-y divide-[#E5E7EB]">
        {lowAttendanceStudents.map((student) => (
          <div
            key={student.id}
            className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-900">
                {student.name}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {student.className}
              </p>
            </div>

            <span className="ml-4 shrink-0 rounded-lg bg-[#FEE2E2] px-2.5 py-1 text-xs font-bold text-[#DC2626]">
              {student.attendance}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const pendingLeaves = [
  {
    id: "1",
    name: "Akhil Raj",
    className: "2nd Year B.Sc Statistics",
    dates: "20 Sep - 21 Sep",
    reason: "Medical Leave",
  },
  {
    id: "2",
    name: "Fathima N",
    className: "3rd Year BCA",
    dates: "22 Sep",
    reason: "Sports Duty",
  },
];

export function PendingLeaveCard() {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4.5">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            Pending Student Leaves
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Requires teacher approval
          </p>
        </div>

        <span className="rounded-full border border-[#BAE6FD] bg-[#E0F2FE] px-3 py-1 text-xs font-bold text-[#0EA5E9]">
          2 pending
        </span>
      </div>

      <div className="divide-y divide-[#E5E7EB]">
        {pendingLeaves.map((leave) => (
          <div
            key={leave.id}
            className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-900">
                {leave.name}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {leave.className} · <span className="text-gray-600">{leave.reason}</span>
              </p>
            </div>

            <span className="ml-4 shrink-0 rounded-lg bg-[#E0F2FE] px-2.5 py-1 text-xs font-bold text-[#0EA5E9]">
              {leave.dates}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-[#E5E7EB] px-6 py-3.5">
        <Link
          to="/teacher/leave"
          className="text-xs font-bold text-[#4F46E5] transition-colors hover:text-[#4338CA]"
        >
          Review all leave requests &rarr;
        </Link>
      </div>
    </div>
  );
}
