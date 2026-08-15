// pages/movies/[slug].js

import { useEffect, useState } from "react";
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

// --- Utility: Bulletproof URL Slugifier ---
const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-") // Replace spaces & underscores with hyphens
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Remove double hyphens
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
    console.error("Error fetching movie data:", error);
    return { notFound: true };
  }
}

export default function MovieDetailPage({ item, related }) {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);

  // Analytics tracking
  useEffect(() => {
    if (!item?.slug) return;
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: item.slug }),
    }).catch(() => {});
  }, [item?.slug]);

  // Graceful loading state for fallback blocking
  if (router.isFallback || !item) {
    return (
      <>
        <Navbar />
        <main style={{ background: W.bg, minHeight: "100vh" }}>
          <div className="skeleton-hero" />
        </main>
        <style jsx>{`
          .skeleton-hero {
            height: 70vh;
            background: #111;
            animation: pulse 1.5s infinite;
          }
          @keyframes pulse {
            0%,
            100% {
              opacity: 0.5;
            }
            50% {
              opacity: 0.8;
            }
          }
        `}</style>
      </>
    );
  }

  // Safe data extraction
  const genres =
    typeof item.genre === "string"
      ? item.genre
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean)
      : [];

  const backdrop = item.backdrop_path || item.image || "/fallback-bg.jpg";
  const poster = item.poster_path || item.image || "/fallback-poster.jpg";
  const hasTrailer = !!(item.trailer_url || item.source_id);

  return (
    <>
      <MovieSEO item={item} />
      <Navbar />

      <main style={{ background: W.bg, minHeight: "100vh" }}>
        {/* --- 1. THEATRE HERO SECTION --- */}
        <section className="hero">
          <div className="hero-background">
            {isPlaying && hasTrailer ? (
              <div className="trailer-container">
                <TrailerPlayer
                  tmdbId={item.source_id}
                  slug={item.slug}
                  itemName={item.name}
                  trailers={item.trailer_url ? [item.trailer_url] : []}
                  backdropUrl={backdrop}
                  autoPlay={true}
                />
              </div>
            ) : (
              <div
                className="backdrop-img"
                style={{ backgroundImage: `url(${backdrop})` }}
              />
            )}
            {/* The Scrim dims the bottom so text is readable */}
            <div className={`scrim ${isPlaying ? "scrim-dark" : ""}`} />
          </div>

          {/* --- 2. FOREGROUND UI (Poster + Glass Panel) --- */}
          <div className={`hero-ui ${isPlaying ? "ui-dimmed" : ""}`}>
            <div className="poster-container">
              <img
                src={poster}
                alt={`${item.name} Poster`}
                className="poster"
              />
            </div>

            <div className="glass-panel">
              <div className="panel-header">
                {item.type === "tv" && <span className="eyebrow">Series</span>}
                <div className="actions">
                  <SaveButton item={item} />
                  <ShareButton item={item} />
                </div>
              </div>

              <h1 className="title">{item.name}</h1>

              <div className="meta-info">
                {item.rating && <span className="rating">★ {item.rating}</span>}
                {item.year && <span className="dot">{item.year}</span>}
                {item.runtime && (
                  <span className="dot">{item.runtime} min</span>
                )}
              </div>

              {genres.length > 0 && (
                <div className="genres">
                  {genres.map((g) => (
                    <span key={g} className="genre-pill">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {item.short_desc && (
                <p className="short-desc">{item.short_desc}</p>
              )}

              {/* Dynamic Primary Action Button */}
              {hasTrailer && (
                <button
                  className="play-btn"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  <span className="play-icon">{isPlaying ? "⏸" : "▶"}</span>
                  {isPlaying ? "Close Trailer" : "Watch Trailer"}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* --- 3. LOWER CONTENT BODY --- */}
        <div className="content-container">
          {item.director && (
            <div className="director-credit">
              Directed by{" "}
              <a href={`/movies/director/${slugify(item.director)}`}>
                {item.director}
              </a>
            </div>
          )}

          {item.long_desc && item.long_desc !== item.short_desc && (
            <div className="section">
              <h3 className="section-title">Storyline</h3>
              <p className="long-desc">{item.long_desc}</p>
            </div>
          )}

          <div className="section">
            <h3 className="section-title">Cast & Crew</h3>
            <CastList cast={item.metadata?.cast} />
          </div>

          {related?.length > 0 && (
            <div className="section">
              <h3 className="section-title">You Might Also Like</h3>
              <div className="related-grid">
                {related.map((r) => (
                  <MovieCard key={r.id} item={r} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* --- PAGE STYLES --- */}
      <style jsx>{`
        /* Hero Base */
        .hero {
          position: relative;
          min-height: 85vh;
          display: flex;
          align-items: flex-end;
          padding-bottom: 3rem;
        }

        /* Background Layers */
        .hero-background {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: #000;
        }
        .backdrop-img {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: top center;
          opacity: 0.6;
          transition: opacity 0.5s ease;
        }
        .trailer-container {
          width: 100%;
          height: 100%;
          animation: fadeIn 0.4s ease;
        }

        /* Scrim Gradients */
        .scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            var(--wobl-bg) 0%,
            rgba(10, 9, 8, 0.8) 30%,
            transparent 100%
          );
          transition: background 0.4s ease;
          pointer-events: none;
        }
        .scrim-dark {
          background: linear-gradient(
            to top,
            var(--wobl-bg) 0%,
            rgba(0, 0, 0, 0.95) 40%,
            rgba(0, 0, 0, 0.5) 100%
          );
        }

        /* UI Layout Container */
        .hero-ui {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 3rem;
          align-items: flex-end;
          transition: opacity 0.3s ease;
        }

        /* Cinematic Mode: Dim UI when trailer is playing unless hovered */
        .ui-dimmed {
          opacity: 0.15;
        }
        .ui-dimmed:hover {
          opacity: 1;
        }

        /* Poster */
        .poster-container {
          width: 100%;
          aspect-ratio: 2 / 3;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .poster {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Glass Panel */
        .glass-panel {
          background: rgba(20, 20, 20, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 2.5rem;
          margin-bottom: 2rem;
        }

        /* Typography & Details */
        .eyebrow {
          color: var(--wobl-amber);
          font-family: monospace;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-size: 0.8rem;
        }
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .actions {
          display: flex;
          gap: 1rem;
        }
        .title {
          font-size: clamp(2rem, 5vw, 4rem);
          line-height: 1.1;
          color: #fff;
          margin: 0.5rem 0 1rem;
          font-weight: 700;
        }
        .meta-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #aaa;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }
        .rating {
          color: var(--wobl-amber);
          font-weight: 600;
        }
        .dot::before {
          content: "•";
          margin-right: 0.5rem;
          opacity: 0.5;
        }

        .genres {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .genre-pill {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          color: #ddd;
        }
        .short-desc {
          font-size: 1.05rem;
          line-height: 1.6;
          color: #ccc;
          margin-bottom: 2rem;
          max-width: 600px;
        }

        /* Play Button */
        .play-btn {
          background: #fff;
          color: #000;
          border: none;
          padding: 0.8rem 1.8rem;
          border-radius: 30px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition:
            transform 0.2s,
            background 0.2s;
        }
        .play-btn:hover {
          transform: scale(1.05);
          background: #eee;
        }

        /* Lower Content Body */
        .content-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 2rem 6rem;
        }
        .section {
          margin-bottom: 4rem;
        }
        .section-title {
          color: #fff;
          font-size: 1.2rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 1.5rem;
          border-left: 3px solid var(--wobl-amber);
          padding-left: 1rem;
        }
        .director-credit {
          font-size: 1.1rem;
          color: #888;
          margin-bottom: 3rem;
        }
        .director-credit a {
          color: var(--wobl-amber);
          text-decoration: none;
        }
        .long-desc {
          color: #bbb;
          line-height: 1.8;
          font-size: 1.05rem;
          max-width: 800px;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1.5rem;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Responsive Layout */
        @media (max-width: 900px) {
          .hero-ui {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .poster-container {
            max-width: 200px;
            margin: 0 auto;
            display: none; /* Often hidden on mobile to save vertical space */
          }
          .glass-panel {
            padding: 1.5rem;
            margin-bottom: 0;
          }
        }
      `}</style>
    </>
  );
}
