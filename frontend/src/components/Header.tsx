import { Bell, ChevronDown } from "lucide-react";

export function TeacherHeader() {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-xs">
      <div className="flex h-full items-center justify-between px-8">
        {/* Left Header info */}
        <div>
          <h2 className="text-sm font-bold text-gray-900">
            Department of Computer Science
          </h2>
          <p className="text-xs font-medium text-gray-500">
            Teacher Portal
          </p>
        </div>

        {/* Right User Actions */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="relative rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#0EA5E9] ring-2 ring-white" />
          </button>

          <div className="h-6 w-px bg-[#E5E7EB]" />

          <button
            type="button"
            className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-gray-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E0E7FF] text-sm font-bold text-[#4338CA] shadow-2xs">
              SJ
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                Dr. Sarah Jenkins
              </p>
              <p className="text-xs text-gray-500">
                Assistant Professor
              </p>
            </div>

            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
}