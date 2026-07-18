"use client"

import { useState } from "react"
import { ChevronRight, Dumbbell, History as HistoryIcon, Trash2 } from "lucide-react"
import { deleteSession, useSessions } from "@/lib/storage"
import { summarizeSession } from "@/lib/stats"
import { cn } from "@/lib/utils"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function formatFull(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
}

export function HistoryView() {
  const { sessions, loaded } = useSessions()
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggle = (id: string) => setExpanded((cur) => (cur === id ? null : id))

  const isEmpty = loaded && sessions.length === 0

  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 pb-24 pt-8">
      <header className="mb-6">
        <div className="flex items-center gap-2 text-primary">
          <HistoryIcon className="size-5" />
          <span className="text-sm font-semibold uppercase tracking-widest">Progress Log</span>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance">Your history</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tap a row to see every set and beat your last numbers.</p>
      </header>

      {/* Empty state — no table until the first session is logged */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Dumbbell className="size-6" />
          </div>
          <p className="text-base font-semibold text-card-foreground">No sessions yet</p>
          <p className="mt-1 text-pretty text-sm text-muted-foreground">
            Start a workout and your logged numbers will show up here.
          </p>
        </div>
      )}

      {/* Table — only rendered once there is data */}
      {sessions.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 border-b border-border bg-secondary/40 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Date</span>
            <span>Routine</span>
            <span className="text-right">Performance</span>
          </div>

          <ul>
            {sessions.map((session) => {
              const isOpen = expanded === session.id
              return (
                <li key={session.id} className="border-b border-border last:border-b-0">
                  <div className="flex items-stretch">
                    <button
                      type="button"
                      onClick={() => toggle(session.id)}
                      aria-expanded={isOpen}
                      className="grid flex-1 grid-cols-[4.5rem_1fr_auto] items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/30"
                    >
                      <span className="font-sans text-sm tabular-nums text-foreground">{formatDate(session.date)}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-card-foreground">
                          {session.routineDay || session.routineTitle}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">{session.routineTitle}</span>
                      </span>
                      <span className="flex items-center justify-end gap-1.5 text-right">
                        <span className="font-sans text-xs tabular-nums text-primary">{summarizeSession(session)}</span>
                        <ChevronRight
                          className={cn(
                            "size-4 shrink-0 text-muted-foreground transition-transform",
                            isOpen && "rotate-90",
                          )}
                        />
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSession(session.id)}
                      className="flex w-11 shrink-0 items-center justify-center border-l border-border text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                      aria-label={`Delete ${session.routineDay || session.routineTitle} session from ${formatDate(session.date)}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="bg-background/60 px-4 pb-4 pt-1">
                      <p className="mb-3 text-xs text-muted-foreground">
                        {formatFull(session.date)} · {formatTime(session.date)}
                      </p>
                      <ul className="flex flex-col gap-2.5">
                        {session.exercises.map((ex) => {
                          const done = ex.values.filter((v) => v != null)
                          if (done.length === 0) return null
                          return (
                            <li key={ex.id} className="flex items-center justify-between gap-3">
                              <span className="min-w-0 truncate text-sm text-foreground">{ex.name}</span>
                              <div className="flex flex-wrap items-center justify-end gap-1.5">
                                {ex.values.map((v, i) => (
                                  <span
                                    key={i}
                                    className="rounded-md bg-secondary px-2 py-0.5 font-sans text-xs tabular-nums text-secondary-foreground"
                                  >
                                    {v ?? "–"}
                                    {ex.type === "hold" && v != null ? "s" : ""}
                                  </span>
                                ))}
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </main>
  )
}
