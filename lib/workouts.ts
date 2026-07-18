export type ExerciseType = "reps" | "hold"

export type Exercise = {
  id: string
  name: string
  note: string
  type: ExerciseType
  sets: number
}

export type Routine = {
  id: string
  day: string
  title: string
  focus: string
  description: string
  exercises: Exercise[]
}

export const ROUTINES: Routine[] = [
  {
    id: "monday",
    day: "Monday",
    title: "Push-Up Focus",
    focus: "Foundation & Volume",
    description: "Build raw pushing strength with classic variations.",
    exercises: [
      { id: "standard", name: "Standard Push-Ups", note: "Chest to floor, full lockout", type: "reps", sets: 4 },
      { id: "wide", name: "Wide Push-Ups", note: "Hands wider than shoulders", type: "reps", sets: 3 },
      { id: "diamond", name: "Diamond Push-Ups", note: "Hands together under chest", type: "reps", sets: 3 },
      { id: "hold", name: "Bottom Hold", note: "Isometric hold at bottom", type: "hold", sets: 3 },
    ],
  },
  {
    id: "wednesday",
    day: "Wednesday",
    title: "Variation Focus",
    focus: "Angles & Control",
    description: "Hit new angles to target every part of the push.",
    exercises: [
      { id: "archer", name: "Archer Push-Ups", note: "Shift weight side to side", type: "reps", sets: 3 },
      { id: "decline", name: "Decline Push-Ups", note: "Feet elevated on a chair", type: "reps", sets: 3 },
      { id: "pseudo", name: "Pseudo Planche", note: "Hands by waist, lean forward", type: "reps", sets: 3 },
      { id: "hindu", name: "Hindu Push-Ups", note: "Flowing dive-bomber motion", type: "reps", sets: 3 },
    ],
  },
  {
    id: "friday",
    day: "Friday",
    title: "Intensity Focus",
    focus: "Power & Max Effort",
    description: "Explosive work and max-out sets for progressive overload.",
    exercises: [
      { id: "clap", name: "Explosive / Clap", note: "Push off the floor with power", type: "reps", sets: 4 },
      { id: "pike", name: "Pike Push-Ups", note: "Hips high, target shoulders", type: "reps", sets: 3 },
      { id: "tempo", name: "Tempo Push-Ups", note: "3s down, 1s up", type: "reps", sets: 3 },
      { id: "amrap", name: "Max Effort Set", note: "As many reps as possible", type: "reps", sets: 1 },
      { id: "plank", name: "Plank Hold", note: "Brace core, straight line", type: "hold", sets: 3 },
    ],
  },
]

export function getRoutine(id: string): Routine | undefined {
  return ROUTINES.find((r) => r.id === id)
}

/** Days of the week, Sunday first (matches JS Date.getDay() indexing). */
export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number]

/** The real-world weekday name for today, read from the device clock. */
export function getTodayName(): DayOfWeek {
  return DAYS_OF_WEEK[new Date().getDay()]
}
