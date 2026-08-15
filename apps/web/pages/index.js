// pages/movies/index.js
// Wobl — Curated Cinematic Discovery Hub

import { useState, useCallback, useRef, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { getTrending, getByCategory } from "shared/lib/items";
import { getAllGenres, getByGenre } from "shared/lib/movies";
import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import MovieCard from "../../components/movies/MovieCard";
import MovieCardSkeleton from "../../components/movies/MovieCardSkeleton";
import GenreFilter from "../../components/movies/GenreFilter";
import { W } from "../../components/shared/wobl-theme";

const PAGE_SIZE = 18;

const SORTS = [
  { key: "trending", label: "Trending Now" },
  { key: "newest", label: "Newest Releases" },
  { key: "rating", label: "Highest Rated" },
  { key: "popularity", label: "Most Popular" },
];

export async function getStaticProps() {
  const [hero, initial, genres] = await Promise.all([
    getTrending(1, "movies"),
    getByCategory("movies", { limit: PAGE_SIZE, sortBy: "trending" }),
    getAllGenres(),
  ]);

  return {
    props: {
      hero: hero[0] || null,
      initialItems: initial,
      genres,
    },
    revalidate: 3600,
  };
}

export default function MoviesHome({ hero, initialItems, genres }) {
  const [sort, setSort] = useState("trending");
  const [activeGenre, setActiveGenre] = useState(null);
  const [items, setItems] = useState(initialItems);
  const [offset, setOffset] = useState(initialItems.length);
  const [hasMore, setHasMore] = useState(initialItems.length === PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);
  const activeGenreRef = useRef(null);
  activeGenreRef.current = activeGenre;

  // Handle Sort changes
  const handleSortChange = useCallback(async (newSort) => {
    setSort(newSort);
    setLoadingMore(true);
    const data = activeGenreRef.current
      ? await getByGenre(activeGenreRef.current, { limit: PAGE_SIZE })
      : await getByCategory("movies", { limit: PAGE_SIZE, sortBy: newSort });
    setItems(data);
    setOffset(data.length);
    setHasMore(data.length === PAGE_SIZE);
    setLoadingMore(false);
  }, []);

  // Handle Genre filter changes
  const handleGenreChange = useCallback(
    async (genre) => {
      setActiveGenre(genre);
      setLoadingMore(true);
      const data = genre
        ? await getByGenre(genre, { limit: PAGE_SIZE })
        : await getByCategory("movies", { limit: PAGE_SIZE, sortBy: sort });
      setItems(data);
      setOffset(data.length);
      setHasMore(data.length === PAGE_SIZE);
      setLoadingMore(false);
    },
    [sort],
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const more = await getByCategory("movies", {
      limit: PAGE_SIZE,
      offset,
      sortBy: sort,
    });
    setItems((prev) => [...prev, ...more]);
    setOffset((prev) => prev + more.length);
    setHasMore(more.length === PAGE_SIZE);
    setLoadingMore(false);
  }, [loadingMore, hasMore, offset, sort]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const backdrop = hero?.backdrop_path || hero?.image || "";

  return (
    <>
      <Head>
        <title>Movies & Series — Wobl</title>
        <meta
          name="description"
          content="Curated cinema, real momentum, no algorithm noise."
        />
      </Head>

      <Navbar />

      <main
        style={{ background: W.bg, minHeight: "100vh", paddingBottom: "6rem" }}
      >
        {/* --- IMMERSIVE CINEMATIC HERO SPOTLIGHT --- */}
        {hero && (
          <section className="hero-spotlight">
            <div
              className="hero-backdrop"
              style={{ backgroundImage: `url(${backdrop})` }}
            />
            <div className="hero-gradient-overlay" />

            <div className="hero-content">
              <div className="hero-badge">Featured Spotlight</div>
              <h1 className="hero-title">{hero.name}</h1>

              <div className="hero-meta">
                {hero.rating !=
                <span className="rating">★ {hero.rating}</span> && (
                  <span className="rating">★ {hero.rating}</span>
                )}
                {hero.year && <span className="dot-sep">{hero.year}</span>}
                {hero.runtime && (
                  <span className="dot-sep">{hero.runtime} min</span>
                )}
              </div>

              {hero.short_desc && (
                <p className="hero-desc">{hero.short_desc}</p>
              )}

              <div className="hero-actions">
                <Link href={`/movies/${hero.slug}`} className="primary-btn">
                  Watch Trailer & Details
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* --- UNIFIED DISCOVERY & CONTROL HUB --- */}
        <section className="discovery-hub">
          <div className="hub-container">
            <div className="hub-header">
              <span className="section-eyebrow">Explore Library</span>
              <h2 className="hub-title">All Titles</h2>
            </div>

            {/* Sort Bar */}
            <div className="sort-bar">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => handleSortChange(s.key)}
                  className={`sort-pill ${sort === s.key ? "active" : ""}`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Genre Filter */}
            <div className="genre-filter-wrapper">
              <GenreFilter
                genres={genres}
                active={activeGenre}
                onChange={handleGenreChange}
              />
            </div>

            {/* Movie Grid */}
            {items.length === 0 ? (
              <div className="empty-state">
                <span>No titles found matching this criteria.</span>
              </div>
            ) : (
              <div className="movies-grid">
                {items.map((item, i) => (
                  <MovieCard key={item.id} item={item} frame={i + 1} />
                ))}
              </div>
            )}

            <div ref={sentinelRef} style={{ height: 1 }} />

            {loadingMore && (
              <div className="skeleton-grid">
                <MovieCardSkeleton count={6} />
              </div>
            )}

            {!hasMore && items.length > 0 && (
              <div className="end-message">
                <span>You’ve reached the end of the line.</span>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        /* Hero Spotlight Styles */
        .hero-spotlight {
          position: relative;
          width: 100%;
          height: 70vh;
          max-height: 600px;
          min-height: 450px;
          display: flex;
          align-items: flex-end;
          padding: 4rem 2rem;
          overflow: hidden;
          margin-bottom: 3rem;
        }

        .hero-backdrop {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center top;
          z-index: 0;
        }

        .hero-gradient-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(10, 9, 8, 0.2) 0%,
            rgba(10, 9, 8, 0.6) 60%,
            var(--wobl-bg, #0a0908) 100%
          );
          z-index: 1;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 1100px;
          width: 100%;
          margin: 0 auto;
        }

        .hero-badge {
          display: inline-block;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--wobl-amber, #f59e0b);
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.25);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          margin-bottom: 0.75rem;
        }

        .hero-title {
          font-family: var(--wobl-display, sans-serif);
          font-size: clamp(2.2rem, 4vw, 3.5rem);
          color: var(--wobl-cream, #fff);
          margin: 0 0 0.5rem;
          line-height: 1.1;
          letter-spacing: -0.01em;
        }

        .hero-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.85rem;
          color: var(--wobl-cream-dim, #ccc);
          margin-bottom: 1rem;
        }

        .rating {
          color: var(--wobl-amber, #f59e0b);
          font-weight: 600;
        }

        .dot-sep::before {
          content: "·";
          margin-right: 0.75rem;
        }

        .hero-desc {
          font-size: 1rem;
          line-height: 1.6;
          color: var(--wobl-cream-dim, #ddd);
          max-width: 650px;
          margin-bottom: 1.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .primary-btn {
          display: inline-flex;
          align-items: center;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.82rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 600;
          background: var(--wobl-amber, #f59e0b);
          color: #000;
          padding: 0.75rem 1.75rem;
          border-radius: 30px;
          text-decoration: none;
          transition:
            transform 0.2s ease,
            background 0.2s ease;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          background: #fbbf24;
        }

        /* Discovery Hub Styles */
        .discovery-hub {
          max-width: 1260px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .hub-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .hub-header {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .section-eyebrow {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--wobl-amber, #f59e0b);
        }

        .hub-title {
          font-family: var(--wobl-display, sans-serif);
          font-size: 1.8rem;
          color: var(--wobl-cream, #fff);
          margin: 0;
        }

        .sort-bar {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .sort-pill {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.78rem;
          letter-spacing: 0.05em;
          padding: 0.5rem 1.25rem;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          color: var(--wobl-cream-dim, #aaa);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sort-pill:hover {
          background: rgba(255, 255, 255, 0.07);
          color: #fff;
        }

        .sort-pill.active {
          background: rgba(245, 158, 11, 0.12);
          border-color: var(--wobl-amber, #f59e0b);
          color: var(--wobl-amber, #f59e0b);
        }

        .genre-filter-wrapper {
          margin-bottom: 0.5rem;
        }

        .movies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1.5rem;
        }

        .empty-state,
        .end-message {
          text-align: center;
          padding: 3rem 1rem;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
      `}</style>
    </>
  );
}
