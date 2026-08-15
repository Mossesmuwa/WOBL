// pages/movies/[slug].js
// Wobl — Professional Movie & Series Detail Page with Dedicated Inline Player & Glassmorphism UI

import { useEffect } from "react";
import { useRouter } from "next/router";
import { getBySlug, getRelated } from "shared/lib/items";
import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import MovieCard from "../../components/movies/MovieCard";
import TrailerPlayer from "../../components/movies/TrailerPlayer";
import CastList from "../../components/movies/CastList";
import MovieSEO from "../../components/movies/MovieSEO";
import SaveButton from "../../components/movies/SaveButton";
import ShareButton from "../../components/movies/ShareButton";
import { W } from "../../components/shared/wobl-theme";

// Safe string slugifier for clean routing
const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const slug = params?.slug;
  if (!slug) return { notFound: true };

  try {
    const item = await getBySlug(slug);
    if (!item) return { notFound: true };
    const related = (await getRelated(item, 6)) || [];

    return { props: { item, related }, revalidate: 3600 };
  } catch (error) {
    console.error("Failed to fetch detail item:", error);
    return { notFound: true };
  }
}

export default function MovieDetailPage({ item, related }) {
  const router = useRouter();

  // Track page views safely on mount
  useEffect(() => {
    if (!item?.slug) return;
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: item.slug }),
    }).catch(() => {});
  }, [item?.slug]);

  // Fallback loading skeleton
  if (router.isFallback || !item) {
    return (
      <>
        <Navbar />
        <main style={{ background: W.bg, minHeight: "100vh" }}>
          <div className="skeleton-hero" />
        </main>
        <style jsx>{`
          .skeleton-hero {
            height: 75vh;
            background: rgba(255, 255, 255, 0.03);
            animation: woblPulse 1.5s ease-in-out infinite;
          }
          @keyframes woblPulse {
            0%,
            100% {
              opacity: 0.4;
            }
            50% {
              opacity: 0.8;
            }
          }
        `}</style>
        <Footer />
      </>
    );
  }

  // Safe data parsing
  const genres =
    typeof item.genre === "string"
      ? item.genre
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean)
      : [];

  const backdrop = item.backdrop_path || item.image || "";
  const poster = item.poster_path || item.image || "";
  const hasMediaSource = Boolean(item.trailer_url || item.source_id);

  return (
    <>
      <MovieSEO item={item} />
      <Navbar />

      <main
        style={{ background: W.bg, minHeight: "100vh", paddingBottom: "6rem" }}
      >
        {/* --- AMBIENT BACKGROUND GLOW --- */}
        {backdrop && (
          <div
            className="ambient-glow"
            style={{ backgroundImage: `url(${backdrop})` }}
          />
        )}

        {/* --- MAIN LAYOUT GRID --- */}
        <div className="page-grid">
          {/* LEFT COLUMN: Dedicated Player Stage & Storyline */}
          <div className="content-stage">
            <div className="player-section">
              <div className="player-header-bar">
                <span className="section-eyebrow">
                  {item.type === "tv"
                    ? "Series Trailer & Preview"
                    : "Official Movie Trailer"}
                </span>
                <span className="player-hint">
                  Use fullscreen icon to expand view
                </span>
              </div>

              <div className="player-wrapper">
                {hasMediaSource ? (
                  <TrailerPlayer
                    tmdbId={item.source_id}
                    slug={item.slug}
                    itemName={item.name}
                    trailers={item.trailer_url ? [item.trailer_url] : []}
                    backdropUrl={backdrop}
                  />
                ) : (
                  <div
                    className="fallback-banner"
                    style={{ backgroundImage: `url(${backdrop})` }}
                  >
                    <div className="fallback-overlay">
                      <span>No trailer preview available for this title</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {item.long_desc && (
              <div className="section-block glass-box">
                <span className="section-eyebrow">Storyline</span>
                <p className="long-desc">{item.long_desc}</p>
              </div>
            )}

            <div className="section-block glass-box">
              <span className="section-eyebrow">Cast & Crew</span>
              <CastList cast={item.metadata?.cast} />
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Glass Sidebar for Metadata & Poster */}
          <aside className="sidebar-meta">
            <div className="info-card glass-panel">
              <div className="poster-container">
                {poster && (
                  <img src={poster} alt={item.name} className="poster" />
                )}
              </div>

              <div className="card-header">
                {item.type === "tv" && (
                  <span className="eyebrow">TV Series</span>
                )}
                <div className="actions">
                  <SaveButton item={item} />
                  <ShareButton item={item} />
                </div>
              </div>

              <h1 className="title">{item.name}</h1>

              <div className="meta-row">
                {item.rating != null && (
                  <span className="rating">★ {item.rating}</span>
                )}
                {item.year && <span className="dot-sep">{item.year}</span>}
                {item.runtime && (
                  <span className="dot-sep">{item.runtime} min</span>
                )}
              </div>

              {genres.length > 0 && (
                <div className="genre-pills">
                  {genres.map((g) => (
                    <span key={g} className="genre-pill">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {item.short_desc && <p className="desc">{item.short_desc}</p>}

              {item.director && (
                <div className="director-credit">
                  Directed by{" "}
                  <a href={`/movies/director/${slugify(item.director)}`}>
                    {item.director}
                  </a>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* --- RECOMMENDATIONS --- */}
        {related && related.length > 0 && (
          <section className="related-section">
            <div className="related-container">
              <span className="section-eyebrow">You Might Also Like</span>
              <div className="related-grid">
                {related.map((r) => (
                  <MovieCard key={r.id} item={r} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />

      <style jsx>{`
        /* Ambient Background Glow */
        .ambient-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 500px;
          background-size: cover;
          background-position: center top;
          opacity: 0.12;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        .page-grid {
          position: relative;
          z-index: 1;
          max-width: 1260px;
          margin: 0 auto;
          padding: 3rem 2rem 2rem;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 3rem;
          align-items: start;
        }

        .content-stage {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .player-section {
          width: 100%;
        }

        .player-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .player-hint {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .player-wrapper {
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #000;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
        }

        .fallback-banner {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .fallback-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .sidebar-meta {
          position: sticky;
          top: 2rem;
        }

        /* High-End Glassmorphism Panel Styles */
        .glass-panel {
          background: rgba(22, 22, 22, 0.55);
          backdrop-filter: blur(28px) saturate(1.4);
          -webkit-backdrop-filter: blur(28px) saturate(1.4);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow:
            0 24px 48px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
        }

        .glass-box {
          background: rgba(22, 22, 22, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 2rem;
        }

        .poster-container {
          width: 100%;
          aspect-ratio: 2 / 3;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 1.5rem;
          box-shadow: 0 16px 35px rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .poster {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .eyebrow {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--wobl-amber, #f59e0b);
        }

        .actions {
          display: flex;
          gap: 0.5rem;
        }

        .title {
          font-family: var(--wobl-display, sans-serif);
          font-size: clamp(1.8rem, 2.5vw, 2.4rem);
          color: var(--wobl-cream, #fff);
          margin: 0.2rem 0 0.6rem;
          line-height: 1.15;
          letter-spacing: -0.01em;
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.82rem;
          color: var(--wobl-cream-dim, #ccc);
          margin-bottom: 1rem;
        }

        .rating {
          color: var(--wobl-marquee, #f59e0b);
          font-weight: 600;
        }

        .dot-sep::before {
          content: "·";
          margin-right: 0.6rem;
        }

        .genre-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-bottom: 1.25rem;
        }

        .genre-pill {
          font-size: 0.73rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 0.5px solid rgba(255, 255, 255, 0.15);
          color: var(--wobl-cream-dim, #ccc);
        }

        .desc {
          font-size: 0.92rem;
          line-height: 1.6;
          color: var(--wobl-cream-dim, #ccc);
          margin-bottom: 1.5rem;
        }

        .director-credit {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.85rem;
          color: var(--wobl-cream-dim, #aaa);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 1.25rem;
        }

        .director-credit a {
          color: var(--wobl-amber, #f59e0b);
          text-decoration: underline;
        }

        .section-block {
          margin-bottom: 2.5rem;
        }

        .section-eyebrow {
          display: block;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.75rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--wobl-amber, #f59e0b);
          margin-bottom: 0.8rem;
        }

        .long-desc {
          font-size: 1.02rem;
          line-height: 1.75;
          color: var(--wobl-cream-dim, #ccc);
        }

        .related-section {
          max-width: 1260px;
          margin: 3rem auto 0;
          padding: 0 2rem;
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 1.25rem;
        }

        @media (max-width: 960px) {
          .page-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .sidebar-meta {
            position: static;
          }
        }
      `}</style>
    </>
  );
}
