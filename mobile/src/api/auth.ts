import { axiosClient, storeToken, clearTokens } from './axiosClient';
import * as SecureStore from 'expo-secure-store';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
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
