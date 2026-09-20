import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../api/axiosClient';
 
export interface TodayPeriod {
  timetableSlotId: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  className: string;
  isMarked: boolean;
  summary?: string; // e.g. "28 present · 2 absent"
}
 
// TODO: hits GET /api/timetable/me — finalize whether "today only" and
// isMarked/summary are computed server-side or here, once the backend
// Attendance module exists to cross-reference against.
export function useTodayTimetable() {
  return useQuery({
    queryKey: ['timetable', 'me', 'today'],
    queryFn: async () => {
      const { data } = await axiosClient.get<TodayPeriod[]>('/timetable/me');
      console.log("Fetched timetable data:", data); 
      return mockPeriods; // Replace with `data` when backend is ready
    },
  });
}
 
export const mockPeriods = [
  {
    timetableSlotId: "slot-001",
    startTime: "09:00 AM",
    endTime: "10:00 AM",
    subjectName: "Mathematics",
    className: "BSc Computer Science - A",
    isMarked: true,
    summary: "Present: 28 / 30",
  },
  {
    timetableSlotId: "slot-002",
    startTime: "10:00 AM",
    endTime: "11:00 AM",
    subjectName: "Data Structures",
    className: "BSc Computer Science - A",
    isMarked: false,
    summary: "",
  },
  {
    timetableSlotId: "slot-003",
    startTime: "11:15 AM",
    endTime: "12:15 PM",
    subjectName: "Database Management Systems",
    className: "BSc Computer Science - B",
    isMarked: true,
    summary: "Present: 25 / 28",
  },
  {
    timetableSlotId: "slot-004",
    startTime: "01:30 PM",
    endTime: "02:30 PM",
    subjectName: "Web Development",
    className: "BCA - A",
    isMarked: false,
    summary: "",
  },
  {
    timetableSlotId: "slot-005",
    startTime: "02:30 PM",
    endTime: "03:30 PM",
    subjectName: "Operating Systems",
    className: "BSc Computer Science - B",
    isMarked: true,
    summary: "Present: 27 / 30",
  },
];