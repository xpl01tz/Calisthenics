"use client"

import { useCallback, useEffect, useState } from "react"

const KEY = "pushup-tracker-theme"

export type Theme = "dark" | "light"

/** Reads the stored theme (defaults to dark) and keeps <html> in sync. */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark")

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(KEY) as Theme | null
      if (stored === "light" || stored === "dark") setThemeState(stored)
    } catch {
      /* ignore */
    }
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    try {
      window.localStorage.setItem(KEY, next)
    } catch {
      /* ignore */
    }
    // Color-scheme is driven by CSS (:root / .dark); we only toggle the class.
    document.documentElement.classList.toggle("dark", next === "dark")
  }, [])

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
  }, [theme, setTheme])

  return { theme, setTheme, toggle }
}
