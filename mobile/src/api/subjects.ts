import { axiosClient } from './axiosClient';

export interface SubjectOption {
  id: string;
  name: string;
  code?: string;
  semester?: number;
}

interface SubjectsResponse {
  success: boolean;
  message: string;
  data: SubjectOption[];
}

export const getSubjects = async (semester?: number): Promise<SubjectsResponse> => {
  const params = semester ? { semester } : undefined;
  const response = await axiosClient.get<SubjectsResponse>('/subjects', { params });
  return response.data;
};

export const createSubject = async (payload: { name: string; semester: number; departmentId: string }): Promise<SubjectOption> => {
  const response = await axiosClient.post<{ data: SubjectOption }>('/subjects', payload);
  return response.data.data;
};

export const updateSubject = async (id: string, payload: Partial<Omit<SubjectOption, 'id'>>) => (await axiosClient.patch<{ data: SubjectOption }>(`/subjects/${id}`, payload)).data.data;
export const deleteSubject = async (id: string) => (await axiosClient.delete(`/subjects/${id}`)).data;
