// pages/movies/explore.js
// Vura — Full Cinematic Archive & Filter Destination

import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { getByCategory } from "shared/lib/items";
import { getAllGenres } from "shared/lib/movies";
import Navbar from "components/shared/Navbar";
import Footer from "components/shared/Footer";
import MovieCard from "components/movies/MovieCard";
import MovieCardSkeleton from "components/movies/MovieCardSkeleton";
import GenreFilter from "components/movies/GenreFilter";

const PAGE_SIZE = 24;

const SORTS = [
  { key: "trending", label: "Trending Now" },
  { key: "newest", label: "New Releases" },
  { key: "rating", label: "Critically Acclaimed" },
  { key: "popularity", label: "Most Viewed" },
];

export async function getServerSideProps(context) {
  const { sort = "trending", type = "movies", genre = "" } = context.query;

  let initialItems = [];
  try {
    initialItems = await getByCategory(type, {
      limit: PAGE_SIZE,
      sortBy: sort,
      genre: genre || undefined,
    });
  } catch (err) {
    console.error("Failed to load explore archive:", err);
  }

  const genres = await getAllGenres().catch(() => []);

  return {
    props: {
      initialItems: initialItems || [],
      genres: genres || [],
      defaultSort: sort,
      defaultType: type,
      defaultGenre: genre || null,
    },
  };
}

export default function ExploreArchive({
  initialItems,
  genres,
  defaultSort,
  defaultType,
  defaultGenre,
}) {
  const router = useRouter();

  const [sort, setSort] = useState(defaultSort);
  const [type, setType] = useState(defaultType);
  const [activeGenre, setActiveGenre] = useState(defaultGenre);

  const [items, setItems] = useState(initialItems);
  const [offset, setOffset] = useState(initialItems.length);
  const [hasMore, setHasMore] = useState(initialItems.length === PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  const sentinelRef = useRef(null);

  // Sync state if router query changes externally
  useEffect(() => {
    if (router.query.sort) setSort(router.query.sort);
    if (router.query.type) setType(router.query.type);
    if (router.query.genre !== undefined)
      setActiveGenre(router.query.genre || null);
  }, [router.query]);

  // Fetch items when filters change
  const updateQueryAndFetch = useCallback(
    async (newParams) => {
      const nextSort = newParams.sort ?? sort;
      const nextType = newParams.type ?? type;
      const nextGenre =
        newParams.genre !== undefined ? newParams.genre : activeGenre;

      setLoadingMore(true);

      const query = { sort: nextSort, type: nextType };
      if (nextGenre) query.genre = nextGenre;
      router.push({ pathname: router.pathname, query }, undefined, {
        shallow: true,
      });

      try {
        const data = await getByCategory(nextType, {
          limit: PAGE_SIZE,
          sortBy: nextSort,
          genre: nextGenre || undefined,
        });
        setItems(data);
        setOffset(data.length);
        setHasMore(data.length === PAGE_SIZE);
      } catch (err) {
        console.error("Filter update failed:", err);
      } finally {
        setLoadingMore(false);
      }
    },
    [sort, type, activeGenre, router],
  );

  // Infinite scroll loader
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const more = await getByCategory(type, {
        limit: PAGE_SIZE,
        offset,
        sortBy: sort,
        genre: activeGenre || undefined,
      });
      setItems((prev) => [...prev, ...more]);
      setOffset((prev) => prev + more.length);
      setHasMore(more.length === PAGE_SIZE);
    } catch (err) {
      console.error("Load more failed:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, activeGenre, type, sort, offset]);

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

  return (
    <>
      <Head>
        <title>Explore Archive — Vura</title>
        <meta
          name="description"
          content="Browse the complete catalog of curated cinema and series."
        />
      </Head>

      <Navbar />

      <main className="explore-destination">
        <div className="explore-container">
          <div className="explore-header">
            <div>
              <span className="eyebrow-accent">Complete Directory</span>
              <h1 className="explore-title">Library Archive</h1>
            </div>

            <div className="type-toggle-group">
              <button
                onClick={() => updateQueryAndFetch({ type: "movies" })}
                className={`type-tab ${type === "movies" ? "active" : ""}`}
              >
                Movies
              </button>
              <button
                onClick={() => updateQueryAndFetch({ type: "tv" })}
                className={`type-tab ${type === "tv" ? "active" : ""}`}
              >
                Series
              </button>
            </div>
          </div>

          <div className="control-dock">
            <div className="sort-pill-group">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => updateQueryAndFetch({ sort: s.key })}
                  className={`sort-tab ${sort === s.key && !activeGenre ? "active" : ""}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="genre-dock">
            <GenreFilter
              genres={genres}
              active={activeGenre}
              onChange={(genre) => updateQueryAndFetch({ genre })}
            />
          </div>

          {items.length === 0 && !loadingMore ? (
            <div className="empty-catalog">
              <p>No titles found matching these parameters.</p>
            </div>
          ) : (
            <div className="catalog-grid">
              {items.map((item, i) => (
                <MovieCard key={`${item.id}-${i}`} item={item} frame={i + 1} />
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
      </main>

      <Footer />

      <style jsx>{`
        .explore-destination {
          background: var(--wobl-bg, #0a0908);
          min-height: 100vh;
          color: #fff;
          padding: 8rem 3rem 6rem;
        }

        .explore-container {
          max-width: 1320px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .explore-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 1.5rem;
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

        .explore-title {
          font-family: var(--wobl-display, sans-serif);
          font-size: clamp(2rem, 3.5vw, 2.75rem);
          margin: 0;
          color: #fff;
          letter-spacing: -0.01em;
        }

        .type-toggle-group {
          display: flex;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.25rem;
          border-radius: 30px;
        }

        .type-tab {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          padding: 0.5rem 1.25rem;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .type-tab.active {
          background: var(--wobl-amber, #f59e0b);
          color: #000;
          font-weight: 600;
        }

        .control-dock {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
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
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding-bottom: 1.5rem;
        }

        .catalog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
          gap: 1.75rem;
        }

        .empty-catalog,
        .archive-end {
          text-align: center;
          padding: 5rem 1rem;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.8rem;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.35);
          text-transform: uppercase;
        }

        @media (max-width: 768px) {
          .explore-destination {
            padding: 6rem 1.5rem 4rem;
          }
          .explore-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .catalog-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
          }
        }
      `}</style>
    </>
  );
}
