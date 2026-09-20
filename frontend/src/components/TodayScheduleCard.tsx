import { Link } from "react-router-dom";
import ScheduleRow from "./ScheduleRow";

const dummySchedule = [
  {
    id: "1",
    time: "09:00 - 10:00 AM",
    subject: "Statistics 201 - Probability Theory",
    className: "2nd Year B.Sc Statistics",
    status: "completed" as const,
  },
  {
    id: "2",
    time: "10:00 - 11:00 AM",
    subject: "CS 102 - Data Structures",
    className: "1st Year B.Sc CS",
    status: "pending" as const,
  },
  {
    id: "3",
    time: "11:15 - 12:15 PM",
    subject: "DBMS 301 - Database Systems",
    className: "3rd Year BCA",
    status: "completed" as const,
  },
  {
    id: "4",
    time: "01:30 - 02:30 PM",
    subject: "CS 204 - Web Development Lab",
    className: "2nd Year B.Sc CS",
    status: "pending" as const,
  },
];

export default function TodayScheduleCard() {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4.5">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            Today's Schedule
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">Your teaching schedule for today</p>
        </div>

        <Link
          to="/teacher/today"
          className="text-xs font-bold text-[#4F46E5] transition-colors hover:text-[#4338CA]"
        >
          View all
        </Link>
      </div>

      {/* Schedule Rows */}
      <div className="divide-y divide-[#E5E7EB]">
        {dummySchedule.map((schedule) => (
          <ScheduleRow
            key={schedule.id}
            time={schedule.time}
            subject={schedule.subject}
            className={schedule.className}
            status={schedule.status}
          />
        ))}
      </div>
    </div>
  );
}

