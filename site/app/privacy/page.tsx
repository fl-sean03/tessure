import Link from "next/link"

export const metadata = {
  title: "Privacy — Tessure",
  description: "Privacy posture for the Tessure marketing site and demo.",
}

export default function PrivacyPage() {
  return (
    <main className="relative mx-auto max-w-3xl px-6 py-20 text-[#0f172a]">
      <Link href="/" className="text-sm font-medium text-[#1e40af] hover:text-[#1e3a8a]">
        ← Back to Tessure
      </Link>
      <h1 className="mt-8 text-4xl font-semibold tracking-tight">Privacy</h1>
      <p className="mt-3 text-sm text-[#64748b]">Last updated: April 14, 2026</p>

      <div className="prose prose-slate mt-10 max-w-none text-[#475569]">
        <p>
          This site — <strong>v0-tessure.vercel.app</strong> — is the marketing and demo site
          for <strong>Tessure Systems, Inc.</strong>, an autonomous security fusion platform
          concept. As of April 2026 the concept is archived; Sean Florez is not actively
          developing the product. This site remains available as a public reference.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-[#0f172a]">What we collect on this site</h2>
        <p>
          Nothing beyond what your browser and our hosting provider log by default. Specifically:
        </p>
        <ul>
          <li>
            <strong>No analytics or tracking cookies.</strong> No PostHog, Plausible, Google
            Analytics, Meta Pixel, or third-party trackers run on these pages.
          </li>
          <li>
            <strong>No email or waitlist capture.</strong> No forms on this site collect personal
            information.
          </li>
          <li>
            <strong>Hosting logs.</strong> Vercel retains standard infrastructure logs (IP,
            timestamp, request path) for a limited period per their own privacy policy.
          </li>
          <li>
            <strong>Contact email.</strong> If you email{" "}
            <a
              href="mailto:sean.florez@colorado.edu"
              className="text-[#1e40af] hover:text-[#1e3a8a]"
            >
              sean.florez@colorado.edu
            </a>
            , your message is handled by the University of Colorado Boulder mail infrastructure
            under its own policy.
          </li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold text-[#0f172a]">About the product itself</h2>
        <p>
          The Tessure product architecture was designed privacy-first:
        </p>
        <ul>
          <li>Raw sensor data is processed on-site at the edge; it does not leave the facility.</li>
          <li>Identities are masked until an event is verified.</li>
          <li>Biometric features (face recognition, license-plate recognition) are opt-in per site, disabled by default.</li>
          <li>Evidence packages are cryptographically hashed and site-signed.</li>
        </ul>
        <p>
          See the{" "}
          <a href="https://github.com/fl-sean03/tessure/blob/main/specs/PRODUCT_ARCHITECTURE.md" className="text-[#1e40af] hover:text-[#1e3a8a]">
            product architecture spec
          </a>{" "}
          for detail.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-[#0f172a]">Questions</h2>
        <p>
          Questions about this page or the Tessure concept:{" "}
          <a
            href="mailto:sean.florez@colorado.edu?subject=Tessure%20privacy%20question"
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
