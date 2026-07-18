"use client"

import { useCallback, useEffect, useState } from "react"
import { ROUTINES, type Exercise, type Routine } from "@/lib/workouts"

const KEY = "pushup-tracker-routines-v1"

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function readRoutines(): Routine[] {
  if (typeof window === "undefined") return ROUTINES
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return ROUTINES
    const parsed = JSON.parse(raw) as Routine[]
    return Array.isArray(parsed) ? parsed : ROUTINES
  } catch {
    return ROUTINES
  }
}

function writeRoutines(routines: Routine[]) {
  window.localStorage.setItem(KEY, JSON.stringify(routines))
  // Keep every subscriber in the same tab in sync.
  window.dispatchEvent(new Event("routines-updated"))
}

export function createExercise(): Exercise {
  return { id: uid("ex"), name: "", note: "", type: "reps", sets: 3 }
}

export function createEmptyRoutine(): Routine {
  return {
    id: uid("routine"),
    day: "",
    title: "",
    focus: "",
    description: "",
    exercises: [createExercise()],
  }
}

/** Reactive routines store backed by localStorage, seeded with the defaults. */
export function useRoutines() {
  // Seed with the defaults so the first paint already shows cards (identical on
  // server + client, so no hydration mismatch); the effect then swaps in the
  // saved localStorage copy. This removes the empty "loading" flash.
  const [routines, setRoutines] = useState<Routine[]>(ROUTINES)
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(() => {
    setRoutines(readRoutines())
    setLoaded(true)
  }, [])

  useEffect(() => {
    // Seed defaults on first ever launch.
    if (typeof window !== "undefined" && window.localStorage.getItem(KEY) == null) {
      writeRoutines(ROUTINES)
    }
    refresh()
    window.addEventListener("routines-updated", refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener("routines-updated", refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [refresh])

  const saveRoutine = useCallback((routine: Routine) => {
    const current = readRoutines()
    const idx = current.findIndex((r) => r.id === routine.id)
    if (idx >= 0) {
      current[idx] = routine
      writeRoutines([...current])
    } else {
      writeRoutines([...current, routine])
    }
  }, [])

  const deleteRoutine = useCallback((id: string) => {
    writeRoutines(readRoutines().filter((r) => r.id !== id))
  }, [])

  // Persist a new card order given the ids in their desired sequence.
  const reorderRoutines = useCallback((orderedIds: string[]) => {
    const current = readRoutines()
    const byId = new Map(current.map((r) => [r.id, r]))
    const next: Routine[] = []
    for (const id of orderedIds) {
      const r = byId.get(id)
      if (r) next.push(r)
    }
    // Safety: keep any routine not covered by the id list.
    for (const r of current) if (!orderedIds.includes(r.id)) next.push(r)
    writeRoutines(next)
  }, [])

  return { routines, loaded, saveRoutine, deleteRoutine, reorderRoutines }
}
