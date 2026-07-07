import { createAuthClient } from "better-auth/react"

// Use the browser's current origin so auth always hits the same host you're
// browsing on. A stale NEXT_PUBLIC_APP_URL (e.g. expired ngrok) causes
// "Failed to fetch" when visiting localhost.
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL,
})

export const {
  signIn,
  signOut,
  useSession,
} = authClient