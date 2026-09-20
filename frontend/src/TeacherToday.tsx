import { useNavigate } from "react-router-dom";
import { useTodayTimetable } from "./hooks/useTodayTimeTable";
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  MapPin,
  Check,
  Clock,
  UserCheck,
  Edit2,
  Sparkles,
} from "lucide-react";

interface PeriodItem {
  timetableSlotId: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subjectName: string;
  className: string;
  room: string;
  isMarked: boolean;
  presentCount?: number;
  absentCount?: number;
  totalStudents?: number;
}

const mockPeriods: PeriodItem[] = [
  {
    timetableSlotId: "slot-001",
    periodNumber: 1,
    startTime: "09:00 AM",
    endTime: "10:00 AM",
    subjectName: "Statistics 201 - Probability Theory",
    className: "2nd Year B.Sc Statistics",
    room: "Room 304",
    isMarked: true,
    presentCount: 28,
    absentCount: 2,
    totalStudents: 30,
  },
  {
    timetableSlotId: "slot-002",
    periodNumber: 2,
    startTime: "10:00 AM",
    endTime: "11:00 AM",
    subjectName: "CS 102 - Data Structures & Algorithms",
    className: "1st Year B.Sc Computer Science",
    room: "Lab 2",
    isMarked: false,
  },
  {
    timetableSlotId: "slot-003",
    periodNumber: 3,
    startTime: "11:15 AM",
    endTime: "12:15 PM",
    subjectName: "DBMS 301 - Database Management Systems",
    className: "3rd Year BCA",
    room: "Room 108",
    isMarked: true,
    presentCount: 25,
    absentCount: 3,
    totalStudents: 28,
  },
  {
    timetableSlotId: "slot-004",
    periodNumber: 4,
    startTime: "01:30 PM",
    endTime: "02:30 PM",
    subjectName: "CS 204 - Web Development Lab",
    className: "2nd Year B.Sc Computer Science",
    room: "Software Lab A",
    isMarked: false,
  },
  {
    timetableSlotId: "slot-005",
    periodNumber: 5,
    startTime: "02:30 PM",
    endTime: "03:30 PM",
    subjectName: "CS 305 - Operating Systems Concepts",
    className: "3rd Year B.Sc Computer Science",
    room: "Room 202",
    isMarked: true,
    presentCount: 27,
    absentCount: 3,
    totalStudents: 30,
  },
];

export function TeacherToday() {
  const navigate = useNavigate();

  const {
    isLoading,
    isError,
  } = useTodayTimetable();

  const displayPeriods = mockPeriods;

  const totalClasses = displayPeriods.length;
  const markedClasses = displayPeriods.filter((p) => p.isMarked).length;
  const unmarkedClasses = totalClasses - markedClasses;

  // Format today's date
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#E0E7FF] border-t-[#4F46E5]" />
        <p className="text-sm font-medium text-gray-500">Loading today's schedule...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-2xs"
      >
        <p className="font-semibold">Unable to fetch today's schedule</p>
        <p className="mt-1 text-red-600">Please check your network connection and refresh.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl bg-linear-to-r from-[#4F46E5] to-[#4338CA] p-8 text-white shadow-lg sm:flex-row sm:items-center">
        <div>
          
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
{todayFormatted}
          </h1>
          <p className="mt-1 text-sm text-[#E0E7FF]">
            Review your classes and log student attendance for today's sessions.
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Classes</p>
            <p className="text-2xl font-bold text-gray-900">{totalClasses}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#16A34A]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-[#16A34A]">{markedClasses}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#D97706]">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Not Marked</p>
            <p className="text-2xl font-bold text-[#D97706]">{unmarkedClasses}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E0F2FE] text-[#0EA5E9]">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pending Leaves</p>
            <p className="text-2xl font-bold text-[#0EA5E9]">2</p>
          </div>
        </div>
      </div>

      {/* Schedule Period List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Period Schedule</h2>
          <span className="text-xs font-medium text-gray-500">{displayPeriods.length} Sessions Scheduled</span>
        </div>

        {displayPeriods.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center shadow-xs">
            <Calendar className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-semibold text-gray-700">No classes scheduled today</p>
            <p className="mt-1 text-xs text-gray-500">Enjoy your day off or check your upcoming timetable.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayPeriods.map((period) => (
              <div
                key={period.timetableSlotId}
                className="group relative flex flex-col justify-between gap-5 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs transition-all duration-200 hover:border-[#4F46E5]/40 hover:shadow-md sm:flex-row sm:items-center"
              >
                {/* Left side: Time badge + Details */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-36 shrink-0 flex-col items-center justify-center rounded-xl bg-[#F8FAFC] p-3 text-center border border-gray-100 group-hover:bg-[#E0E7FF]/50 transition-colors">
                    <span className="text-xs font-bold text-[#4F46E5]">Period {period.periodNumber}</span>
                    <span className="mt-0.5 text-xs font-bold text-gray-800">
                      {period.startTime} - {period.endTime}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-[#4F46E5] transition-colors">
                      {period.subjectName}
                    </h3>

                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{period.className}</span>
                      <span className="h-1 w-1 rounded-full bg-gray-300" />
                      <span className="flex items-center gap-1 font-medium text-gray-600">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        {period.room}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Status Chip & Action Button */}
                <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
                  {period.isMarked ? (
                    <>
                      <div className="flex items-center gap-2 rounded-full border border-[#BBF7D0] bg-[#DCFCE7] px-3.5 py-1.5 text-xs font-bold text-[#16A34A]">
                        <Check className="h-3.5 w-3.5" />
                        <span>{period.presentCount} present · {period.absentCount} absent</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/teacher/mark-attendance/${period.timetableSlotId}`)}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-2xs transition-all hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-gray-500" />
                        <span>Edit Attendance</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 rounded-full border border-[#FDE68A] bg-[#FEF3C7] px-3.5 py-1.5 text-xs font-bold text-[#D97706]">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Not marked</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/teacher/mark-attendance/${period.timetableSlotId}`)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#4338CA] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>Mark Attendance</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}