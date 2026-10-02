import { axiosClient } from './axiosClient';

export interface Program {
  id: string;
  departmentId: string;
  name: string;
  level: 'UG' | 'PG';
  durationYears: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProgramPayload {
  departmentId: string;
  name: string;
  level: 'UG' | 'PG';
  durationYears: number;
}

export type UpdateProgramPayload = Partial<CreateProgramPayload>;

export interface ProgramResponse {
  success: boolean;
  message: string;
  data: Program;
}

export interface ProgramsListResponse {
  success: boolean;
  message: string;
  data: Program[];
}

const normalizeProgram = (item: any): Program => ({
  id: typeof item.id === 'string' ? item.id : item._id || '',
  departmentId: typeof item.departmentId === 'string' ? item.departmentId : item.departmentId?._id || item.departmentId?.id || '',
  name: item.name || '',
  level: item.level || 'UG',
  durationYears: item.durationYears || 3,
  createdAt: item.createdAt || '',
  updatedAt: item.updatedAt || '',
});

export const getPrograms = async (departmentId?: string): Promise<ProgramsListResponse> => {
  const params = departmentId ? { departmentId } : {};
  const response = await axiosClient.get<ProgramsListResponse>('/programs', { params });
  return {
    ...response.data,
    data: (response.data.data || []).map(normalizeProgram),
  };
};

export const getProgramById = async (id: string): Promise<ProgramResponse> => {
  const response = await axiosClient.get<ProgramResponse>(`/programs/${id}`);
  return {
    ...response.data,
    data: normalizeProgram(response.data.data),
  };
};

export const createProgram = async (payload: CreateProgramPayload): Promise<ProgramResponse> => {
  const response = await axiosClient.post<ProgramResponse>('/programs', payload);
  return {
    ...response.data,
    data: normalizeProgram(response.data.data),
  };
};

export const updateProgram = async (id: string, payload: UpdateProgramPayload): Promise<ProgramResponse> => {
  const response = await axiosClient.patch<ProgramResponse>(`/programs/${id}`, payload);
  return {
    ...response.data,
    data: normalizeProgram(response.data.data),
  };
};

export const deleteProgram = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await axiosClient.delete<{ success: boolean; message: string }>(`/programs/${id}`);
  return response.data;
};
