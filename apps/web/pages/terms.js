// pages/terms.js
// Wobl — Terms of Service. NOTE: this is a starter template, not legal
// advice or a reviewed legal document. Flagged clearly in the page copy
// itself — do not treat as ready to rely on without an actual lawyer
// reviewing it before real users are bound by it.

import Head from "next/head";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import { W } from "../components/shared/wobl-theme";

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms of Service — Wobl</title>
      </Head>

      <Navbar />

      <main
        style={{ background: W.bg, minHeight: "70vh", padding: "4rem 2rem" }}
      >
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <h1
            style={{
              fontFamily: W.displayFont,
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              color: W.cream,
              margin: "0 0 0.5rem",
            }}
          >
            Terms of Service
          </h1>
          <p
            style={{
              fontFamily: W.monoFont,
              fontSize: 11,
              color: W.creamFaint,
              marginBottom: 24,
            }}
          >
            Last updated: [date] — placeholder draft, not yet legally reviewed
          </p>

          <div
            style={{
              fontFamily: W.bodyFont,
              fontSize: 14,
              lineHeight: 1.7,
              color: W.creamDim,
            }}
          >
            <Section title="1. Using Wobl">
              Wobl is a movie and show discovery site. By using it, you agree to
              use it lawfully and not attempt to disrupt, scrape at scale, or
              abuse the service.
            </Section>
            <Section title="2. Accounts">
              You're responsible for keeping your account credentials secure.
              You can delete your account at any time from account settings.
            </Section>
            <Section title="3. Content">
              Movie and show data is sourced from TMDB and other providers. Wobl
              does not claim ownership of that underlying content.
            </Section>
            <Section title="4. Changes">
              These terms may change as Wobl evolves. Continued use after a
              change means you accept the updated terms.
            </Section>
            <Section title="5. Disclaimer">
              Wobl is provided as-is, without warranties of any kind.
            </Section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2
        style={{
          fontFamily: W.bodyFont,
          fontSize: 15,
          fontWeight: 600,
          color: W.cream,
          marginBottom: 6,
        }}
      >
        {title}
      </h2>
      <p>{children}</p>
    </div>
  );
}
