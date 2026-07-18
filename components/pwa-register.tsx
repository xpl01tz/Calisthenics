"use client"

import { useEffect } from "react"

/**
 * Registers the service worker so the app works offline once installed.
 *
 * IMPORTANT: the SW is intentionally skipped inside the v0 preview (which runs
 * in an iframe with hot-module-reloading) and during local dev. An offline
 * cache there serves stale JS chunks and makes cards / history appear to
 * randomly disappear until a hard reload. We also proactively tear down any
 * previously-installed worker + caches so anyone stuck in that state recovers.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator)) return

    const inIframe = window.self !== window.top
    const isLocalhost = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname)
    const isProd = process.env.NODE_ENV === "production"

    // Only run the offline worker for the real, installed app.
    const shouldRegister = isProd && !inIframe && !isLocalhost

    if (!shouldRegister) {
      // Clean up any stale worker + caches from earlier sessions.
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister())
      })
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)))
      }
      return
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.log("[v0] Service worker registration failed:", err)
      })
    }

    if (document.readyState === "complete") {
      register()
    } else {
      window.addEventListener("load", register)
      return () => window.removeEventListener("load", register)
    }
  }, [])

  return null
}
