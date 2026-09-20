import { axiosClient } from "./axiosClient";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
    success: boolean;
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    departmentId?: string;
  };
}

export const login = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  const response = await axiosClient.post<LoginResponse>(
    "/auth/login",
    payload
  );

  return response.data;
};