"use client"

import { Dumbbell, History } from "lucide-react"
import { cn } from "@/lib/utils"

export type NavView = "dashboard" | "history"

const TABS: { view: NavView; label: string; icon: typeof Dumbbell }[] = [
  { view: "dashboard", label: "Workouts", icon: Dumbbell },
  { view: "history", label: "History", icon: History },
]

export function BottomNav({
  active,
  onNavigate,
}: {
  active: NavView
  onNavigate: (view: NavView) => void
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-4 pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => {
          const isActive = tab.view === active
          const Icon = tab.icon
          return (
            <button
              key={tab.view}
              type="button"
              onClick={() => onNavigate(tab.view)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-6" strokeWidth={2} aria-hidden />
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
