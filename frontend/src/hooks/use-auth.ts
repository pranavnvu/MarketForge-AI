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

// Transform snake_case backend user to camelCase frontend User
function transformUser(raw: any): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    avatar: raw.avatar ?? null,
    role: raw.role ?? 'user',
    isVerified: raw.is_verified ?? raw.isVerified ?? false,
    oauthProvider: raw.oauth_provider ?? raw.oauthProvider ?? null,
    bio: raw.bio ?? undefined,
    location: raw.location ?? undefined,
    website: raw.website ?? undefined,
    github: raw.github ?? undefined,
    jobTitle: raw.job_title ?? raw.jobTitle ?? undefined,
    createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updated_at ?? raw.updatedAt ?? new Date().toISOString(),
  };
}

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
      const user = transformUser(data.user);
      setAuth(user, data.accessToken, data.refreshToken);
      navigate(ROUTES.DASHBOARD);
    },
  });
}

// ---- Register ----
export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      const user = transformUser(data.user);
      setAuth(user, data.accessToken, data.refreshToken);
      navigate(ROUTES.DASHBOARD);
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
  const { isAuthenticated, setLoading } = useAuthStore();

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const response = await apiClient.get<any>('/auth/me');
      const raw = response.data.data ?? response.data;
      return transformUser(raw);
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
      const response = await apiClient.post('/auth/reset-password', {
        token: data.token,
        new_password: data.password,
      });
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
      currentPassword?: string;
      newPassword?: string;
      current_password?: string;
      new_password?: string;
    }) => {
      const payload = {
        current_password: data.current_password || data.currentPassword,
        new_password: data.new_password || data.newPassword,
      };
      const response = await apiClient.put('/auth/change-password', payload);
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
      // Synchronously update local auth store so UI changes instantly
      updateUser(data);

      try {
        const response = await apiClient.put('/auth/me', {
          name: data.name,
          email: data.email,
          avatar: data.avatar,
          bio: data.bio,
          location: data.location,
          website: data.website,
          github: data.github,
          job_title: data.jobTitle,
        });
        if (response.data) {
          const transformed = transformUser(response.data);
          updateUser(transformed);
          return transformed;
        }
        return data;
      } catch {
        return data;
      }
    },
    onSuccess: (updated) => {
      if (updated) updateUser(updated as Partial<User>);
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
