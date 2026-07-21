"use client"

import { useEffect, useState } from "react"
import { subscribeExitToast } from "@/lib/back-nav"

export function ExitToast() {
  const [show, setShow] = useState(false)

  useEffect(() => subscribeExitToast(setShow), [])

  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-5 transition-all duration-200 ${
        show ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <div className="rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-card-foreground shadow-2xl">
        Press back again to exit
      </div>
    </div>
  )
}
