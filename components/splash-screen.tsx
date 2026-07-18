"use client"

/**
 * Branded splash/loading screen shown on cold start (and briefly on every
 * launch so the app-open feels intentional, matching native app behavior).
 * Pure presentational — parent controls when it's mounted/faded out.
 */
export function SplashScreen({ fadingOut }: { fadingOut: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-background transition-opacity duration-500 ease-out ${
        fadingOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <svg
        width="88"
        height="88"
        viewBox="0 0 512 512"
        className="animate-pulse"
        style={{ filter: "drop-shadow(0 0 18px color-mix(in oklab, var(--primary) 55%, transparent))" }}
      >
        <rect width="512" height="512" rx="112" fill="var(--card)" />
        <g stroke="var(--primary)" strokeLinecap="round" fill="none">
          <line x1="178" y1="334" x2="334" y2="178" strokeWidth="88" />
          <line x1="238" y1="274" x2="256" y2="256" strokeWidth="48" />
          <line x1="256" y1="256" x2="274" y2="238" strokeWidth="48" />
          <line x1="151" y1="129" x2="209" y2="71" strokeWidth="136" />
          <line x1="103" y1="177" x2="151" y2="129" strokeWidth="96" />
          <line x1="303" y1="441" x2="361" y2="383" strokeWidth="136" />
          <line x1="361" y1="383" x2="409" y2="335" strokeWidth="96" />
        </g>
      </svg>

      <div className="flex flex-col items-center gap-1">
        <span className="text-lg font-semibold tracking-tight text-foreground">Calisthenics</span>
        <span className="text-xs text-muted-foreground">Workout Tracker</span>
      </div>

      <div className="mt-2 h-1 w-28 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/3 animate-[loading-bar_1.1s_ease-in-out_infinite] rounded-full glow-primary bg-primary" />
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(150%); }
        }
      `}</style>
    </div>
  )
}
