// pages/movies/[slug].js
// Wobl — Movie/TV detail page. Trailer player is the hero of this page
// (per spec 3.3), not a plain link-out. Real stats only — no fake scoring.

import { useEffect } from "react";
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

export async function getStaticPaths() {
  // Render on-demand — movie catalog is large and changes daily via sync.
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const item = await getBySlug(params.slug);
  if (!item) return { notFound: true };

  const related = await getRelated(item, 6);

  return {
    props: { item, related },
    revalidate: 3600,
  };
}

export default function MovieDetailPage({ item, related }) {
  useEffect(() => {
    // Fire-and-forget — never blocks rendering, failure is silent since
    // a view-count miss isn't worth showing the user an error for.
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: item.slug }),
    }).catch(() => {});
  }, [item.slug]);

  return (
    <>
      <MovieSEO item={item} />

      <Navbar />

      <main style={{ background: W.bg, minHeight: "100vh" }}>
        <div
          style={{ maxWidth: 1000, margin: "0 auto", padding: "1.5rem 2rem 0" }}
        >
          {/* Trailer player is the hero — per spec, this is the moment
              that sells whether the title is worth someone's time. */}
          <TrailerPlayer
            tmdbId={item.source_id}
            slug={item.slug}
            itemName={item.name}
            trailers={item.trailer_url ? [item.trailer_url] : []}
            backdropUrl={item.backdrop_path || item.image}
          />
        </div>

        <div className="detail-content">
          <div className="poster-col">
            {item.image ? (
              <img src={item.image} alt={item.name} className="poster" />
            ) : (
              <div className="poster poster-fallback">{item.name}</div>
            )}
          </div>

          <div className="info-col">
            {item.type === "tv" && <span className="eyebrow">Series</span>}
            <div className="title-row">
              <h1 className="title">{item.name}</h1>
              <div className="title-actions">
                <SaveButton item={item} />
                <ShareButton item={item} />
              </div>
            </div>

            <div className="stats">
              {item.year && <Stat label="Year" value={item.year} />}
              {item.rating != null && (
                <Stat label="Rating" value={`★ ${item.rating}`} highlight />
              )}
              {item.rating_count > 0 && (
                <Stat
                  label="Votes"
                  value={item.rating_count.toLocaleString()}
                />
              )}
              {item.genre && <Stat label="Genre" value={item.genre} />}
            </div>

            {item.director && (
              <a
                href={`/movies/director/${item.director.toLowerCase().replace(/\s+/g, "-")}`}
                className="director-link"
              >
                Directed by {item.director}
              </a>
            )}

            {item.long_desc && <p className="desc">{item.long_desc}</p>}

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
          </div>
        </div>

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
      </main>

      <Footer />

      <style jsx>{`
        .detail-content {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem 2rem 3rem;
        }
        @media (max-width: 640px) {
          .detail-content {
            grid-template-columns: 1fr;
            padding-top: 1.5rem;
            padding-left: 1.25rem;
            padding-right: 1.25rem;
            gap: 1.25rem;
          }
          .poster-col {
            display: flex;
            justify-content: center;
          }
          .poster-col :global(img),
          .poster-col :global(.poster-fallback) {
            max-width: 140px;
          }
        }
        @media (min-width: 1440px) {
          .detail-content {
            grid-template-columns: 280px 1fr;
            max-width: 1200px;
            gap: 3rem;
          }
        }
        .poster {
          width: 100%;
          border-radius: 8px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
        }
        .poster-fallback {
          aspect-ratio: 2 / 3;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--wobl-surface);
          font-family: var(--wobl-display);
          color: var(--wobl-cream-dim);
          text-align: center;
          padding: 1rem;
        }
        .eyebrow {
          font-family: var(--wobl-mono);
          font-size: 0.75rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--wobl-amber);
        }
        .title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }
        .title-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
          margin-top: 0.5rem;
        }
        .title {
          font-family: var(--wobl-display);
          font-size: clamp(1.8rem, 4vw, 2.75rem);
          color: var(--wobl-cream);
          margin: 0.3rem 0 1rem;
          line-height: 1.1;
        }
        .stats {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        @media (max-width: 640px) {
          .stats {
            gap: 1rem;
          }
        }
        .desc {
          color: var(--wobl-cream-dim);
          line-height: 1.6;
          max-width: 65ch;
          margin-bottom: 1.5rem;
        }
        .director-link {
          display: inline-block;
          font-family: var(--wobl-mono);
          font-size: 0.85rem;
          color: var(--wobl-amber);
          text-decoration: none;
          margin-bottom: 1rem;
          border-bottom: 1px solid transparent;
        }
        .director-link:hover {
          border-bottom-color: var(--wobl-amber);
        }
        .source-link {
          display: inline-block;
          font-family: var(--wobl-mono);
          font-size: 0.9rem;
          color: var(--wobl-marquee);
          text-decoration: none;
          border-bottom: 1px solid var(--wobl-marquee);
        }
        .related {
          max-width: 1000px;
          margin: 0 auto;
          padding: 1rem 2rem 4rem;
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
          .related-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.6rem;
          }
        }
      `}</style>
    </>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className={highlight ? "stat-value highlight" : "stat-value"}>
        {value}
      </span>
      <style jsx>{`
        .stat {
          display: flex;
          flex-direction: column;
        }
        .stat-label {
          font-family: var(--wobl-mono);
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--wobl-cream-dim);
        }
        .stat-value {
          font-family: var(--wobl-display);
          font-size: 1.1rem;
          color: var(--wobl-cream);
        }
        .highlight {
          color: var(--wobl-marquee);
        }
      `}</style>
    </div>
  );
}
