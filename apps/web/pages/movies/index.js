// pages/movies/index.js
// Wobl — Curated Cinematic Discovery Hub

import { useState, useCallback, useRef, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { getTrending, getByCategory } from "shared/lib/items";
import { getAllGenres, getByGenre } from "shared/lib/movies";
import Navbar from "components/shared/Navbar";
import Footer from "components/shared/Footer";
import MovieCard from "components/movies/MovieCard";
import MovieCardSkeleton from "components/movies/MovieCardSkeleton";
import GenreFilter from "components/movies/GenreFilter";
import { W } from "components/shared/wobl-theme";

const PAGE_SIZE = 18;

const SORTS = [
  { key: "trending", label: "Trending Now" },
  { key: "newest", label: "New Releases" },
  { key: "rating", label: "Critically Acclaimed" },
  { key: "popularity", label: "Most Viewed" },
];

export async function getStaticProps() {
  const [hero, curatedRows, initial, genres] = await Promise.all([
    getTrending(1, "movies"),
    getByCategory("movies", { limit: 8, sortBy: "rating" }),
    getByCategory("movies", { limit: PAGE_SIZE, sortBy: "trending" }),
    getAllGenres(),
  ]);

  return {
    props: {
      hero: hero[0] || null,
      curatedRows: curatedRows || [],
      initialItems: initial,
      genres,
    },
    revalidate: 3600,
  };
}

export default function MoviesHome({
  hero,
  curatedRows,
  initialItems,
  genres,
}) {
  const [sort, setSort] = useState("trending");
  const [activeGenre, setActiveGenre] = useState(null);
  const [items, setItems] = useState(initialItems);
  const [offset, setOffset] = useState(initialItems.length);
  const [hasMore, setHasMore] = useState(initialItems.length === PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  const sentinelRef = useRef(null);
  const activeGenreRef = useRef(null);
  activeGenreRef.current = activeGenre;

  // Handle Sort changes with instant feedback
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

  // Handle Genre selection
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

  // Infinite scroll load more handler
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
        <title>Curated Cinema & Series — Wobl</title>
        <meta
          name="description"
          content="Real ratings, pristine aesthetics, zero algorithmic noise."
        />
      </Head>

      <Navbar />

      <main className="movies-destination">
        {/* --- 1. IMMERSIVE CINEMATIC HERO SPOTLIGHT --- */}
        {hero && (
          <section className="hero-stage">
            <div
              className="hero-backdrop"
              style={{ backgroundImage: `url(${backdrop})` }}
            />
            <div className="hero-vignette" />

            <div className="hero-content">
              <div className="hero-tag">World Premiere Feature</div>
              <h1 className="hero-title">{hero.name}</h1>

              <div className="hero-meta">
                {hero.rating != null && (
                  <span className="hero-rating">
                    ★ {Number(hero.rating).toFixed(1)}
                  </span>
                )}
                {hero.year && <span className="meta-dot">{hero.year}</span>}
                {hero.runtime && (
                  <span className="meta-dot">{hero.runtime} min</span>
                )}
              </div>

              {hero.short_desc && (
                <p className="hero-desc">{hero.short_desc}</p>
              )}

              <div className="hero-actions">
                <Link href={`/movies/${hero.slug}`} className="btn-primary">
                  <span>Stream Trailer & Files</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* --- 2. EDITORIAL CURATED RAIL --- */}
        {curatedRows.length > 0 && (
          <section className="curated-rail-section">
            <div className="rail-container">
              <div className="rail-header">
                <div>
                  <span className="eyebrow-accent">Editor’s Choice</span>
                  <h2 className="section-heading">Masterclass Tier</h2>
                </div>
                <span className="rail-hint">Scroll for selection</span>
              </div>
              <div className="rail-grid">
                {curatedRows.slice(0, 5).map((item, i) => (
                  <div key={item.id} className="rail-item-wrapper">
                    <MovieCard item={item} frame={i + 1} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* --- 3. STICKY DISCOVERY & FILTER DOCK --- */}
        <section id="library" className="library-section">
          <div className="library-container">
            <div className="control-dock">
              <div className="dock-title-group">
                <span className="eyebrow-accent">Global Index</span>
                <h2 className="section-heading">The Archive</h2>
              </div>

              {/* Direct Action Sort Tabs */}
              <div className="sort-pill-group">
                {SORTS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => handleSortChange(s.key)}
                    className={`sort-tab ${sort === s.key ? "active" : ""}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Filter Pills Bar */}
            <div className="genre-dock">
              <GenreFilter
                genres={genres}
                active={activeGenre}
                onChange={handleGenreChange}
              />
            </div>

            {/* Main Interactive Grid */}
            {items.length === 0 ? (
              <div className="empty-catalog">
                <p>No cinematic matches detected in this parameter sequence.</p>
              </div>
            ) : (
              <div className="catalog-grid">
                {items.map((item, i) => (
                  <MovieCard key={item.id} item={item} frame={i + 1} />
                ))}
              </div>
            )}

            <div ref={sentinelRef} style={{ height: 20 }} />

            {loadingMore && (
              <div className="catalog-grid" style={{ marginTop: "1.5rem" }}>
                <MovieCardSkeleton count={6} />
              </div>
            )}

            {!hasMore && items.length > 0 && (
              <div className="archive-end">
                <span>End of sequence. All records indexed.</span>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .movies-destination {
          background: var(--wobl-bg, #0a0908);
          min-height: 100vh;
          color: #fff;
        }

        /* Hero Stage */
        .hero-stage {
          position: relative;
          width: 100%;
          height: 75vh;
          max-height: 640px;
          min-height: 480px;
          display: flex;
          align-items: flex-end;
          padding: 4rem 3rem;
          overflow: hidden;
        }

        .hero-backdrop {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center 20%;
          z-index: 0;
          filter: saturate(1.1);
        }

        .hero-vignette {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(10, 9, 8, 0.15) 0%,
            rgba(10, 9, 8, 0.6) 55%,
            var(--wobl-bg, #0a0908) 100%
          );
          z-index: 1;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }

        .hero-tag {
          display: inline-block;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--wobl-amber, #f59e0b);
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.3);
          padding: 0.3rem 0.85rem;
          border-radius: 20px;
          margin-bottom: 1rem;
        }

        .hero-title {
          font-family: var(--wobl-display, sans-serif);
          font-size: clamp(2.5rem, 4.5vw, 4rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: #fff;
          margin: 0 0 0.75rem;
        }

        .hero-meta {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 1rem;
        }

        .hero-rating {
          color: var(--wobl-amber, #f59e0b);
          font-weight: 600;
        }

        .meta-dot::before {
          content: "·";
          margin-right: 0.85rem;
        }

        .hero-desc {
          font-size: 1.05rem;
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.8);
          max-width: 620px;
          margin-bottom: 1.75rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 600;
          background: var(--wobl-amber, #f59e0b);
          color: #000;
          padding: 0.85rem 2rem;
          border-radius: 40px;
          text-decoration: none;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          background: #fbbf24;
          box-shadow: 0 16px 35px rgba(245, 158, 11, 0.25);
        }

        /* Editorial Curated Rail */
        .curated-rail-section {
          max-width: 1320px;
          margin: 0 auto;
          padding: 3rem 2.5rem 1rem;
        }

        .rail-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .rail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 0.75rem;
        }

        .eyebrow-accent {
          display: block;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--wobl-amber, #f59e0b);
          margin-bottom: 0.25rem;
        }

        .section-heading {
          font-family: var(--wobl-display, sans-serif);
          font-size: 1.75rem;
          margin: 0;
          color: #fff;
          letter-spacing: -0.01em;
        }

        .rail-hint {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.35);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .rail-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 1.5rem;
        }

        /* Library Control Dock & Grid */
        .library-section {
          max-width: 1320px;
          margin: 0 auto;
          padding: 3rem 2.5rem 6rem;
        }

        .library-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .control-dock {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 1.25rem;
        }

        .sort-pill-group {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .sort-tab {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.75rem;
          letter-spacing: 0.06em;
          padding: 0.55rem 1.25rem;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sort-tab:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .sort-tab.active {
          background: rgba(245, 158, 11, 0.12);
          border-color: var(--wobl-amber, #f59e0b);
          color: var(--wobl-amber, #f59e0b);
          font-weight: 600;
        }

        .genre-dock {
          padding-bottom: 0.5rem;
        }

        .catalog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.75rem;
        }

        .empty-catalog,
        .archive-end {
          text-align: center;
          padding: 4rem 1rem;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.8rem;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.35);
          text-transform: uppercase;
        }

        @media (max-width: 1024px) {
          .rail-grid {
            grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .hero-stage {
            padding: 3rem 1.5rem;
            height: 65vh;
          }
          .curated-rail-section,
          .library-section {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
          .control-dock {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </>
  );
}
