"use client"

import { useEffect, useRef, useState } from "react"
import { Pause, Play, RotateCcw, X } from "lucide-react"
import { cn } from "@/lib/utils"

type RestTimerProps = {
  open: boolean
  onClose: () => void
}

const PRESETS = [60, 90] as const

export function RestTimer({ open, onClose }: RestTimerProps) {
  const [duration, setDuration] = useState<number>(60)
  const [remaining, setRemaining] = useState<number>(60)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Reset to a fresh 60s timer each time the overlay opens.
  useEffect(() => {
    if (open) {
      setDuration(60)
      setRemaining(60)
      setRunning(true)
    } else {
      setRunning(false)
    }
  }, [open])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false)
          // Light haptic feedback on supported Android devices.
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate([200, 100, 200])
          }
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  if (!open) return null

  const selectPreset = (seconds: number) => {
    setDuration(seconds)
    setRemaining(seconds)
    setRunning(true)
  }

  const progress = duration > 0 ? remaining / duration : 0
  const radius = 130
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)
  const finished = remaining === 0

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 px-6 backdrop-blur-sm">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close rest timer"
        className="absolute right-5 top-5 flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-5" />
      </button>

      <p className="mb-8 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Rest Timer</p>

      <div className="relative flex items-center justify-center">
        <svg width="300" height="300" viewBox="0 0 300 300" className="-rotate-90">
          <circle cx="150" cy="150" r={radius} fill="none" stroke="var(--muted)" strokeWidth="14" />
          <circle
            cx="150"
            cy="150"
            r={radius}
            fill="none"
            stroke={finished ? "var(--accent)" : "var(--primary)"}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s ease" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-6xl font-bold tabular-nums text-foreground">
            {mins}:{secs.toString().padStart(2, "0")}
          </span>
          <span className="mt-1 text-sm text-muted-foreground">{finished ? "Done — get back to it" : "remaining"}</span>
        </div>
      </div>

      {/* Presets */}
      <div className="mt-10 flex gap-3">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => selectPreset(p)}
            className={cn(
              "rounded-full border px-6 py-2.5 text-sm font-semibold transition-colors",
              duration === p
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground hover:border-primary/60",
            )}
          >
            {p}s
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setRunning((v) => !v)}
          disabled={finished}
          aria-label={running ? "Pause" : "Resume"}
          className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95 disabled:opacity-40 glow-primary"
        >
          {running ? <Pause className="size-6" /> : <Play className="size-6" />}
        </button>
        <button
          type="button"
          onClick={() => selectPreset(duration)}
          aria-label="Restart"
          className="flex size-14 items-center justify-center rounded-full border border-border text-foreground transition-transform active:scale-95"
        >
          <RotateCcw className="size-6" />
        </button>
      </div>
    </div>
  )
}
