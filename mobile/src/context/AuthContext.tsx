import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, registerWithDepartment as apiRegisterWithDepartment, logout as apiLogout, getStoredUser, type User, type LoginPayload, type RegisterPayload, type RegisterWithDepartmentPayload } from '../api/auth';
import { getStoredToken } from '../api/axiosClient';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  registerWithDepartment: (payload: RegisterWithDepartmentPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing session on mount
  useEffect(() => {
    (async () => {
      try {
        const [token, user] = await Promise.all([getStoredToken(), getStoredUser()]);
        if (token && user) {
          setState({ user, isAuthenticated: true, isLoading: false });
        } else {
          setState({ user: null, isAuthenticated: false, isLoading: false });
        }
      } catch {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    })();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { data } = await apiLogin(payload);
    setState({
      user: data.user,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { data } = await apiRegister(payload);
    setState({
      user: data.user,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const registerWithDepartment = useCallback(async (payload: RegisterWithDepartmentPayload) => {
    const { data } = await apiRegisterWithDepartment(payload);
    setState({ user: data.user, isAuthenticated: true, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, registerWithDepartment, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
