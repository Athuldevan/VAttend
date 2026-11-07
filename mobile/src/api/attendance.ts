import { axiosClient } from './axiosClient';

export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'leave';

export interface AttendanceEdit {
  editedBy: string | { _id: string; name: string; email: string };
  previousStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
  editedAt: string;
}

export interface AttendanceRecord {
  id?: string;
  _id: string;
  studentId: string | { _id: string; name: string; email: string; rollNumber?: number };
  timetableSlotId: string | any;
  date: string;
  status: AttendanceStatus;
  markedBy: string | { _id: string; name: string; email: string };
  markedAt: string;
  editHistory: AttendanceEdit[];
  createdAt: string;
  updatedAt: string;
}

export interface MarkAttendancePayload {
  timetableSlotId: string;
  date: string;
  remarks?: string;
  records: Array<{
    studentId: string;
    status: AttendanceStatus;
  }>;
}

export interface SubjectAttendanceSummary {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  total: number;
  present: number;
  absent: number;
  half_day: number;
  leave: number;
  effectiveAttended: number;
  percentage: number;
}

export interface AttendanceSummaryResponse {
  success: boolean;
  message: string;
  data: {
    student: {
      _id: string;
      name: string;
      email: string;
      rollNumber?: number;
      class?: any;
      department?: any;
    };
    overall: {
      total: number;
      present: number;
      absent: number;
      half_day: number;
      leave: number;
      effectiveAttended: number;
      percentage: number;
    };
    subjects: SubjectAttendanceSummary[];
  };
}

export interface DefaulterStudent {
  student: {
    _id: string;
    name: string;
    email: string;
    rollNumber?: number;
  };
  totalSessions: number;
  present: number;
  absent: number;
  half_day: number;
  leave: number;
  effectiveAttended: number;
  percentage: number;
}

export interface DefaultersResponse {
  success: boolean;
  message: string;
  data: {
    classId: string;
    threshold: number;
    totalStudents: number;
    defaultersCount: number;
    defaulters: DefaulterStudent[];
  };
}

export interface SlotAttendanceResponse {
  success: boolean;
  message: string;
  data: {
    slot: any;
    date: string;
    isMarked: boolean;
    recordsCount: number;
    records: AttendanceRecord[];
    enrolledStudents: Array<{
      _id: string;
      name: string;
      email: string;
      rollNumber?: number;
    }>;
  };
}

/**
 * Mark attendance for a whole class, one period, one date
 * POST /api/v1/attendance/mark
 */
export const markAttendance = async (payload: MarkAttendancePayload) => {
  const response = await axiosClient.post<{
    success: boolean;
    message: string;
    data: AttendanceRecord[];
  }>('/attendance/mark', payload);
  return response.data;
};

/**
 * Correct a single student's status
 * PATCH /api/v1/attendance/:id
 */
export const updateAttendance = async (
  id: string,
  status: AttendanceStatus
) => {
  const response = await axiosClient.patch<{
    success: boolean;
    message: string;
    data: AttendanceRecord;
  }>(`/attendance/${id}`, { status });
  return response.data;
};

/**
 * Get student's attendance records with optional subject and date filters
 * GET /api/v1/attendance/student/:studentId
 */
export const getStudentAttendance = async (
  studentId: string,
  params?: { subjectId?: string; from?: string; to?: string }
) => {
  const response = await axiosClient.get<{
    success: boolean;
    message: string;
    data: AttendanceRecord[];
  }>(`/attendance/student/${studentId}`, { params });
  return response.data;
};

/**
 * Computed overall % and subject-wise %
 * GET /api/v1/attendance/summary/:studentId
 */
export const getStudentSummary = async (studentId: string) => {
  const response = await axiosClient.get<AttendanceSummaryResponse>(
    `/attendance/summary/${studentId}`
  );
  return response.data;
};

/**
 * Students in a class below attendance threshold
 * GET /api/v1/attendance/defaulters?classId=&threshold=75
 */
export const getDefaulters = async (classId: string, threshold = 75) => {
  const response = await axiosClient.get<DefaultersResponse>(
    '/attendance/defaulters',
    { params: { classId, threshold } }
  );
  return response.data;
};

/**
 * Fetch an already-marked period's records (or load enrolled class students to mark)
 * GET /api/v1/attendance/slot/:timetableSlotId/date/:date
 */
export const getSlotAttendance = async (
  timetableSlotId: string,
  date: string
) => {
  const response = await axiosClient.get<SlotAttendanceResponse>(
    `/attendance/slot/${timetableSlotId}/date/${date}`
  );
  return response.data;
};
