"use client"

import { useEffect, useState } from "react"
import { useRoutines } from "@/lib/routines-store"
import { Dashboard } from "@/components/dashboard"
import { HistoryView } from "@/components/history-view"
import { WorkoutClient } from "@/components/workout-client"
import { BottomNav, type NavView } from "@/components/bottom-nav"
import { SplashScreen } from "@/components/splash-screen"
import { ExitToast } from "@/components/exit-toast"
import { initBackNavigation } from "@/lib/back-nav"
import { useBackClose } from "@/lib/use-back-close"

// Minimum time the splash stays up so app launch always feels intentional,
// even when local data loads instantly (avoids an imperceptible flash).
const MIN_SPLASH_MS = 700

export function HomeApp() {
  const { routines, loaded, saveRoutine, deleteRoutine, reorderRoutines } = useRoutines()
  const [view, setView] = useState<NavView>("dashboard")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)
  const [splashMounted, setSplashMounted] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), MIN_SPLASH_MS)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    initBackNavigation()
  }, [])
  const onNonDashboardScreen = activeId !== null || view === "history"
  useBackClose(onNonDashboardScreen, () => {
    if (activeId !== null) setActiveId(null)
    else setView("dashboard")
  })

  const showSplash = !loaded || !minTimeElapsed

  useEffect(() => {
    if (!showSplash && splashMounted) {
      // Let the fade-out transition finish before unmounting.
      const t = setTimeout(() => setSplashMounted(false), 500)
      return () => clearTimeout(t)
    }
  }, [showSplash, splashMounted])

  const active = activeId ? routines.find((r) => r.id === activeId) : null

  // Active workout swaps in instantly — no route change, no reload.
  if (active) {
    return (
      <>
        <WorkoutClient
          key={active.id}
          routine={active}
          onUpdateRoutine={saveRoutine}
          onBack={() => setActiveId(null)}
          onFinish={() => {
            setActiveId(null)
            setView("history")
          }}
        />
        {splashMounted && <SplashScreen fadingOut={showSplash === false} />}
      </>
    )
  }

  return (
    <>
      {view === "dashboard" ? (
        <Dashboard
          routines={routines}
          loaded={loaded}
          onStart={(id) => setActiveId(id)}
          onSave={saveRoutine}
          onDelete={deleteRoutine}
          onReorder={reorderRoutines}
        />
      ) : (
        <HistoryView />
      )}
      <BottomNav active={view} onNavigate={setView} />
            <ExitToast />
     
      {splashMounted && <SplashScreen fadingOut={showSplash === false} />}
    </>
  )
}
