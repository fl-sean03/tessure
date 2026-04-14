import Link from "next/link"

export const metadata = {
  title: "Terms — Tessure",
  description: "Terms of use for the Tessure marketing site.",
}

export default function TermsPage() {
  return (
    <main className="relative mx-auto max-w-3xl px-6 py-20 text-[#0f172a]">
      <Link href="/" className="text-sm font-medium text-[#1e40af] hover:text-[#1e3a8a]">
        ← Back to Tessure
      </Link>
      <h1 className="mt-8 text-4xl font-semibold tracking-tight">Terms of Use</h1>
      <p className="mt-3 text-sm text-[#64748b]">Last updated: April 14, 2026</p>

      <div className="prose prose-slate mt-10 max-w-none text-[#475569]">
        <p>
          This site is a public reference for <strong>Tessure Systems, Inc.</strong> concept and
          technical thesis. The concept is archived as of March 2026. No live product is being
          sold or serviced through this site.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-[#0f172a]">Use of content</h2>
        <p>
          The strategic thesis, product architecture, and brand system published on this site and
          in the associated{" "}
          <a
            href="https://github.com/fl-sean03/tessure"
            className="text-[#1e40af] hover:text-[#1e3a8a]"
          >
            GitHub repository
          </a>{" "}
          are shared publicly. If you are working in physical security or critical-infrastructure
          defense, the underlying thesis is free to build on. Attribution is appreciated but not
          required.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-[#0f172a]">No warranty, no obligation</h2>
        <p>
          The content is provided "as is" for reference. No product, service, or support
          obligation exists. The "pilot request" call-to-action on this site routes to a personal
          email; it is not a commercial commitment.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-[#0f172a]">Contact</h2>
        <p>
          Questions:{" "}
          <a
            href="mailto:sean.florez@colorado.edu?subject=Tessure%20terms%20question"
            className="text-[#1e40af] hover:text-[#1e3a8a]"
          >
            sean.florez@colorado.edu
          </a>
          .
        </p>
      </div>
    </main>
  )
}
