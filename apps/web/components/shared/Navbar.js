// components/Navbar.js
// Wobl — Glass navbar. Auth/dropdown/mobile-menu logic preserved from the
// original; visual layer fully rebuilt for Wobl's identity (independent of
// the rest of the app's --gold/--bg2 CSS variable system).

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSupabase } from "shared/lib/SupabaseContext";
import { logout } from "shared/lib/auth";
import { W, glassPanel } from "./wobl-theme";
import { useSearchOverlay } from "../../context/SearchContext";

export default function Navbar() {
  const router = useRouter();
  const { user, profile, loading } = useSupabase();
  const { open: openSearch } = useSearchOverlay();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "";
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "?";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropOpen(false);
  }, [router.pathname]);

  // Cmd/Ctrl+K opens the search overlay (per spec — search is an overlay,
  // not a route). Previously this navigated to /search; fixed to match
  // the actual spec.
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openSearch]);

  const handleLogout = async () => {
    setDropOpen(false);
    await logout();
    router.push("/");
  };

  const navLinks = [
    { href: "/movies", label: "Movies" },
    { href: "/favorites", label: "Shelf" },
  ];

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        padding: "12px 20px",
        transition: `background ${W.ease} 0.3s`,
        ...(scrolled
          ? {
              ...glassPanel,
              borderRadius: 0,
              borderLeft: "none",
              borderRight: "none",
              borderTop: "none",
            }
          : { background: "transparent" }),
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: W.displayFont,
            fontSize: 17,
            fontWeight: 600,
            color: W.cream,
            textDecoration: "none",
            letterSpacing: "0.01em",
          }}
        >
          WOBL
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: W.bodyFont,
                fontSize: 13,
                color: router.pathname === link.href ? W.cream : W.creamDim,
                textDecoration: "none",
                transition: `color ${W.ease} 0.2s`,
              }}
            >
              {link.label}
            </Link>
          ))}

          <button
            onClick={openSearch}
            aria-label="Search"
            className="wobl-search-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              ...glassPanel,
              borderRadius: 20,
              padding: "6px 12px",
              cursor: "pointer",
              color: W.creamDim,
              fontFamily: W.monoFont,
              fontSize: 11,
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span className="wobl-kbd-hint">&#8984;K</span>
          </button>

          <AuthSection
            loading={loading}
            user={user}
            displayName={displayName}
            initial={initial}
            dropOpen={dropOpen}
            setDropOpen={setDropOpen}
            dropRef={dropRef}
            handleLogout={handleLogout}
          />

          <button
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
            style={{
              display: "none",
              background: "none",
              border: "none",
              color: W.cream,
              cursor: "pointer",
            }}
            className="wobl-mobile-btn"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          style={{
            ...glassPanel,
            marginTop: 12,
            borderRadius: W.radius,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: W.cream,
                fontFamily: W.bodyFont,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}
          {!loading && !user && (
            <Link
              href="/account/login"
              style={{
                color: W.marquee,
                fontFamily: W.bodyFont,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              Sign in
            </Link>
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 640px) {
          :global(.wobl-mobile-btn) {
            display: block !important;
          }
          /* Keyboard shortcut hint is meaningless without a keyboard —
           * mobile keeps just the search icon, no dead label. */
          :global(.wobl-kbd-hint) {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}

function AuthSection({
  loading,
  user,
  displayName,
  initial,
  dropOpen,
  setDropOpen,
  dropRef,
  handleLogout,
}) {
  if (loading) {
    return (
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: W.surface,
        }}
      />
    );
  }

  if (!user) {
    return (
      <Link
        href="/account/login"
        style={{
          fontFamily: W.bodyFont,
          fontSize: 13,
          color: W.marquee,
          textDecoration: "none",
        }}
      >
        Sign in
      </Link>
    );
  }

  return (
    <div style={{ position: "relative" }} ref={dropRef}>
      <button
        onClick={() => setDropOpen((p) => !p)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          ...glassPanel,
          borderRadius: 20,
          padding: "4px 10px 4px 4px",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${W.marquee}, ${W.amber})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            color: "#0A0908",
          }}
        >
          {initial}
        </div>
        <span style={{ fontFamily: W.bodyFont, fontSize: 12, color: W.cream }}>
          {displayName}
        </span>
      </button>

      {dropOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            ...glassPanel,
            borderRadius: W.radiusSm,
            padding: 6,
            minWidth: 170,
          }}
        >
          <Link
            href="/favorites"
            style={{
              display: "block",
              padding: "8px 10px",
              fontFamily: W.bodyFont,
              fontSize: 13,
              color: W.cream,
              textDecoration: "none",
              borderRadius: 6,
            }}
          >
            Your Shelf
          </Link>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "8px 10px",
              fontFamily: W.bodyFont,
              fontSize: 13,
              color: "#E85A4A",
              background: "none",
              border: "none",
              cursor: "pointer",
              borderRadius: 6,
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
