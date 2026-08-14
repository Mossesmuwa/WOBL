// components/Footer.js
// Wobl — built fresh for the new identity. NOTE: the original NovaHub
// Footer.js content was never provided in this session, so this is a new
// build, not a merge. If the existing file has real logic (newsletter
// signup, etc.), paste it and this should be reconciled against it.

import Link from "next/link";
import { W } from "./wobl-theme";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: `0.5px solid ${W.surfaceBorder}`,
        marginTop: "3rem",
        padding: "2.5rem 2rem",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: W.displayFont,
              fontSize: 15,
              fontWeight: 600,
              color: W.cream,
              marginBottom: 4,
            }}
          >
            WOBL
          </div>
          <div
            style={{
              fontFamily: W.monoFont,
              fontSize: 11,
              color: W.creamFaint,
            }}
          >
            Real momentum, not algorithm noise.
          </div>
        </div>

        <nav style={{ display: "flex", gap: 20 }}>
          <Link href="/movies" style={{ ...linkStyle }}>
            Movies
          </Link>
          <Link href="/favorites" style={{ ...linkStyle }}>
            Shelf
          </Link>
          <Link href="/about" style={{ ...linkStyle }}>
            About
          </Link>
          <Link href="/terms" style={{ ...linkStyle }}>
            Terms
          </Link>
          <Link href="/privacy" style={{ ...linkStyle }}>
            Privacy
          </Link>
        </nav>

        <div
          style={{ fontFamily: W.monoFont, fontSize: 10, color: W.creamFaint }}
        >
          Movie data via TMDB
        </div>
      </div>
    </footer>
  );
}

const linkStyle = {
  fontFamily: "-apple-system, BlinkMacSystemFont, Inter, sans-serif",
  fontSize: 13,
  color: "#B8AC9C",
  textDecoration: "none",
};
