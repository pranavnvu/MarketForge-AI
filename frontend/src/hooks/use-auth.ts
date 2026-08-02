// ============================================
// DevForge AI — Auth Hooks
// ============================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { ROUTES } from '@/lib/constants';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from '@/types';

// ---- Query Keys ----
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

// ---- Login ----
export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiClient.post<AuthResponse>('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate(ROUTES.DASHBOARD);
    },
  });
}

// ---- Register ----
export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await apiClient.post('/auth/register', data);
      return response.data;
    },
    onSuccess: () => {
      navigate(ROUTES.VERIFY_EMAIL);
    },
  });
}

// ---- Logout ----
export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      try {
        await apiClient.post('/auth/logout');
      } catch {
        // Logout even if API call fails
      }
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
      navigate(ROUTES.LOGIN);
    },
  });
}

// ---- Get Current User ----
export function useCurrentUser() {
  const { isAuthenticated, setAuth, setLoading } = useAuthStore();

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const response = await apiClient.get<{ data: User }>('/auth/me');
      return response.data.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    meta: {
      onSettled: () => setLoading(false),
    },
  });
}

// ---- Forgot Password ----
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    },
  });
}

// ---- Reset Password ----
export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const response = await apiClient.post('/auth/reset-password', data);
      return response.data;
    },
    onSuccess: () => {
      navigate(ROUTES.LOGIN);
    },
  });
}

// ---- Change Password ----
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const response = await apiClient.put('/auth/change-password', data);
      return response.data;
    },
  });
}

// ---- Update Profile ----
export function useUpdateProfile() {
  const updateUser = useAuthStore((s) => s.updateUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await apiClient.put('/auth/me', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      updateUser(variables);
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

// ---- Delete Account ----
export function useDeleteAccount() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await apiClient.delete('/auth/me');
    },
    onSuccess: () => {
      logout();
      navigate(ROUTES.HOME);
    },
  });
}
