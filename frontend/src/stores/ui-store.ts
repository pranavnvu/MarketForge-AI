// ============================================
// DevForge AI — UI Store (Zustand)
// ============================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;

  // Theme
  theme: Theme;

  // Modals
  activeModal: string | null;

  // Command Palette
  isCommandPaletteOpen: boolean;

  // Notifications
  isNotificationPanelOpen: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  setTheme: (theme: Theme) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleNotificationPanel: () => void;
  setNotificationPanelOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Default state
      isSidebarOpen: true,
      isSidebarCollapsed: false,
      theme: 'dark',
      activeModal: null,
      isCommandPaletteOpen: false,
      isNotificationPanelOpen: false,

      // Sidebar
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) =>
        set({ isSidebarOpen: open }),
      toggleSidebarCollapse: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

      // Theme
      setTheme: (theme) => {
        const root = document.documentElement;
        if (theme === 'dark') {
          root.classList.add('dark');
        } else if (theme === 'light') {
          root.classList.remove('dark');
        } else {
          // System preference
          const prefersDark = window.matchMedia(
            '(prefers-color-scheme: dark)'
          ).matches;
          if (prefersDark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
        set({ theme });
      },

      // Modals
      openModal: (modalId) => set({ activeModal: modalId }),
      closeModal: () => set({ activeModal: null }),

      // Command Palette
      toggleCommandPalette: () =>
        set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
      setCommandPaletteOpen: (open) =>
        set({ isCommandPaletteOpen: open }),

      // Notifications
      toggleNotificationPanel: () =>
        set((state) => ({
          isNotificationPanelOpen: !state.isNotificationPanelOpen,
        })),
      setNotificationPanelOpen: (open) =>
        set({ isNotificationPanelOpen: open }),
    }),
    {
      name: 'devforge_ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    }
  )
);
