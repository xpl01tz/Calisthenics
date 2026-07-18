"use client"

import { useEffect } from "react"
import { Trash2, X } from "lucide-react"

type Props = {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-xs rounded-3xl border border-border bg-card p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
          <Trash2 className="size-6" />
        </div>
        <h2 className="text-lg font-bold text-card-foreground text-balance">{title}</h2>
        {description ? <p className="mt-1.5 text-sm text-muted-foreground text-pretty">{description}</p> : null}

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-destructive text-base font-bold text-destructive-foreground transition-transform active:scale-[0.99]"
          >
            <Trash2 className="size-5" />
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border text-base font-semibold text-foreground transition-colors hover:border-primary/50"
          >
            <X className="size-5" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
