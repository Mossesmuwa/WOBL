// pages/movies/[slug].js
// Wobl — Movie/TV detail page. Magazine-style: ambient backdrop with a
// glass info panel (title, rating, genre, save/share, trailer trigger)
// composed as one unit — not stacked separate blocks. Trailer opens from
// within the panel rather than sitting as a detached top element.

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getBySlug, getRelated } from "shared/lib/items";
import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import MovieCard from "../../components/movies/MovieCard";
import MovieCardSkeleton from "../../components/movies/MovieCardSkeleton";
import TrailerPlayer from "../../components/movies/TrailerPlayer";
import CastList from "../../components/movies/CastList";
import MovieSEO from "../../components/movies/MovieSEO";
import SaveButton from "../../components/movies/SaveButton";
import ShareButton from "../../components/movies/ShareButton";
import { W, glassPanel } from "../../components/shared/wobl-theme";

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const item = await getBySlug(params.slug);
  if (!item) return { notFound: true };
  const related = await getRelated(item, 6);
  return { props: { item, related }, revalidate: 3600 };
}

export default function MovieDetailPage({ item, related }) {
  const router = useRouter();
  const [trailerOpen, setTrailerOpen] = useState(false);

  useEffect(() => {
    if (!item) return;
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: item.slug }),
    }).catch(() => {});
  }, [item?.slug]);

  // Blocking-fallback pages render nothing until ready — a real gap on
  // slower connections. This gives an actual loading state instead of a
  // blank screen while Next resolves the page.
  if (router.isFallback || !item) {
    return (
      <>
        <Navbar />
        <main
          style={{ background: W.bg, minHeight: "100vh", padding: "3rem 2rem" }}
        >
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div
              style={{
                aspectRatio: "21/9",
                borderRadius: W.radius,
                background: W.surface,
                animation: "woblDetailPulse 1.4s ease-in-out infinite",
              }}
            />
            <style jsx>{`
              @keyframes woblDetailPulse {
                0%,
                100% {
                  opacity: 0.5;
                }
                50% {
                  opacity: 0.9;
                }
              }
            `}</style>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const genres = (item.genre || "")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);
  const backdrop = item.backdrop_path || item.image;

  return (
    <>
      <MovieSEO item={item} />
      <Navbar />

      <main style={{ background: W.bg, minHeight: "100vh" }}>
        <section className="ambient-hero">
          {backdrop && (
            <div
              className="backdrop"
              style={{ backgroundImage: `url(${backdrop})` }}
            />
          )}
          <div className="scrim" />

          <div className="info-panel">
            <div className="panel-top">
              {item.type === "tv" && <span className="eyebrow">Series</span>}
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
              {item.rating_count > 0 && (
                <span className="dot-sep">
                  {item.rating_count.toLocaleString()} votes
                </span>
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

            {item.director && (
              <a
                href={`/movies/director/${item.director.toLowerCase().replace(/\s+/g, "-")}`}
                className="director-link"
              >
                Directed by {item.director}
              </a>
            )}

            {item.short_desc && <p className="desc">{item.short_desc}</p>}

            <button
              className="trailer-trigger"
              onClick={() => setTrailerOpen(true)}
            >
              <span className="play-dot" />
              Watch trailer
            </button>
          </div>
        </section>

        <div className="content-body">
          {item.long_desc && item.long_desc !== item.short_desc && (
            <p className="long-desc">{item.long_desc}</p>
          )}

          <CastList cast={item.metadata?.cast} />

          {item.source_url && (
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="source-link"
            >
              View on TMDB →
            </a>
          )}

          {related && related.length > 0 && (
            <section className="related">
              <span className="section-eyebrow">You Might Also Like</span>
              <div className="related-grid">
                {related.map((r) => (
                  <MovieCard key={r.id} item={r} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {trailerOpen && (
        <div className="trailer-overlay" onClick={() => setTrailerOpen(false)}>
          <div className="trailer-wrap" onClick={(e) => e.stopPropagation()}>
            <TrailerPlayer
              tmdbId={item.source_id}
              slug={item.slug}
              itemName={item.name}
              trailers={item.trailer_url ? [item.trailer_url] : []}
              backdropUrl={backdrop}
            />
          </div>
        </div>
      )}

      <Footer />

      <style jsx>{`
        .ambient-hero {
          position: relative;
          min-height: 62vh;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }
        .backdrop {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center 20%;
          filter: saturate(0.9);
        }
        .scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            var(--wobl-bg) 8%,
            rgba(10, 9, 8, 0.55) 50%,
            rgba(10, 9, 8, 0.15) 100%
          );
        }
        .info-panel {
          position: relative;
          z-index: 1;
          max-width: 680px;
          margin: 0 2rem 2.5rem;
          padding: 1.75rem;
          border-radius: var(--wobl-radius, 14px);
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(24px) saturate(1.4);
          border: 0.5px solid rgba(255, 255, 255, 0.12);
        }
        .panel-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .eyebrow {
          font-family: var(--wobl-mono);
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--wobl-amber);
        }
        .actions {
          display: flex;
          gap: 0.5rem;
        }
        .title {
          font-family: var(--wobl-display);
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          color: var(--wobl-cream);
          margin: 0.4rem 0 0.6rem;
          line-height: 1.08;
        }
        .meta-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: var(--wobl-mono);
          font-size: 0.85rem;
          color: var(--wobl-cream-dim);
          margin-bottom: 0.75rem;
        }
        .rating {
          color: var(--wobl-marquee);
        }
        .dot-sep::before {
          content: "·";
          margin-right: 0.6rem;
          color: var(--wobl-cream-dim);
        }
        .genre-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-bottom: 0.9rem;
        }
        .genre-pill {
          font-family: var(--wobl-body);
          font-size: 0.72rem;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          border: 0.5px solid rgba(255, 255, 255, 0.15);
          color: var(--wobl-cream-dim);
        }
        .director-link {
          display: inline-block;
          font-family: var(--wobl-mono);
          font-size: 0.8rem;
          color: var(--wobl-amber);
          text-decoration: none;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid transparent;
        }
        .director-link:hover {
          border-bottom-color: var(--wobl-amber);
        }
        .desc {
          font-family: var(--wobl-body);
          font-size: 0.95rem;
          line-height: 1.55;
          color: var(--wobl-cream-dim);
          margin-bottom: 1.1rem;
        }
        .trailer-trigger {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.1rem;
          border-radius: 30px;
          border: none;
          background: linear-gradient(
            135deg,
            var(--wobl-marquee),
            var(--wobl-amber)
          );
          color: #0a0908;
          font-family: var(--wobl-body);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }
        .play-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #0a0908;
        }
        .content-body {
          max-width: 680px;
          margin: 0 auto;
          padding: 2.5rem 2rem 4rem;
        }
        .long-desc {
          font-family: var(--wobl-body);
          font-size: 0.95rem;
          line-height: 1.65;
          color: var(--wobl-cream-dim);
          margin-bottom: 1.5rem;
        }
        .source-link {
          display: inline-block;
          font-family: var(--wobl-mono);
          font-size: 0.85rem;
          color: var(--wobl-marquee);
          text-decoration: none;
          border-bottom: 1px solid var(--wobl-marquee);
          margin: 0.5rem 0 2rem;
        }
        .section-eyebrow {
          display: block;
          font-family: var(--wobl-mono);
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--wobl-marquee);
          margin-bottom: 1rem;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1.25rem;
        }
        @media (max-width: 640px) {
          .info-panel {
            margin: 0 1.25rem 1.75rem;
            padding: 1.25rem;
          }
          .related-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.6rem;
          }
        }
      `}</style>

      <style jsx global>{`
        .trailer-overlay {
          position: fixed;
          inset: 0;
          z-index: 1500;
          background: rgba(10, 9, 8, 0.92);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .trailer-wrap {
          width: min(1000px, 100%);
        }
      `}</style>
    </>
  );
}
