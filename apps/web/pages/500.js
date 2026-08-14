// pages/500.js
// Wobl — themed server error page. Per spec 5.0: calm inline message,
// never a blank white screen or alarming red banner.

import Head from "next/head";
import Link from "next/link";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import { W } from "../components/shared/wobl-theme";

export default function ServerErrorPage() {
  return (
    <>
      <Head>
        <title>Something skipped a frame — Wobl</title>
      </Head>

      <Navbar />

      <main
        style={{
          background: W.bg,
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 2rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div
            style={{
              fontFamily: W.monoFont,
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: W.marquee,
              marginBottom: 10,
            }}
          >
            500
          </div>
          <h1
            style={{
              fontFamily: W.displayFont,
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              color: W.cream,
              margin: "0 0 12px",
            }}
          >
            Something skipped a frame.
          </h1>
          <p
            style={{
              fontFamily: W.bodyFont,
              fontSize: 14,
              color: W.creamDim,
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            Nothing lost — just a hiccup on our end. Try again in a moment.
          </p>
          <Link
            href="/movies"
            style={{
              display: "inline-block",
              fontFamily: W.monoFont,
              fontSize: 13,
              color: W.marquee,
              textDecoration: "none",
              borderBottom: `1px solid ${W.marquee}`,
              paddingBottom: 2,
            }}
          >
            Back to Movies →
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
