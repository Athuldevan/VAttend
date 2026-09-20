import { CheckCircle2, Clock3 } from "lucide-react";

type ScheduleStatus = "completed" | "pending";

interface ScheduleRowProps {
  time: string;
  subject: string;
  className: string;
  status: ScheduleStatus;
}

export default function ScheduleRow({
  time,
  subject,
  className,
  status,
}: ScheduleRowProps) {
  const isCompleted = status === "completed";

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4.5 transition-colors hover:bg-gray-50/80">
      {/* Time */}
      <div className="flex w-36 shrink-0 items-center gap-2 text-xs font-semibold text-gray-600">
        <Clock3 className="h-3.5 w-3.5 text-[#4F46E5]" />
        <span>{time}</span>
      </div>

      {/* Subject + Class */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-gray-900">
          {subject}
        </p>
        <p className="mt-0.5 truncate text-xs font-medium text-gray-500">
          {className}
        </p>
      </div>

      {/* Status */}
      <div className="shrink-0">
        {isCompleted ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#BBF7D0] bg-[#DCFCE7] px-3 py-1 text-xs font-bold text-[#16A34A]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FDE68A] bg-[#FEF3C7] px-3 py-1 text-xs font-bold text-[#D97706]">
            Pending
          </span>
        )}
      </div>
    </div>
  );
}