import { darkTheme, lightTheme } from '@/ui/theme';
import { AppTheme } from '@/ui/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const syncDocumentTheme = (mode: ThemeMode): void => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.setAttribute('data-theme', mode);
  root.setAttribute('data-ds-theme', mode);
  root.style.colorScheme = mode;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      setMode: (mode) => {
        syncDocumentTheme(mode);
        set({ mode });
      },
      toggleTheme: () => {
        set((state) => {
          const nextMode: ThemeMode = state.mode === 'light' ? 'dark' : 'light';
          syncDocumentTheme(nextMode);
          return { mode: nextMode };
        });
      },
    }),
    {
      name: 'ds-app-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          syncDocumentTheme(state.mode);
        }
      },
    }
  )
);

export interface UseThemeReturn {
  theme: AppTheme;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useTheme = (): UseThemeReturn => {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const theme: AppTheme = mode === 'dark' ? darkTheme : lightTheme;

  return {
    theme,
    mode,
    isDark: mode === 'dark',
    setMode,
    toggleTheme,
  };
};
