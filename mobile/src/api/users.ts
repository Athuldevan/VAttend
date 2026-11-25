import { axiosClient } from "./axiosClient";

export interface TeacherOption {
  id: string;
  name: string;
  email: string;
  isActive?: boolean;
  primaryDepartment?: { id: string; name: string; code: string };
}
export interface CreatedTeacher extends TeacherOption {
  setupCode?: string;
  emailSent?: boolean;
}

export interface StudentItem {
  id: string;
  name: string;
  email: string;
  rollNumber: number;
  classId?: string;
  isActive: boolean;
}

interface TeachersResponse {
  success: boolean;
  message: string;
  data: TeacherOption[];
}

export const getTeachers = async (): Promise<TeachersResponse> => {
  const response = await axiosClient.get<TeachersResponse>("/users/teachers");
  return response.data;
};

export const createTeacher = async (payload: {
  name: string;
  email: string;
}): Promise<CreatedTeacher> => {
  const response = await axiosClient.post<{ data: CreatedTeacher }>(
    "/users/teachers",
    payload,
  );
  return response.data.data;
};

export const updateTeacher = async (id: string, payload: Partial<Pick<TeacherOption, 'name' | 'email' | 'isActive'>>) =>
  (await axiosClient.patch<{ data: TeacherOption }>(`/users/teachers/${id}`, payload)).data.data;
export const deleteTeacher = async (id: string) =>
  (await axiosClient.delete<{ data: TeacherOption }>(`/users/teachers/${id}`)).data.data;

export const getStudents = async (classId?: string): Promise<{ data: StudentItem[] }> => {
  const response = await axiosClient.get<{ data: StudentItem[] }>("/users/students", {
    params: classId ? { classId } : {},
  });
  return response.data;
};

export const createStudent = async (payload: {
  name: string;
  rollNumber: number;
  classId: string;
}): Promise<StudentItem> => {
  const response = await axiosClient.post<{ data: StudentItem }>("/users/students", payload);
  return response.data.data;
};

export const updateStudent = async (id: string, payload: Partial<Pick<StudentItem, 'name' | 'email' | 'rollNumber' | 'classId' | 'isActive'>>) => {
  const response = await axiosClient.patch<{ data: StudentItem }>(`/users/students/${id}`, payload);
  return response.data.data;
};

export const deleteStudent = async (id: string) => {
  const response = await axiosClient.delete<{ data: StudentItem }>(`/users/students/${id}`);
  return response.data.data;
};
