// pages/movies/index.js
// Wobl — Movies home. The real destination once inside the site (distinct
// from the cover/vision homepage at "/"). Trailer-first, filter/sort bar
// with direct buttons (not hidden dropdowns — per Letterboxd lesson in the
// spec), infinite scroll.

import { useState, useCallback, useRef, useEffect } from "react";
import Head from "next/head";
import { getTrending, getByCategory } from "shared/lib/items";
import { getAllGenres, getByGenre } from "shared/lib/movies";
import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import MovieCard from "../../components/movies/MovieCard";
import TrailerPlayer from "../../components/movies/TrailerPlayer";
import MovieCardSkeleton from "../../components/movies/MovieCardSkeleton";
import GenreFilter from "../../components/movies/GenreFilter";
import { W } from "../../components/shared/wobl-theme";

const PAGE_SIZE = 18;

const SORTS = [
  { key: "trending", label: "Trending" },
  { key: "newest", label: "Newest" },
  { key: "rating", label: "Top Rated" },
  { key: "popularity", label: "Popular" },
];

export async function getStaticProps() {
  const [hero, thisWeek, initial, genres] = await Promise.all([
    getTrending(1, "movies"),
    getTrending(6, "movies"),
    getByCategory("movies", { limit: PAGE_SIZE, sortBy: "trending" }),
    getAllGenres(),
  ]);

  return {
    props: {
      hero: hero[0] || null,
      thisWeek,
      initialItems: initial,
      genres,
    },
    revalidate: 3600,
  };
}

export default function MoviesHome({ hero, thisWeek, initialItems, genres }) {
  const [sort, setSort] = useState("trending");
  const [activeGenre, setActiveGenre] = useState(null);
  const [items, setItems] = useState(initialItems);
  const [offset, setOffset] = useState(initialItems.length);
  const [hasMore, setHasMore] = useState(initialItems.length === PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);
  const activeGenreRef = useRef(null);
  activeGenreRef.current = activeGenre;

  // Sort change re-fetches from scratch — direct buttons, not a hidden
  // dropdown, per the spec's Letterboxd-derived lesson.
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

  // Genre change re-fetches too — kept separate from sort since genre
  // filtering uses a different query path (getByGenre doesn't support
  // every sort option getByCategory does).
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

  // Infinite scroll via IntersectionObserver on a sentinel div.
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
        <title>Movies — Wobl</title>
        <meta
          name="description"
          content="Real ratings, real momentum, no algorithm noise."
        />
      </Head>

      <Navbar />

      <main style={{ background: W.bg, minHeight: "100vh" }}>
        {hero && (
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              padding: "1.5rem 2rem 0",
            }}
          >
            <TrailerPlayer
              tmdbId={hero.source_id}
              slug={hero.slug}
              itemName={hero.name}
              trailers={hero.trailer_url ? [hero.trailer_url] : []}
              backdropUrl={hero.backdrop_path || hero.image}
            />
          </div>
        )}

        {thisWeek && thisWeek.length > 0 && <ThisWeekRow items={thisWeek} />}

        <div
          style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 2rem 0" }}
        >
          <GenreFilter
            genres={genres}
            active={activeGenre}
            onChange={handleGenreChange}
          />
          <div style={{ height: "0.75rem" }} />
          <SortBar sort={sort} onChange={handleSortChange} />

          {items.length === 0 ? (
            <EmptyState />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
                gap: "1.25rem",
                marginTop: "1.5rem",
              }}
            >
              {items.map((item, i) => (
                <MovieCard key={item.id} item={item} frame={i + 1} />
              ))}
            </div>
          )}

          <div ref={sentinelRef} style={{ height: 1 }} />

          {loadingMore && <MovieCardSkeleton count={6} />}

          {!hasMore && items.length > 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "2.5rem 0",
                fontFamily: W.monoFont,
                fontSize: 11,
                color: W.creamFaint,
              }}
            >
              That's everything — for now.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

function SortBar({ sort, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {SORTS.map((s) => (
        <button
          key={s.key}
          onClick={() => onChange(s.key)}
          style={{
            fontFamily: W.bodyFont,
            fontSize: 13,
            padding: "6px 14px",
            borderRadius: 20,
            border: `0.5px solid ${sort === s.key ? W.marquee : W.surfaceBorder}`,
            background:
              sort === s.key ? "rgba(217,113,60,0.12)" : "transparent",
            color: sort === s.key ? W.marquee : W.creamDim,
            cursor: "pointer",
            transition: `all ${W.ease} 0.15s`,
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function ThisWeekRow({ items }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 2rem 0" }}>
      <div
        style={{
          fontFamily: W.monoFont,
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: W.marquee,
          marginBottom: 14,
        }}
      >
        This week · hover to preview
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        {items.map((item) => (
          <TrailerThumb key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function TrailerThumb({ item }) {
  return (
    <a
      href={`/movies/${item.slug}`}
      style={{
        position: "relative",
        display: "block",
        aspectRatio: "16/9",
        borderRadius: 10,
        overflow: "hidden",
        textDecoration: "none",
        backgroundImage: item.backdrop_path
          ? `url(${item.backdrop_path})`
          : item.image
            ? `url(${item.image})`
            : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: W.surface,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, transparent 50%, rgba(10,9,8,0.75) 100%)",
        }}
      />
      <div style={{ position: "absolute", bottom: 8, left: 10, right: 10 }}>
        <div
          style={{
            fontFamily: W.bodyFont,
            fontSize: 13,
            fontWeight: 600,
            color: W.cream,
          }}
        >
          {item.name}
        </div>
        {item.rating != null && (
          <div
            style={{ fontFamily: W.monoFont, fontSize: 10, color: W.marquee }}
          >
            ★ {item.rating}
          </div>
        )}
      </div>
    </a>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "3rem 1rem",
        fontFamily: W.bodyFont,
        fontSize: 14,
        color: W.creamDim,
      }}
    >
      Nothing here yet — the next sync will bring more titles in.
    </div>
  );
}
