"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, Check, ChevronsUpDown, Target, Timer, Trash2 } from "lucide-react"
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Exercise, Routine } from "@/lib/workouts"
import { saveSession, useLastSession, type LoggedExercise, type Session } from "@/lib/storage"
import { useLongPress } from "@/lib/use-long-press"
import { RestTimer } from "@/components/rest-timer"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { cn } from "@/lib/utils"

type Values = Record<string, (number | null)[]>

export function WorkoutClient({
  routine,
  onUpdateRoutine,
  onBack,
  onFinish,
}: {
  routine: Routine
  onUpdateRoutine: (routine: Routine) => void
  onBack: () => void
  onFinish: () => void
}) {
  const { last } = useLastSession(routine.id)
  const [timerOpen, setTimerOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  // Local, reorderable copy of the exercises for this session.
  const [exercises, setExercises] = useState<Exercise[]>(routine.exercises)
  const [pendingDelete, setPendingDelete] = useState<Exercise | null>(null)

  const [values, setValues] = useState<Values>(() => {
    const initial: Values = {}
    for (const ex of routine.exercises) {
      initial[ex.id] = Array.from({ length: ex.sets }, () => null)
    }
    return initial
  })

  const lastByExercise = useMemo(() => {
    const map: Record<string, LoggedExercise> = {}
    if (last) for (const ex of last.exercises) map[ex.id] = ex
    return map
  }, [last])

  // Dragging is only ever started from the dedicated handle (which is
  // `touch-none`), so we use a tiny distance constraint instead of a hold
  // delay. This means the handle grabs the instant you start moving it — no
  // holding required — while a plain tap still won't trigger an accidental
  // reorder. The keyboard sensor keeps it accessible.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const persist = (next: Exercise[]) => {
    setExercises(next)
    onUpdateRoutine({ ...routine, exercises: next })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = exercises.findIndex((e) => e.id === active.id)
    const newIndex = exercises.findIndex((e) => e.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    persist(arrayMove(exercises, oldIndex, newIndex))
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    const id = pendingDelete.id
    persist(exercises.filter((e) => e.id !== id))
    setValues((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setPendingDelete(null)
  }

  const setValue = (exId: string, index: number, raw: string) => {
    setSaved(false)
    setValues((prev) => {
      const next = [...prev[exId]]
      next[index] = raw === "" ? null : Math.max(0, Number.parseInt(raw, 10) || 0)
      return { ...prev, [exId]: next }
    })
  }

  const hasAnyValue = Object.values(values).some((arr) => arr.some((v) => v !== null))

  const handleSave = () => {
    const logged: LoggedExercise[] = exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      type: ex.type,
      values: values[ex.id] ?? [],
    }))
    const session: Session = {
      id: `${routine.id}-${Date.now()}`,
      date: new Date().toISOString(),
      routineId: routine.id,
      routineTitle: routine.title,
      routineDay: routine.day,
      exercises: logged,
    }
    saveSession(session)
    setSaved(true)
    setTimeout(onFinish, 650)
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 pb-40 pt-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary/60"
          aria-label="Back to workouts"
        >
          <ArrowLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => setTimerOpen(true)}
          className="flex items-center gap-2 rounded-full border border-primary/50 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          <Timer className="size-4" />
          Rest
        </button>
      </div>

      <header className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{routine.day}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-balance">{routine.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">{routine.description}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          Drag the <ChevronsUpDown className="inline size-3.5 align-text-bottom" /> handle to reorder · long-press a card
          to delete
        </p>
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={exercises.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          <section className="mt-6 flex flex-col gap-4">
            {exercises.map((ex) => (
              <SortableExercise
                key={ex.id}
                exercise={ex}
                values={values[ex.id] ?? []}
                prev={lastByExercise[ex.id]}
                onValue={setValue}
                onRequestDelete={() => setPendingDelete(ex)}
              />
            ))}
          </section>
        </SortableContext>
      </DndContext>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] backdrop-blur">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasAnyValue || saved}
            className={cn(
              "flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold transition-all active:scale-[0.99]",
              saved
                ? "bg-accent text-accent-foreground"
                : "bg-primary text-primary-foreground glow-primary disabled:opacity-40 disabled:shadow-none",
            )}
          >
            <Check className="size-5" />
            {saved ? "Saved!" : "Finish & Save Session"}
          </button>
        </div>
      </div>

      <RestTimer open={timerOpen} onClose={() => setTimerOpen(false)} />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete Exercise?"
        description={pendingDelete ? `"${pendingDelete.name}" will be removed from this workout.` : undefined}
        confirmLabel="Delete Exercise"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </main>
  )
}

function SortableExercise({
  exercise: ex,
  values,
  prev,
  onValue,
  onRequestDelete,
}: {
  exercise: Exercise
  values: (number | null)[]
  prev?: LoggedExercise
  onValue: (exId: string, index: number, raw: string) => void
  onRequestDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ex.id })
  const longPress = useLongPress(onRequestDelete)

  // The handle sits inside the card, so its press would otherwise bubble up and
  // start the card's long-press-to-delete timer. Swallow the bubble here so
  // grabbing the handle only ever reorders, never deletes.
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    listeners?.onPointerDown?.(e)
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...longPress}
      className={cn(
        "select-none rounded-2xl border border-border bg-card p-5",
        isDragging && "z-10 border-primary/60 opacity-90 shadow-lg glow-primary",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-card-foreground">{ex.name}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{ex.note}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="rounded-md bg-secondary px-2.5 py-1 font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-secondary-foreground">
            {ex.type === "reps" ? "reps" : "sec"}
          </span>
          {/* Samsung Music-style reorder handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            onPointerDown={handlePointerDown}
            className="flex size-9 cursor-grab touch-none items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary active:cursor-grabbing"
            aria-label={`Drag to reorder ${ex.name}`}
          >
            <ChevronsUpDown className="size-4" />
          </button>
        </div>
      </div>

      <hr className="my-4 border-border" />

      <div className="flex flex-col gap-2.5">
        {values.map((val, i) => {
          const prevVal = prev?.values?.[i]
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="w-14 shrink-0 text-sm font-medium text-muted-foreground">Set {i + 1}</span>
              <div className="relative flex-1">
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={val ?? ""}
                  onChange={(e) => onValue(ex.id, i, e.target.value)}
                  placeholder={prevVal != null ? `prev: ${prevVal}` : ex.type === "reps" ? "reps" : "sec"}
                  aria-label={`${ex.name} set ${i + 1} ${ex.type === "reps" ? "reps" : "seconds"}`}
                  className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base tabular-nums text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>
              {prevVal != null && (
                <span className="flex w-16 shrink-0 items-center justify-end gap-1 text-xs text-muted-foreground">
                  <Target className="size-3" />
                  {prevVal}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onRequestDelete}
        className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-destructive"
      >
        <Trash2 className="size-3.5" />
        Delete exercise
      </button>
    </article>
  )
}
