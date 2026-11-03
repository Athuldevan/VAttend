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

export const createSubject = async (payload: { name: string; semester: number }): Promise<SubjectOption> => {
  const response = await axiosClient.post<{ data: SubjectOption }>('/subjects', payload);
  return response.data.data;
};
