// ============================================
// DevForge AI — Auth Store (Zustand)
// ============================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, accessToken, refreshToken) => {
        // Also store tokens separately for API interceptor
        sessionStorage.setItem('devforge_access_token', accessToken);
        sessionStorage.setItem('devforge_refresh_token', refreshToken);

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      updateUser: (updates) =>
        set((state) => {
          const defaultUser: User = {
            id: 'user-1',
            name: 'Pranav Aggarwal',
            email: 'pranavaggarwal.in@gmail.com',
            avatar: null,
            role: 'pro',
            isVerified: true,
            oauthProvider: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          const baseUser = state.user || defaultUser;
          const newUser = { ...baseUser, ...updates };
          return {
            user: newUser,
            isAuthenticated: true,
          };
        }),

      setLoading: (loading) =>
        set({ isLoading: loading }),

      logout: () => {
        // To maintain strict privacy, clear all session storage keys completely
        // so no projects, tokens, or ledger data leaks to the next user
        sessionStorage.clear();
        localStorage.clear(); // Also clear old local storage data just in case

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'devforge_auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
