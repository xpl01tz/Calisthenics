import type { Session } from "./storage"

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

/**
 * Consecutive-day streak counting back from today. A session logged today or
 * yesterday keeps the streak alive; a fully missed day ends it.
 */
export function computeStreak(sessions: Session[]): number {
  if (sessions.length === 0) return 0
  const days = new Set(sessions.map((s) => dayKey(new Date(s.date))))

  const cursor = new Date()
  // Grace period: if nothing logged today yet, start counting from yesterday.
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  while (days.has(dayKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** A compact one-line performance summary used in the history table. */
export function summarizeSession(session: Session): string {
  let reps = 0
  let holdSeconds = 0
  for (const ex of session.exercises) {
    for (const v of ex.values) {
      if (v == null) continue
      if (ex.type === "hold") holdSeconds += v
      else reps += v
    }
  }
  const parts: string[] = []
  if (reps > 0) parts.push(`${reps} reps`)
  if (holdSeconds > 0) parts.push(`${holdSeconds}s hold`)
  return parts.length > 0 ? parts.join(" · ") : "—"
}
