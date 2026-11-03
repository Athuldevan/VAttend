import { axiosClient } from './axiosClient';

export interface TimetableSlot {
  id: string;
  class:
    | string
    | {
        id?: string;
        _id?: string;
        academicYear?: string;
        year?: number;
        currentSemester?: number;
        programId?: string | { _id?: string; name?: string; level?: string };
      };
  semester: number;
  subject: string | { id?: string; _id?: string; name?: string; code?: string };
  teacher: string | { id?: string; _id?: string; name?: string; email?: string };
  dayOfWeek: number; // 0=Sunday, 1=Monday ... 5=Friday
  period: number;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  department: string | { id?: string; _id?: string; name?: string; code?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTimetablePayload {
  class: string;
  semester: number;
  subject: string;
  teacher: string;
  dayOfWeek: number;
  period: number;
  startTime: string;
  endTime: string;
  department?: string;
}

export type UpdateTimetablePayload = Partial<CreateTimetablePayload>;

export interface TimetableListResponse {
  success: boolean;
  message: string;
  data: TimetableSlot[];
}

export interface TimetableResponse {
  success: boolean;
  message: string;
  data: TimetableSlot;
}

const normalizeSlot = (slot: any): TimetableSlot => ({
  id: typeof slot.id === 'string' ? slot.id : slot._id || '',
  class: slot.class,
  semester: slot.semester || 1,
  subject: slot.subject,
  teacher: slot.teacher,
  dayOfWeek: slot.dayOfWeek ?? 1,
  period: slot.period || 1,
  startTime: slot.startTime || '09:00',
  endTime: slot.endTime || '10:00',
  department: slot.department,
  createdAt: slot.createdAt,
  updatedAt: slot.updatedAt,
});

export const getMyTimetable = async (): Promise<TimetableListResponse> => {
  const response = await axiosClient.get<TimetableListResponse>('/timetable/me');
  return {
    ...response.data,
    data: (response.data.data || []).map(normalizeSlot),
  };
};

export const getClassTimetable = async (
  classId: string,
  semester?: number
): Promise<TimetableListResponse> => {
  const params: Record<string, any> = { classId };
  if (semester) params.semester = semester;
  const response = await axiosClient.get<TimetableListResponse>('/timetable', { params });
  return {
    ...response.data,
    data: (response.data.data || []).map(normalizeSlot),
  };
};

export const createTimetable = async (payload: CreateTimetablePayload): Promise<TimetableResponse> => {
  const response = await axiosClient.post<TimetableResponse>('/timetable', payload);
  return {
    ...response.data,
    data: normalizeSlot(response.data.data),
  };
};

export const updateTimetable = async (
  id: string,
  payload: UpdateTimetablePayload
): Promise<TimetableResponse> => {
  const response = await axiosClient.patch<TimetableResponse>(`/timetable/${id}`, payload);
  return {
    ...response.data,
    data: normalizeSlot(response.data.data),
  };
};

export const deleteTimetable = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await axiosClient.delete<{ success: boolean; message: string }>(`/timetable/${id}`);
  return response.data;
};
