import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Calisthenics : Workout Tracker",
    short_name: "Calisthenics",
    description: "Track calisthenics workouts, rest, and progressive overload.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0e0f12",
    theme_color: "#0e0f12",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
