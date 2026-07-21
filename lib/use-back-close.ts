"use client"

import { useEffect, useRef } from "react"
import { closeBackLayer, pushBackLayer } from "@/lib/back-nav"

export function useBackClose(open: boolean, onClose: () => void) {
  const openRef = useRef(false)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (open && !openRef.current) {
      openRef.current = true
      pushBackLayer(() => {
        openRef.current = false
        onCloseRef.current()
      })
    } else if (!open && openRef.current) {
      openRef.current = false
      closeBackLayer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
}
