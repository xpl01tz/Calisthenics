"use client"

import { useCallback, useEffect, useState } from "react"
import type { ExerciseType } from "@/lib/workouts"

const STORAGE_KEY = "pushup-tracker-sessions-v1"

export type LoggedExercise = {
  id: string
  name: string
  type: ExerciseType
  values: (number | null)[]
}

export type Session = {
  id: string
  date: string // ISO date string
  routineId: string
  routineTitle: string
  routineDay: string
  exercises: LoggedExercise[]
}

function readSessions(): Session[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Session[]
  } catch {
    return []
  }
}

function writeSessions(sessions: Session[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  // Notify listeners in the same tab
  window.dispatchEvent(new Event("sessions-updated"))
}

export function saveSession(session: Session) {
  const sessions = readSessions()
  writeSessions([session, ...sessions])
}

export function deleteSession(id: string) {
  const sessions = readSessions().filter((s) => s.id !== id)
  writeSessions(sessions)
}

/** Reactive hook that stays in sync across the app. */
export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(() => {
    setSessions(readSessions())
    setLoaded(true)
  }, [])

  useEffect(() => {
    refresh()
    window.addEventListener("sessions-updated", refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener("sessions-updated", refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [refresh])

  return { sessions, loaded }
}

/** Most recent logged values for a routine, keyed by exercise id. */
export function useLastSession(routineId: string) {
  const { sessions, loaded } = useSessions()
  const last = sessions.find((s) => s.routineId === routineId)
  return { last, loaded }
}
