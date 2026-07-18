"use client"

import { useEffect, useState } from "react"
import { Check, ChevronDown, Minus, Plus, Trash2, X } from "lucide-react"
import { DAYS_OF_WEEK, type Exercise, type ExerciseType, type Routine } from "@/lib/workouts"
import { createExercise } from "@/lib/routines-store"
import { cn } from "@/lib/utils"

type Props = {
  routine: Routine
  isNew: boolean
  onClose: () => void
  onSave: (routine: Routine) => void
  onDelete: (id: string) => void
}

export function RoutineEditor({ routine, isNew, onClose, onSave, onDelete }: Props) {
  const [day, setDay] = useState(routine.day)
  const [title, setTitle] = useState(routine.title)
  const [focus, setFocus] = useState(routine.focus)
  const [exercises, setExercises] = useState<Exercise[]>(routine.exercises)

  // Lock background scroll while the sheet is open.
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  const updateExercise = (id: string, patch: Partial<Exercise>) => {
    setExercises((prev) => prev.map((ex) => (ex.id === id ? { ...ex, ...patch } : ex)))
  }

  const addExercise = () => setExercises((prev) => [...prev, createExercise()])
  const removeExercise = (id: string) => setExercises((prev) => prev.filter((ex) => ex.id !== id))

  const canSave = title.trim().length > 0 && exercises.some((ex) => ex.name.trim().length > 0)

  const handleSave = () => {
    if (!canSave) return
    const cleaned = exercises
      .filter((ex) => ex.name.trim().length > 0)
      .map((ex) => ({ ...ex, name: ex.name.trim(), note: ex.note.trim() }))
    onSave({
      ...routine,
      day: day.trim() || "Custom",
      title: title.trim(),
      focus: focus.trim() || "Custom routine",
      description: focus.trim() || routine.description || "Your custom workout.",
      exercises: cleaned,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={isNew ? "Create workout day" : "Edit workout day"}
      onClick={onClose}
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-border bg-card sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold text-card-foreground">
            {isNew ? "New Workout Day" : "Edit Workout"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="flex flex-col gap-4">
            <Field label="Day of week" hint="pick a day">
              <div className="relative">
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className={cn(
                    inputClass,
                    "appearance-none pr-10",
                    day === "" && "text-muted-foreground/60",
                  )}
                >
                  <option value="" disabled>
                    Select a day
                  </option>
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d} className="text-foreground">
                      {d}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </Field>
            <Field label="Workout name" hint="e.g. Leg Day">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Leg Day"
                className={inputClass}
              />
            </Field>
            <Field label="Focus" hint="short subtitle">
              <input
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="Strength & Control"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">Exercises</h3>
            <span className="text-xs text-muted-foreground">{exercises.length} total</span>
          </div>

          <div className="mt-3 flex flex-col gap-3">
            {exercises.map((ex, i) => (
              <div key={ex.id} className="rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Exercise {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeExercise(ex.id)}
                    disabled={exercises.length === 1}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-destructive disabled:opacity-30"
                    aria-label={`Remove exercise ${i + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <input
                  value={ex.name}
                  onChange={(e) => updateExercise(ex.id, { name: e.target.value })}
                  placeholder="Exercise name"
                  className={cn(inputClass, "mt-2")}
                />
                <input
                  value={ex.note}
                  onChange={(e) => updateExercise(ex.id, { note: e.target.value })}
                  placeholder="Cue / note (optional)"
                  className={cn(inputClass, "mt-2 text-sm")}
                />

                <div className="mt-3 flex items-center gap-3">
                  {/* Type toggle */}
                  <div className="flex overflow-hidden rounded-lg border border-border">
                    {(["reps", "hold"] as ExerciseType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => updateExercise(ex.id, { type: t })}
                        className={cn(
                          "px-3 py-2 text-xs font-semibold transition-colors",
                          ex.type === t
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {t === "reps" ? "Reps" : "Hold"}
                      </button>
                    ))}
                  </div>

                  {/* Sets stepper */}
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Sets</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateExercise(ex.id, { sets: Math.max(1, ex.sets - 1) })}
                        className="flex size-8 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:border-primary/60"
                        aria-label="Decrease sets"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="w-6 text-center font-mono text-sm tabular-nums text-foreground">{ex.sets}</span>
                      <button
                        type="button"
                        onClick={() => updateExercise(ex.id, { sets: Math.min(6, ex.sets + 1) })}
                        className="flex size-8 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:border-primary/60"
                        aria-label="Increase sets"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addExercise}
              className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
            >
              <Plus className="size-4" />
              Add exercise
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-3 border-t border-border px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          {!isNew && (
            <button
              type="button"
              onClick={() => {
                onDelete(routine.id)
                onClose()
              }}
              className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-destructive/60 hover:text-destructive"
              aria-label="Delete workout day"
            >
              <Trash2 className="size-5" />
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-base font-bold text-primary-foreground transition-all active:scale-[0.99] disabled:opacity-40"
          >
            <Check className="size-5" />
            {isNew ? "Create Workout" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputClass =
  "h-11 w-full rounded-xl border border-input bg-background px-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/30"

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </span>
      {children}
    </label>
  )
}
