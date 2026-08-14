// pages/about.js
// Wobl — About page. Says what the site actually is, honestly — no
// corporate filler, matches the tone established throughout the build.

import Head from "next/head";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import { W } from "../components/shared/wobl-theme";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About — Wobl</title>
      </Head>

      <Navbar />

      <main
        style={{ background: W.bg, minHeight: "70vh", padding: "4rem 2rem" }}
      >
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
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
            About
          </div>
          <h1
            style={{
              fontFamily: W.displayFont,
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
              color: W.cream,
              margin: "0 0 1.5rem",
              lineHeight: 1.15,
            }}
          >
            Real momentum, not algorithm noise.
          </h1>

          <div
            style={{
              fontFamily: W.bodyFont,
              fontSize: 15,
              lineHeight: 1.7,
              color: W.creamDim,
            }}
          >
            <p style={{ marginBottom: 20 }}>
              Wobl started as a way to see what's actually rising in movies and
              shows — real ratings, real trailers, no algorithm deciding what
              you should care about.
            </p>
            <p style={{ marginBottom: 20 }}>
              Movies came first. More is coming — the goal is the same wherever
              it goes: show what's real, skip the noise.
            </p>
            <p style={{ marginBottom: 20 }}>
              Movie and show data comes from{" "}
              <a
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: W.marquee,
                  textDecoration: "none",
                  borderBottom: `1px solid ${W.marquee}`,
                }}
              >
                TMDB
              </a>
              , refreshed regularly.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
