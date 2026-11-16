import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeStore {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => {
          const next: Theme = state.theme === 'light' ? 'dark' : 'light'
          applyTheme(next)
          return { theme: next }
        }),
      setTheme: (theme: Theme) => {
        applyTheme(theme)
        set({ theme })
      },
    }),
    {
      name: 'finance-tracker-theme',
      onRehydrateStorage: () => (state) => {
        // Re-apply the saved theme class on page load
        if (state) applyTheme(state.theme)
      },
    },
  ),
)
