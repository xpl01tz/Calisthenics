"use client"

import { useRef, useState } from "react"
import { ChevronRight, Dumbbell, GripVertical, Trash2 } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Routine } from "@/lib/workouts"
import { useLastSession } from "@/lib/storage"
import { useLongPress } from "@/lib/use-long-press"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { cn } from "@/lib/utils"

type Props = {
  routine: Routine
  isToday?: boolean
  manageMode: boolean
  onEnterManage: () => void
  onStart: (id: string) => void
  onEdit: (routine: Routine) => void
  onDelete: (id: string) => void
}

export function RoutineCard({
  routine,
  isToday,
  manageMode,
  onEnterManage,
  onStart,
  onEdit,
  onDelete,
}: Props) {
  const { last } = useLastSession(routine.id)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Long-press the card (in normal mode) to enter the reorder/delete manager.
  // The ref lets us swallow the click that fires when the finger lifts, so a
  // long-press opens the manager without also opening the editor.
  const longPressedRef = useRef(false)
  const longPress = useLongPress(() => {
    longPressedRef.current = true
    onEnterManage()
  })

  // Tapping anywhere on the card (outside the Start / handle / delete buttons)
  // opens the editor in normal mode.
  const handleCardClick = () => {
    if (manageMode) return
    if (longPressedRef.current) {
      longPressedRef.current = false
      return
    }
    onEdit(routine)
  }

  // Sortable wiring — only active while managing.
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: routine.id,
    disabled: !manageMode,
  })

  const lastDone = last
    ? new Date(last.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      role={manageMode ? undefined : "button"}
      tabIndex={manageMode ? undefined : 0}
      aria-label={manageMode ? undefined : `Edit ${routine.day} ${routine.title}`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (manageMode) return
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onEdit(routine)
        }
      }}
      className={cn(
        "relative select-none rounded-2xl border bg-card transition-colors",
        isToday ? "border-primary/60 glow-primary" : "border-border",
        !manageMode && "cursor-pointer hover:border-primary/50",
        isDragging && "z-10 opacity-90 shadow-2xl",
      )}
      {...(manageMode ? {} : longPress)}
    >
      <div className="flex items-stretch">
        {/* Drag handle (Samsung Music style) — only shown while managing */}
        {manageMode && (
          <button
            type="button"
            className="flex shrink-0 cursor-grab touch-none items-center rounded-l-2xl px-3 text-primary active:cursor-grabbing"
            aria-label={`Hold and drag to reorder ${routine.title}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-6" />
          </button>
        )}

        {/* Card body — the whole card is tappable to edit (handled on the
            outer container), so this is just layout. */}
        <div className={cn("block min-w-0 flex-1 p-5 text-left", manageMode && "cursor-default")}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                {routine.day}
                {isToday ? (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                    Today
                  </span>
                ) : null}
              </p>
              <h2 className="mt-1 text-xl font-bold text-balance text-card-foreground">{routine.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{routine.focus}</p>
            </div>
            {!manageMode && (
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Dumbbell className="size-5" />
              </span>
            )}
          </div>
        </div>

        {/* Delete — only shown while managing */}
        {manageMode && (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="flex shrink-0 items-center rounded-r-2xl px-4 text-destructive transition-transform active:scale-90"
            aria-label={`Delete ${routine.title}`}
          >
            <Trash2 className="size-5" />
          </button>
        )}
      </div>

      {/* Footer with exercise count + Start — hidden while managing */}
      {!manageMode && (
        <>
          <hr className="border-border" />
          <div className="flex items-center justify-between gap-3 p-5">
            <span className="min-w-0 text-sm text-muted-foreground">
              {routine.exercises.length} exercises
              {lastDone ? <span className="text-foreground"> · last {lastDone}</span> : null}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onStart(routine.id)
              }}
              className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-transform active:scale-[0.97]"
            >
              Start
              <ChevronRight className="size-4" />
            </button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Routine?"
        description={`"${routine.title}" and its exercises will be removed. This can't be undone.`}
        confirmLabel="Delete Routine"
        onConfirm={() => {
          setConfirmOpen(false)
          onDelete(routine.id)
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
