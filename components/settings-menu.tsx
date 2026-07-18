"use client"

import { Moon, Sun, X } from "lucide-react"
import { useTheme, type Theme } from "@/lib/use-theme"
import { cn } from "@/lib/utils"

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
]

export function SettingsMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { theme, setTheme } = useTheme()

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-50 bg-black/60 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Slide-in panel */}
      <aside
        role="dialog"
        aria-label="Settings"
        aria-modal="true"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col border-l border-border bg-card shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold text-card-foreground">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Theme Selection
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-background p-1.5">
              {OPTIONS.map((opt) => {
                const Icon = opt.icon
                const selected = theme === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTheme(opt.value)}
                    aria-pressed={selected}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all",
                      selected
                        ? "bg-primary text-primary-foreground glow-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {opt.label}
                  </button>
                )
              })}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Your theme, routines, and logs are saved on this device and stay put after you refresh or reopen the app.
            </p>
          </section>
        </div>

        <div className="border-t border-border px-5 py-4">
          <p className="text-xs text-muted-foreground">Calisthenics : Workout Tracker · Local-first</p>
        </div>
      </aside>
    </>
  )
}
