// pages/privacy.js
// Wobl — Privacy Policy. NOTE: same caveat as terms.js — this is a
// starter template reflecting what the codebase actually collects
// (email via Supabase auth, saved favorites), not a legally reviewed
// document. Needs real legal review before real users rely on it.

import Head from "next/head";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import { W } from "../components/shared/wobl-theme";

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy — Wobl</title>
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
            Privacy Policy
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
            <Section title="What we collect">
              If you create an account: your email address, and any display name
              you set. If you save titles: which titles you've saved. We don't
              collect anything beyond what's needed to run your account and
              shelf.
            </Section>
            <Section title="How it's used">
              Solely to run your account, show your saved shelf, and let you
              sign in. Nothing is sold to third parties.
            </Section>
            <Section title="Third parties">
              Account data is stored via Supabase. Movie/show data is sourced
              from TMDB. Neither is used to track you across other sites.
            </Section>
            <Section title="Your control">
              You can update your display name or delete your account at any
              time from account settings.
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
