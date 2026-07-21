"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarCheck, Check, Flame, GripVertical, Play, Plus, Settings, Trophy } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { getTodayName, type Routine } from "@/lib/workouts"
import { createEmptyRoutine } from "@/lib/routines-store"
import { useSessions } from "@/lib/storage"
import { computeStreak } from "@/lib/stats"
import { RoutineCard } from "@/components/routine-card"
import { RoutineEditor } from "@/components/routine-editor"
import { SettingsMenu } from "@/components/settings-menu"
import { useBackClose } from "@/lib/use-back-close"

type Props = {
  routines: Routine[]
  loaded: boolean
  onStart: (id: string) => void
  onSave: (routine: Routine) => void
  onDelete: (id: string) => void
  onReorder: (orderedIds: string[]) => void
}

export function Dashboard({ routines, loaded, onStart, onSave, onDelete, onReorder }: Props) {
  const [editing, setEditing] = useState<Routine | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [manageMode, setManageMode] = useState(false)
  const { sessions } = useSessions()

  const sensors = useSensors(
    // Small delay so a normal tap still edits, but a held drag reorders.
    useSensor(PointerSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Leaving an empty list or losing all cards exits manage mode automatically.
  useEffect(() => {
    if (manageMode && routines.length === 0) setManageMode(false)
  }, [manageMode, routines.length])

  useBackClose(editing !== null, () => setEditing(null))
  useBackClose(settingsOpen, () => setSettingsOpen(false))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = routines.findIndex((r) => r.id === active.id)
    const newIndex = routines.findIndex((r) => r.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const reordered = arrayMove(routines, oldIndex, newIndex)
    onReorder(reordered.map((r) => r.id))
  }

  const streak = useMemo(() => computeStreak(sessions), [sessions])

  // Real-world weekday read from the device clock, e.g. "Sunday".
  const today = useMemo(() => getTodayName(), [])

  // First routine scheduled for the actual day of the week → powers the
  // "Quickstart <Day> Workout" card at the top of the screen.
  const todayRoutine = useMemo(() => routines.find((r) => r.day === today) ?? null, [routines, today])

  // Most recent session whose routine still exists → fallback Quick-Start.
  const lastRoutine = useMemo(() => {
    for (const s of sessions) {
      const match = routines.find((r) => r.id === s.routineId)
      if (match) return match
    }
    return null
  }, [sessions, routines])

  const openNew = () => {
    setEditing(createEmptyRoutine())
    setIsNew(true)
  }

  const openEdit = (routine: Routine) => {
    setEditing(routine)
    setIsNew(false)
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 pb-24 pt-8">
      <header className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Flame className="size-5" />
              <span className="text-sm font-semibold uppercase tracking-widest">Push Program</span>
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance">Choose your session</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex size-11 items-center justify-center rounded-2xl border border-border text-foreground transition-colors hover:border-primary/60"
              aria-label="Open settings"
            >
              <Settings className="size-5" />
            </button>
            <button
              type="button"
              onClick={openNew}
              className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground glow-primary transition-transform active:scale-95"
              aria-label="Create new workout day"
            >
              <Plus className="size-6" />
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {manageMode
            ? "Drag the handle to reorder, or tap the trash to delete."
            : "Tap a card to edit, hold to rearrange or delete."}
        </p>
      </header>

      {/* Streak + progress snapshot */}
      <section className="mb-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Flame className="size-5" />
          </div>
          <div>
            <p className="font-sans text-2xl font-bold leading-none tabular-nums text-card-foreground">{streak}</p>
            <p className="mt-1 text-xs text-muted-foreground">day streak</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <Trophy className="size-5" />
          </div>
          <div>
            <p className="font-sans text-2xl font-bold leading-none tabular-nums text-card-foreground">
              {sessions.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">sessions</p>
          </div>
        </div>
      </section>

      {/* Today's scheduled workout — matched to the real weekday */}
      {todayRoutine ? (
        <button
          type="button"
          onClick={() => onStart(todayRoutine.id)}
          className="mb-8 flex w-full items-center justify-between gap-3 rounded-2xl border border-primary/60 bg-primary/15 px-5 py-4 text-left transition-colors hover:bg-primary/20 glow-primary"
        >
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              <CalendarCheck className="size-3.5" />
              Today · {today}
            </span>
            <span className="mt-1 block truncate text-lg font-bold text-foreground">
              Quickstart {today} Workout
            </span>
            <span className="mt-0.5 block truncate text-sm text-muted-foreground">{todayRoutine.title}</span>
          </span>
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Play className="size-5 translate-x-px" fill="currentColor" />
          </span>
        </button>
      ) : (
        lastRoutine && (
          <button
            type="button"
            onClick={() => onStart(lastRoutine.id)}
            className="mb-8 flex w-full items-center justify-between gap-3 rounded-2xl border border-primary/40 bg-primary/10 px-5 py-4 text-left transition-colors hover:bg-primary/15"
          >
            <span className="min-w-0">
              <span className="block text-xs font-semibold uppercase tracking-widest text-primary">Quick-Start</span>
              <span className="mt-0.5 block truncate text-base font-bold text-foreground">
                {lastRoutine.day || lastRoutine.title}
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">No workout set for {today}</span>
            </span>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground glow-primary">
              <Play className="size-5 translate-x-px" fill="currentColor" />
            </span>
          </button>
        )
      )}

      {/* Manage-mode banner with a Done button to exit */}
      {manageMode && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-primary/50 bg-primary/10 px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-primary">
            <GripVertical className="size-4" />
            Rearrange mode
          </span>
          <button
            type="button"
            onClick={() => setManageMode(false)}
            className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-transform active:scale-95"
          >
            <Check className="size-4" />
            Done
          </button>
        </div>
      )}

      <section className="flex flex-col gap-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={routines.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            {routines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                isToday={routine.day === today}
                manageMode={manageMode}
                onEnterManage={() => setManageMode(true)}
                onStart={onStart}
                onEdit={openEdit}
                onDelete={onDelete}
              />
            ))}
          </SortableContext>
        </DndContext>

        {loaded && routines.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No workout days yet.</p>
            <button
              type="button"
              onClick={openNew}
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              <Plus className="size-4" />
              Create your first day
            </button>
          </div>
        )}
      </section>

      {editing && (
        <RoutineEditor
          routine={editing}
          isNew={isNew}
          onClose={() => setEditing(null)}
          onSave={onSave}
          onDelete={onDelete}
        />
      )}

      <SettingsMenu open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </main>
  )
}
