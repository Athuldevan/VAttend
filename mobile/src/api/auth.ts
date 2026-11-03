import { axiosClient, storeToken, clearTokens } from './axiosClient';
import * as SecureStore from 'expo-secure-store';

export interface LoginPayload {
  email: string;
  password: string;
}

export type RegistrationRole = 'ADMIN' | 'TEACHER';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: RegistrationRole;
  departmentId: string;
}

export interface RegisterWithDepartmentPayload extends Omit<RegisterPayload, 'departmentId'> {
  department: { name: string; code: string };
}

export interface RegistrationDepartment {
  id: string;
  name: string;
  code: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  departmentId?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: User;
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
  const response = await axiosClient.post<LoginResponse>('/auth/login', payload);
  const { accessToken, user } = response.data.data;

  // Store tokens in secure storage
  if (accessToken) {
    await storeToken(accessToken);
  }
  // Store user data
  await SecureStore.setItemAsync('ams_user', JSON.stringify(user));

  return response.data;
};

export const register = async (payload: RegisterPayload): Promise<LoginResponse> => {
  const response = await axiosClient.post<LoginResponse>('/auth/register', payload);
  const { accessToken, user } = response.data.data;

  if (accessToken) await storeToken(accessToken);
  await SecureStore.setItemAsync('ams_user', JSON.stringify(user));

  return response.data;
};

export const registerWithDepartment = async (
  payload: RegisterWithDepartmentPayload,
): Promise<LoginResponse> => {
  const response = await axiosClient.post<LoginResponse>('/auth/register-with-department', payload);
  const { accessToken, user } = response.data.data;
  if (accessToken) await storeToken(accessToken);
  await SecureStore.setItemAsync('ams_user', JSON.stringify(user));
  return response.data;
};

export const getRegistrationDepartments = async (): Promise<RegistrationDepartment[]> => {
  const response = await axiosClient.get<{
    success: boolean;
    message: string;
    data: RegistrationDepartment[];
  }>('/auth/registration-departments');
  return response.data.data || [];
};

export const setPassword = async (payload: { email: string; password: string }) => {
  await axiosClient.post('/auth/set-password', payload);
};

export const logout = async (): Promise<void> => {
  await clearTokens();
  await SecureStore.deleteItemAsync('ams_user');
};

export const getStoredUser = async (): Promise<User | null> => {
  try {
    const userData = await SecureStore.getItemAsync('ams_user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};
