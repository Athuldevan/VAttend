import { axiosClient } from "./axiosClient";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  data: {
    success: boolean;
    accessToken: string;
    user: {
      id: string;
      email: string;
      role: string;
      departmentId?: string;
    };
  };
}

export interface RefreshResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await axiosClient.post<LoginResponse>(
    "/auth/login",
    payload,
  );

  return response.data;
};

export const refreshTokens = async (): Promise<RefreshResponse> => {
  const response = await axiosClient.post<RefreshResponse>("/auth/refresh");
  return response.data;
};

