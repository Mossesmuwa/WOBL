// pages/item/[slug].js
// Wobl — Movie/TV detail page
// Shows real stats only (rating, popularity, year) — no fake scoring system.

import Head from "next/head";
import { getBySlug, getRelated } from "../../../../packages/shared/lib/items";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import MovieCard from "../../components/MovieCard";

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

export default function ItemDetailPage({ item, related }) {
  return (
    <>
      <Head>
        <title>{item.name} — Wobl</title>
        <meta name="description" content={item.short_desc || item.name} />
      </Head>

      <Navbar />

      <main className="detail">
        {item.backdrop_path && (
          <div
            className="backdrop"
            style={{ backgroundImage: `url(${item.backdrop_path})` }}
          />
        )}
        <div className="backdrop-scrim" />

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
            <h1 className="title">{item.name}</h1>

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

            {item.long_desc && <p className="desc">{item.long_desc}</p>}

            {item.trailer_url && (
              <a
                href={item.trailer_url}
                target="_blank"
                rel="noopener noreferrer"
                className="trailer-link"
              >
                Watch trailer →
              </a>
            )}

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
        .detail {
          position: relative;
          background: var(--wobl-bg);
          min-height: 100vh;
        }
        .backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50vh;
          background-size: cover;
          background-position: center 20%;
          filter: saturate(0.85);
        }
        .backdrop-scrim {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50vh;
          background: linear-gradient(
            to bottom,
            rgba(20, 17, 15, 0.3) 0%,
            var(--wobl-bg) 95%
          );
        }
        .detail-content {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
          padding: 8rem 2rem 3rem;
        }
        @media (max-width: 640px) {
          .detail-content {
            grid-template-columns: 1fr;
            padding-top: 3rem;
            padding-left: 1.25rem;
            padding-right: 1.25rem;
            gap: 1.25rem;
          }
          .poster-col {
            /* On mobile the trailer already carries the visual weight —
             * shrink the poster and let it sit beside the title instead
             * of stacking full-width, saves scroll distance. */
            display: flex;
            justify-content: center;
          }
          .poster-col :global(img),
          .poster-col :global(.poster-fallback) {
            max-width: 140px;
          }
        }
        @media (min-width: 1440px) {
          /* Desktop-only: wider poster column, more breathing room —
           * a flourish that would waste space on smaller viewports. */
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
        .trailer-link,
        .source-link {
          display: inline-block;
          font-family: var(--wobl-mono);
          font-size: 0.9rem;
          color: var(--wobl-marquee);
          text-decoration: none;
          margin-right: 1.5rem;
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
