import { axiosClient } from "./axiosClient";

export interface TeacherOption {
  id: string;
  name: string;
  email: string;
}
export interface CreatedTeacher extends TeacherOption {
  setupCode?: string;
  emailSent?: boolean;
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
