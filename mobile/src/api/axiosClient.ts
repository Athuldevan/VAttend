import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Your machine's Wi-Fi LAN IP (for Expo Go on physical devices)
// Change this if your Wi-Fi network or IP changes.
const BASE_URL = 'http://10.55.171.82:4000/api/v1';

export const API_BASE_URL = BASE_URL;

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export let onUnauthorizedCallback: (() => void) | null = null;
export const setOnUnauthorized = (cb: () => void) => {
  onUnauthorizedCallback = cb;
};

// ─── Token helpers ──────────────────────────────────────
export const TOKEN_KEY = 'ams_access_token';
export const REFRESH_KEY = 'ams_refresh_token';

export async function getStoredToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function storeToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

// ─── Request interceptor ─────────────────────────────────
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    console.log(`[Mobile API] Outgoing -> ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    const token = await getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log('[Mobile API] Request Config Error:', error);
    return Promise.reject(error);
  }
);

// ─── Response interceptor — auto-refresh on 401 ─────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => {
    console.log(`[Mobile API] Success <- ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    console.log(
      `[Mobile API] Error <- ${error.config?.url}:`,
      error.message,
      error.code,
      error.response?.status,
      error.response?.data,
    );
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
      const response = await axios.post<{
        success: boolean;
        message: string;
        data: { accessToken: string };
      }>(
        `${BASE_URL}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const newAccessToken = response.data?.data?.accessToken;
      if (!newAccessToken) throw new Error('Refresh response missing access token');

      await storeToken(newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      processQueue(null, newAccessToken);

      return axiosClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await clearTokens();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
