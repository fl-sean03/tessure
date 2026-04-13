"use client"

import { useEffect } from "react"

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0A0F1C] text-white px-6">
      <div className="max-w-md text-center space-y-4">
        <p className="text-xs uppercase tracking-widest text-[#F59E0B]">System Fault</p>
        <h1 className="text-3xl font-semibold">Something went wrong.</h1>
        <p className="text-sm text-white/70">
          The scene failed to render. Reload to retry, or return to the home page.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-md bg-[#1E40AF] hover:bg-[#1E3A8A] text-sm font-medium transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-4 py-2 rounded-md border border-white/20 hover:border-white/40 text-sm font-medium transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </main>
  )
}
