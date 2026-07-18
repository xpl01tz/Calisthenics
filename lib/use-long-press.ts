"use client"

import { useCallback, useRef } from "react"

type Options = {
  /** How long (ms) the press must be held to trigger. */
  delay?: number
  /** Movement (px) beyond which the press is cancelled (treated as a scroll/drag). */
  moveTolerance?: number
}

/**
 * Fires `onLongPress` after the user holds down on an element without moving.
 * Works for both touch and mouse. Returns props to spread onto the target.
 */
export function useLongPress(onLongPress: () => void, { delay = 450, moveTolerance = 10 }: Options = {}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  const fired = useRef(false)

  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
    start.current = null
  }, [])

  const begin = useCallback(
    (x: number, y: number) => {
      fired.current = false
      start.current = { x, y }
      timer.current = setTimeout(() => {
        fired.current = true
        onLongPress()
      }, delay)
    },
    [delay, onLongPress],
  )

  const maybeCancel = useCallback(
    (x: number, y: number) => {
      if (!start.current) return
      const dx = Math.abs(x - start.current.x)
      const dy = Math.abs(y - start.current.y)
      if (dx > moveTolerance || dy > moveTolerance) clear()
    },
    [clear, moveTolerance],
  )

  return {
    onPointerDown: (e: React.PointerEvent) => begin(e.clientX, e.clientY),
    onPointerMove: (e: React.PointerEvent) => maybeCancel(e.clientX, e.clientY),
    onPointerUp: clear,
    onPointerLeave: clear,
    onContextMenu: (e: React.MouseEvent) => {
      // Suppress the native context menu that some browsers raise on long-press.
      if (fired.current) e.preventDefault()
    },
  }
}
