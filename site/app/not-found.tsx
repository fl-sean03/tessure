import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0A0F1C] text-white px-6">
      <div className="max-w-md text-center space-y-4">
        <p className="text-xs uppercase tracking-widest text-[#F59E0B]">404</p>
        <h1 className="text-3xl font-semibold">Page not found.</h1>
        <p className="text-sm text-white/70">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-block px-4 py-2 rounded-md bg-[#1E40AF] hover:bg-[#1E3A8A] text-sm font-medium transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
