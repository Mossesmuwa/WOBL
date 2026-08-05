// pages/index.js
// Wobl — Homepage
// Marquee-style hero for the top featured title, then a trending grid.
// Falls back gracefully if featured/trending flags aren't set on new syncs.

import Head from "next/head";
import Link from "next/link";
import {
  getFeatured,
  getTrending,
  getByCategory,
} from "../../../packages/shared/lib/items";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MovieCard from "../components/MovieCard";

export async function getStaticProps() {
  const [featuredList, trending, newest] = await Promise.all([
    getFeatured(1, "movies"),
    getTrending(12, "movies"),
    getByCategory("movies", { limit: 12, sortBy: "newest" }),
  ]);

  return {
    props: {
      hero: featuredList[0] || trending[0] || null,
      trending,
      newest,
    },
    revalidate: 3600, // refresh hourly — matches sync cadence
  };
}

export default function HomePage({ hero, trending, newest }) {
  return (
    <>
      <Head>
        <title>Wobl — What's actually rising</title>
        <meta
          name="description"
          content="See what's actually rising in movies and shows — real ratings, no algorithm noise."
        />
      </Head>

      <Navbar />

      <main className="wobl-main">
        {hero && <Hero item={hero} />}

        <Section
          eyebrow="Now Screening"
          title="Trending"
          items={trending}
          emptyText="Nothing trending yet — check back after the next sync."
        />

        <Section
          eyebrow="Fresh Prints"
          title="Newest additions"
          items={newest}
          emptyText="No new titles yet."
        />
      </main>

      <Footer />

      <style jsx>{`
        .wobl-main {
          background: var(--wobl-bg);
          min-height: 100vh;
          padding-bottom: 4rem;
        }
      `}</style>
    </>
  );
}

function Hero({ item }) {
  const backdrop = item.backdrop_path || item.image;
  return (
    <section className="hero">
      {backdrop && (
        <div
          className="hero-backdrop"
          style={{ backgroundImage: `url(${backdrop})` }}
        />
      )}
      <div className="hero-scrim" />
      <div className="hero-content">
        <span className="hero-eyebrow">Featured Tonight</span>
        <h1 className="hero-title">{item.name}</h1>
        <div className="hero-meta">
          {item.year && <span>{item.year}</span>}
          {item.rating != null && (
            <span className="hero-rating">★ {item.rating}</span>
          )}
          {item.type === "tv" && <span className="hero-badge">Series</span>}
        </div>
        {item.short_desc && <p className="hero-desc">{item.short_desc}</p>}
        <Link href={`/item/${item.slug}`} className="hero-cta">
          View details →
        </Link>
      </div>

      <style jsx>{`
        .hero {
          position: relative;
          min-height: 60vh;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }
        .hero-backdrop {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center 20%;
          filter: saturate(0.9);
        }
        .hero-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            var(--wobl-bg) 5%,
            rgba(20, 17, 15, 0.6) 45%,
            rgba(20, 17, 15, 0.15) 100%
          );
        }
        .hero-content {
          position: relative;
          z-index: 1;
          padding: 3rem 2rem 4rem;
          max-width: 720px;
        }
        @media (max-width: 640px) {
          .hero {
            min-height: 46vh;
          }
          .hero-content {
            padding: 1.5rem 1.25rem 2rem;
          }
        }
        .hero-eyebrow {
          font-family: var(--wobl-mono);
          font-size: 0.75rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--wobl-amber);
        }
        .hero-title {
          font-family: var(--wobl-display);
          font-size: clamp(2.2rem, 5vw, 3.75rem);
          font-weight: 600;
          color: var(--wobl-cream);
          margin: 0.4rem 0 0.75rem;
          line-height: 1.05;
        }
        .hero-meta {
          display: flex;
          gap: 1rem;
          font-family: var(--wobl-mono);
          font-size: 0.9rem;
          color: var(--wobl-cream-dim);
          margin-bottom: 1rem;
        }
        .hero-rating {
          color: var(--wobl-marquee);
        }
        .hero-badge {
          border: 1px solid var(--wobl-cream-dim);
          border-radius: 3px;
          padding: 0.05rem 0.5rem;
        }
        .hero-desc {
          color: var(--wobl-cream-dim);
          font-size: 1rem;
          line-height: 1.5;
          margin-bottom: 1.5rem;
          max-width: 55ch;
        }
        @media (max-width: 640px) {
          /* Desktop gets the full pitch; mobile stays scannable —
             description trimmed via CSS line-clamp instead of removed
             entirely, so context isn't lost, just condensed. */
          .hero-desc {
            font-size: 0.9rem;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
        .hero-cta {
          display: inline-block;
          font-family: var(--wobl-mono);
          font-size: 0.9rem;
          color: var(--wobl-marquee);
          text-decoration: none;
          border-bottom: 1px solid var(--wobl-marquee);
          padding-bottom: 2px;
        }
        .hero-cta:hover {
          color: var(--wobl-amber);
          border-color: var(--wobl-amber);
        }
      `}</style>
    </section>
  );
}

function Section({ eyebrow, title, items, emptyText }) {
  return (
    <section className="section">
      <div className="section-head">
        <span className="section-eyebrow">{eyebrow}</span>
        <h2 className="section-title">{title}</h2>
      </div>

      {items && items.length > 0 ? (
        <div className="grid">
          {items.map((item, i) => (
            <MovieCard key={item.id} item={item} frame={i + 1} />
          ))}
        </div>
      ) : (
        <p className="empty">{emptyText}</p>
      )}

      <style jsx>{`
        .section {
          padding: 2.5rem 2rem 0;
        }
        @media (max-width: 640px) {
          .section {
            padding: 1.75rem 1.25rem 0;
          }
        }
        @media (min-width: 1440px) {
          /* Desktop-only breathing room — wide screens get more generous
             section spacing rather than just a wider grid. */
          .section {
            padding: 3.5rem 3rem 0;
          }
        }
        .section-head {
          margin-bottom: 1.25rem;
        }
        .section-eyebrow {
          display: block;
          font-family: var(--wobl-mono);
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--wobl-marquee);
          margin-bottom: 0.25rem;
        }
        .section-title {
          font-family: var(--wobl-display);
          font-size: 1.6rem;
          color: var(--wobl-cream);
          margin: 0;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          gap: 1.25rem;
        }
        @media (max-width: 640px) {
          .grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.85rem;
          }
        }
        @media (min-width: 1440px) {
          .grid {
            grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
            gap: 1.5rem;
          }
        }
        .empty {
          color: var(--wobl-cream-dim);
          font-family: var(--wobl-mono);
          font-size: 0.9rem;
        }
      `}</style>
    </section>
  );
}
