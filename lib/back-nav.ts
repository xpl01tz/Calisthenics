"use client"

type CloseHandler = () => void

const EXIT_WINDOW_MS = 2000

const stack: CloseHandler[] = []
let initialized = false
let exitArmed = false
let exitTimer: ReturnType<typeof setTimeout> | null = null
const toastListeners = new Set<(show: boolean) => void>()

function notifyToast(show: boolean) {
  toastListeners.forEach((fn) => fn(show))
}

function handlePopState() {
  const handler = stack.pop()
  if (handler) {
    handler()
    return
  }

  if (exitArmed) {
    exitArmed = false
    notifyToast(false)
    if (exitTimer) clearTimeout(exitTimer)
    return
  }

  exitArmed = true
  notifyToast(true)
  window.history.pushState({ appRoot: true }, "")
  exitTimer = setTimeout(() => {
    exitArmed = false
    notifyToast(false)
  }, EXIT_WINDOW_MS)
}

export function initBackNavigation() {
  if (initialized) return
  initialized = true
  window.history.pushState({ appRoot: true }, "")
  window.addEventListener("popstate", handlePopState)
}

export function subscribeExitToast(fn: (show: boolean) => void) {
  toastListeners.add(fn)
  return () => toastListeners.delete(fn)
}

export function pushBackLayer(onClose: CloseHandler) {
  window.history.pushState({ appLayer: true }, "")
  stack.push(onClose)
}

export function closeBackLayer() {
  if (stack.length > 0) {
    window.history.back()
  }
}
