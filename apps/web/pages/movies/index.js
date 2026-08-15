// pages/movies/index.js
// Vura — Curated Cinematic Discovery Hub (Cinematic Marquee Edition)

import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { getTrending, getByCategory } from "shared/lib/items";
import { getAllGenres } from "shared/lib/movies";
import Navbar from "components/shared/Navbar";
import Footer from "components/shared/Footer";
import MovieCard from "components/movies/MovieCard";

export async function getStaticProps() {
  const [heroCarousel, trendingMovies, seriesRows, topRatedRows, genres] =
    await Promise.all([
      getTrending(9, "movies"),
      getByCategory("movies", { limit: 12, sortBy: "trending" }),
      getByCategory("tv", { limit: 12, sortBy: "trending" }),
      getByCategory("movies", { limit: 12, sortBy: "rating" }),
      getAllGenres(),
    ]);

  return {
    props: {
      heroCarousel: heroCarousel || [],
      trendingMovies: trendingMovies || [],
      seriesRows: seriesRows || [],
      topRatedRows: topRatedRows || [],
      genres: genres || [],
    },
    revalidate: 3600,
  };
}

export default function MoviesIndex({
  heroCarousel,
  trendingMovies,
  seriesRows,
  topRatedRows,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef(null);

  const totalHero = heroCarousel.length;

  const nextSlide = useCallback(() => {
    if (totalHero === 0) return;
    setActiveIndex((prev) => (prev + 1) % totalHero);
  }, [totalHero]);

  const prevSlide = useCallback(() => {
    if (totalHero === 0) return;
    setActiveIndex((prev) => (prev - 1 + totalHero) % totalHero);
  }, [totalHero]);

  useEffect(() => {
    if (isPaused || totalHero <= 1) return;
    timeoutRef.current = setTimeout(nextSlide, 7000);
    return () => clearTimeout(timeoutRef.current);
  }, [activeIndex, isPaused, nextSlide, totalHero]);

  const currentHero = heroCarousel[activeIndex] || heroCarousel[0] || null;
  // Ensure we lean heavily on high-res backdrop imagery, falling back gracefully
  const backdrop = currentHero?.backdrop_path || currentHero?.image || "";

  return (
    <>
      <Head>
        <title>Cinematic Index & Series — Vura</title>
        <meta
          name="description"
          content="Immersive cinema, premium series, and curated editorial rails."
        />
      </Head>

      <Navbar />

      <main className="movies-index">
        {/* --- 1. CINEMATIC HERO MARQUEE (TOP 9) --- */}
        {heroCarousel.length > 0 && (
          <section
            className="hero-marquee"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Background Layer with Smooth Crossfade */}
            <div
              key={currentHero.id}
              className="hero-backdrop-layer fade-in"
              style={{ backgroundImage: `url(${backdrop})` }}
            />

            {/* Multi-tier Cinematic Vignette Overlay */}
            <div className="hero-vignette-top" />
            <div className="hero-vignette-bottom" />
            <div className="hero-vignette-left" />

            {/* Glassy Interactive Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="hero-nav-arrow arrow-left"
              aria-label="Previous Featured Film"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              className="hero-nav-arrow arrow-right"
              aria-label="Next Featured Film"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            {/* Bottom-Left Positioned Minimalist Title & Action Hub */}
            <div className="hero-content">
              <div className="hero-top-meta">
                <span className="hero-rank-tag">
                  FEATURED {String(activeIndex + 1).padStart(2, "0")} /{" "}
                  {String(totalHero).padStart(2, "0")}
                </span>
                {currentHero.rating != null && (
                  <span className="hero-rating-pill">
                    ★ {Number(currentHero.rating).toFixed(1)}
                  </span>
                )}
              </div>

              <h1 className="hero-title">{currentHero.name}</h1>

              <div className="hero-specs">
                {currentHero.year && <span>{currentHero.year}</span>}
                {currentHero.runtime && (
                  <span className="spec-dot">{currentHero.runtime} min</span>
                )}
                {currentHero.genre && (
                  <span className="spec-dot">{currentHero.genre}</span>
                )}
              </div>

              <div className="hero-cta-group">
                <Link
                  href={`/movies/${currentHero.slug}`}
                  className="btn-stream"
                >
                  <span>Stream Feature</span>
                  <svg
                    width="14"
                    height="14"
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

            {/* Interactive Bottom Pagination Ticks */}
            <div className="hero-indicators">
              {heroCarousel.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`indicator-tick ${activeIndex === idx ? "active" : ""}`}
                  aria-label={`Slide ${idx + 1}: ${item.name}`}
                >
                  <span className="tick-fill" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* --- 2. TRENDING NOW RAIL --- */}
        {trendingMovies.length > 0 && (
          <section className="editorial-rail">
            <div className="rail-container">
              <div className="rail-header">
                <div>
                  <span className="rail-eyebrow">Velocity Feed</span>
                  <h2 className="rail-heading">Trending Now</h2>
                </div>
                <Link
                  href="/movies/explore?sort=trending"
                  className="rail-more-link"
                >
                  <span>Explore All</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="rail-scroller">
                {trendingMovies.map((item, i) => (
                  <div key={item.id} className="rail-card-slot">
                    <MovieCard item={item} frame={i + 1} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* --- 3. MASTERCLASS SERIES RAIL --- */}
        {seriesRows.length > 0 && (
          <section className="editorial-rail">
            <div className="rail-container">
              <div className="rail-header">
                <div>
                  <span className="rail-eyebrow">Episodic Library</span>
                  <h2 className="rail-heading">Masterclass Series</h2>
                </div>
                <Link href="/movies/explore?type=tv" className="rail-more-link">
                  <span>Explore All</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="rail-scroller">
                {seriesRows.map((item, i) => (
                  <div key={item.id} className="rail-card-slot">
                    <MovieCard item={item} frame={i + 1} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* --- 4. CRITICALLY ACCLAIMED RAIL --- */}
        {topRatedRows.length > 0 && (
          <section className="editorial-rail" style={{ marginBottom: "6rem" }}>
            <div className="rail-container">
              <div className="rail-header">
                <div>
                  <span className="rail-eyebrow">Archival Excellence</span>
                  <h2 className="rail-heading">Critically Acclaimed</h2>
                </div>
                <Link
                  href="/movies/explore?sort=rating"
                  className="rail-more-link"
                >
                  <span>Explore All</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="rail-scroller">
                {topRatedRows.map((item, i) => (
                  <div key={item.id} className="rail-card-slot">
                    <MovieCard item={item} frame={i + 1} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />

      <style jsx>{`
        .movies-index {
          background: var(--wobl-bg, #0a0908);
          min-height: 100vh;
          color: #fff;
        }

        /* Hero Marquee Stage */
        .hero-marquee {
          position: relative;
          width: 100%;
          height: 82vh;
          max-height: 740px;
          min-height: 540px;
          display: flex;
          align-items: flex-end;
          padding: 4rem 5rem 3.5rem;
          overflow: hidden;
        }

        .hero-backdrop-layer {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center 20%;
          z-index: 0;
          will-change: transform, opacity;
        }

        .fade-in {
          animation: heroFadeIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes heroFadeIn {
          from {
            opacity: 0.35;
            transform: scale(1.03);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Advanced Atmospheric Vignettes */
        .hero-vignette-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 180px;
          background: linear-gradient(
            180deg,
            rgba(10, 9, 8, 0.85) 0%,
            transparent 100%
          );
          z-index: 1;
          pointer-events: none;
        }

        .hero-vignette-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 380px;
          background: linear-gradient(
            0deg,
            var(--wobl-bg, #0a0908) 0%,
            rgba(10, 9, 8, 0.7) 45%,
            transparent 100%
          );
          z-index: 1;
          pointer-events: none;
        }

        .hero-vignette-left {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(10, 9, 8, 0.65) 0%,
            transparent 55%
          );
          z-index: 1;
          pointer-events: none;
        }

        /* Glassy Navigation Arrows */
        .hero-nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 4;
          background: rgba(15, 14, 12, 0.45);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.85);
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        .arrow-left {
          left: 2.5rem;
        }
        .arrow-right {
          right: 2.5rem;
        }

        .hero-nav-arrow:hover {
          background: rgba(245, 158, 11, 0.2);
          border-color: var(--wobl-amber, #f59e0b);
          color: var(--wobl-amber, #f59e0b);
          transform: translateY(-50%) scale(1.08);
          box-shadow: 0 14px 35px rgba(245, 158, 11, 0.25);
        }

        /* Bottom-Left Positioned Content Hub */
        .hero-content {
          position: relative;
          z-index: 3;
          max-width: 800px;
          width: 100%;
          margin-bottom: 0.5rem;
        }

        .hero-top-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.85rem;
        }

        .hero-rank-tag {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.68rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--wobl-amber, #f59e0b);
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.3);
          padding: 0.3rem 0.85rem;
          border-radius: 20px;
        }

        .hero-rating-pill {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.72rem;
          color: var(--wobl-amber, #f59e0b);
          background: rgba(10, 9, 8, 0.7);
          backdrop-filter: blur(8px);
          padding: 0.3rem 0.75rem;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-weight: 600;
        }

        .hero-title {
          font-family: var(--wobl-display, sans-serif);
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: #fff;
          margin: 0 0 0.6rem;
          text-shadow: 0 4px 25px rgba(0, 0, 0, 0.6);
        }

        .hero-specs {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 1.5rem;
        }

        .spec-dot::before {
          content: "·";
          margin-right: 0.75rem;
        }

        .btn-stream {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.78rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 600;
          background: var(--wobl-amber, #f59e0b);
          color: #000;
          padding: 0.85rem 2.2rem;
          border-radius: 40px;
          text-decoration: none;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .btn-stream:hover {
          transform: translateY(-2px);
          background: #fbbf24;
          box-shadow: 0 14px 35px rgba(245, 158, 11, 0.3);
        }

        /* Hero Ticks Pagination */
        .hero-indicators {
          position: absolute;
          bottom: 3.5rem;
          right: 5rem;
          display: flex;
          gap: 0.4rem;
          z-index: 3;
        }

        .indicator-tick {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          width: 32px;
          height: 4px;
          border-radius: 2px;
          cursor: pointer;
          padding: 0;
          overflow: hidden;
          transition: background 0.3s ease;
        }

        .indicator-tick.active {
          background: rgba(255, 255, 255, 0.4);
        }

        .indicator-tick.active .tick-fill {
          display: block;
          height: 100%;
          background: var(--wobl-amber, #f59e0b);
          width: 100%;
          animation: fillTick 7s linear forwards;
        }

        @keyframes fillTick {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        /* Editorial Rails */
        .editorial-rail {
          max-width: 1440px;
          margin: 0 auto;
          padding: 4rem 4rem 1.5rem;
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
          padding-bottom: 0.85rem;
        }

        .rail-eyebrow {
          display: block;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.68rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--wobl-amber, #f59e0b);
          margin-bottom: 0.25rem;
        }

        .rail-heading {
          font-family: var(--wobl-display, sans-serif);
          font-size: 1.85rem;
          margin: 0;
          color: #fff;
          letter-spacing: -0.01em;
        }

        .rail-more-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          transition: color 0.2s ease;
          padding-bottom: 0.2rem;
        }

        .rail-more-link:hover {
          color: var(--wobl-amber, #f59e0b);
        }

        /* Horizontal Scrolling Rail */
        .rail-scroller {
          display: grid;
          grid-template-columns: repeat(6, minmax(190px, 1fr));
          gap: 1.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          scrollbar-width: none;
        }

        .rail-scroller::-webkit-scrollbar {
          display: none;
        }

        .rail-card-slot {
          min-width: 190px;
        }

        @media (max-width: 1280px) {
          .hero-marquee {
            padding: 4rem 3rem;
          }
          .hero-nav-arrow.arrow-left {
            left: 1.5rem;
          }
          .hero-nav-arrow.arrow-right {
            right: 1.5rem;
          }
          .hero-indicators {
            right: 3rem;
          }
          .editorial-rail {
            padding-left: 3rem;
            padding-right: 3rem;
          }
          .rail-scroller {
            grid-template-columns: repeat(5, minmax(170px, 1fr));
          }
        }

        @media (max-width: 1024px) {
          .hero-marquee {
            padding: 3rem 2rem;
            height: 65vh;
          }
          .hero-nav-arrow {
            width: 42px;
            height: 42px;
          }
          .editorial-rail {
            padding-left: 2rem;
            padding-right: 2rem;
          }
          .rail-scroller {
            grid-template-columns: repeat(4, minmax(160px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .hero-marquee {
            padding: 2rem 1.5rem;
            height: 55vh;
          }
          .hero-nav-arrow {
            display: none;
          }
          .hero-indicators {
            display: none;
          }
          .editorial-rail {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
          .rail-scroller {
            grid-template-columns: repeat(3, minmax(140px, 1fr));
            gap: 1rem;
          }
          .rail-card-slot {
            min-width: 140px;
          }
        }
      `}</style>
    </>
  );
}
