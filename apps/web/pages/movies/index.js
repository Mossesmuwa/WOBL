// pages/movies/index.js
// Wobl — Premium Movies Landing Page (Redesigned)
// Rich hero, sophisticated sections, premium typography, smooth animations

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import { getTrending, getByCategory } from "shared/lib/items";
import { getAllGenres, getByGenre } from "shared/lib/movies";
import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import Reveal from "../../components/shared/Reveal";
import MovieCard from "../../components/movies/MovieCard";
import MovieCardSkeleton from "../../components/movies/MovieCardSkeleton";
import ThumbCard from "../../components/movies/ThumbCard";
import PickForMe from "../../components/movies/PickForMe";
import { W } from "../../components/shared/wobl-theme";

export async function getStaticProps() {
  const [hero, trending, fresh, genres] = await Promise.all([
    getTrending(4, "movies"),
    getTrending(8, "movies"),
    getByCategory("movies", { limit: 12, sortBy: "newest" }),
    getAllGenres(),
  ]);

  return {
    props: {
      heroItems: hero,
      trendingItems: trending,
      freshItems: fresh,
      genres,
    },
    revalidate: 3600,
  };
}

export default function MoviesLanding({
  heroItems,
  trendingItems,
  freshItems,
  genres,
}) {
  const [signalGenre, setSignalGenre] = useState(null);
  const [signalItems, setSignalItems] = useState([]);
  const [signalLoading, setSignalLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  // Signal genre from localStorage
  useEffect(() => {
    let genre = null;
    try {
      genre = localStorage.getItem("wobl_genre_signal");
    } catch {}
    if (!genre) {
      setSignalLoading(false);
      return;
    }
    setSignalGenre(genre);
    getByGenre(genre, { limit: 6 }).then((items) => {
      setSignalItems(items);
      setSignalLoading(false);
    });
  }, []);

  // Rotate hero every 5 seconds
  useEffect(() => {
    if (!heroItems || heroItems.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroItems]);

  const currentHero = heroItems?.[heroIndex];

  return (
    <>
      <Head>
        <title>Movies — Wobl</title>
        <meta
          name="description"
          content="Real ratings, real momentum — and one confident pick when you can't decide."
        />
      </Head>

      <Navbar />

      <main style={{ background: W.bg, minHeight: "100vh" }}>
        {/* Hero Section */}
        {currentHero && (
          <HeroBanner
            item={currentHero}
            allHeroes={heroItems}
            index={heroIndex}
          />
        )}

        {/* Pick for Me Section */}
        <PickForMe genres={genres} />

        {/* Trending Section */}
        {trendingItems && trendingItems.length > 0 && (
          <Reveal>
            <PremiumSection
              eyebrow="Trending Now"
              title="What everyone's watching"
              items={trendingItems}
              variant="normal"
            />
          </Reveal>
        )}

        {/* Signal Genre Section */}
        {!signalLoading && signalItems.length > 0 && (
          <Reveal delay={0.05}>
            <PremiumSection
              eyebrow="Personalized"
              title={`Because you love ${signalGenre}`}
              subtitle="Based on your preferences"
              items={signalItems}
              variant="normal"
            />
          </Reveal>
        )}

        {/* Fresh Prints Section */}
        <Reveal delay={0.1}>
          <PremiumSection
            eyebrow="Latest Additions"
            title="Freshly added"
            subtitle="Discover new arrivals"
            items={freshItems}
            variant="normal"
          />
        </Reveal>

        {/* Explore Section */}
        <Reveal delay={0.15}>
          <ExploreSection genres={genres} />
        </Reveal>
      </main>

      <Footer />

      <style jsx>{`
        main {
          overflow-x: hidden;
        }
      `}</style>
    </>
  );
}

/* Hero Banner Component */
function HeroBanner({ item, allHeroes, index }) {
  return (
    <motion.section className="hero-banner">
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          className="hero-slide"
          style={{
            backgroundImage: `url(${item.backdrop_path || item.image})`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="hero-overlay" />

          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="hero-badge">Featured</span>
            <h1 className="hero-title">{item.name}</h1>

            {item.short_desc && <p className="hero-desc">{item.short_desc}</p>}

            <motion.div
              className="hero-actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link href={`/movies/${item.slug}/watch`} className="btn-primary">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Now
              </Link>
              <Link href={`/movies/${item.slug}`} className="btn-secondary">
                More Info
              </Link>
            </motion.div>

            {/* Hero Indicators */}
            {allHeroes.length > 1 && (
              <motion.div
                className="hero-indicators"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {allHeroes.map((_, idx) => (
                  <motion.button
                    key={idx}
                    className={`indicator ${idx === index ? "active" : ""}`}
                    onClick={() => setHeroIndex(idx)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.95 }}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <style jsx>{`
        .hero-banner {
          position: relative;
          width: 100%;
          aspect-ratio: 21 / 9;
          overflow: hidden;
        }

        .hero-slide {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(10, 10, 10, 0.9) 0%,
            rgba(10, 10, 10, 0.5) 50%,
            rgba(10, 10, 10, 0.8) 100%
          );
        }

        .hero-content {
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 4rem;
          max-width: 60%;
        }

        .hero-badge {
          display: inline-block;
          width: fit-content;
          padding: 0.4rem 0.9rem;
          border-radius: 6px;
          background: var(--wobl-amber, #f59e0b);
          color: #0a0a0a;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 1.5rem;
        }

        .hero-title {
          margin: 0 0 1rem 0;
          font-family: var(--wobl-display, sans-serif);
          font-size: clamp(2rem, 6vw, 3.5rem);
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--wobl-cream, #fff);
        }

        .hero-desc {
          margin: 0 0 2rem 0;
          font-size: 1.05rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.8);
          max-width: 500px;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-primary,
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 0.8rem 1.6rem;
          border-radius: 10px;
          font-family: var(--wobl-display, sans-serif);
          font-size: 0.95rem;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }

        .btn-primary {
          background: var(--wobl-amber, #f59e0b);
          color: #0a0a0a;
        }

        .btn-primary:hover {
          background: #e59b00;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(245, 158, 11, 0.3);
        }

        .btn-secondary {
          background: transparent;
          color: var(--wobl-cream, #fff);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .btn-secondary:hover {
          border-color: var(--wobl-amber, #f59e0b);
          background: rgba(245, 158, 11, 0.1);
        }

        .hero-indicators {
          display: flex;
          gap: 0.6rem;
          margin-top: 2rem;
        }

        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .indicator.active {
          background: var(--wobl-amber, #f59e0b);
          width: 24px;
          border-radius: 4px;
        }

        @media (max-width: 960px) {
          .hero-content {
            max-width: 100%;
            padding: 3rem 2rem;
          }

          .hero-title {
            font-size: clamp(1.5rem, 5vw, 2.5rem);
          }

          .hero-desc {
            max-width: 100%;
            font-size: 0.95rem;
          }
        }

        @media (max-width: 640px) {
          .hero-banner {
            aspect-ratio: 16 / 9;
          }

          .hero-content {
            padding: 2rem 1.5rem;
            justify-content: flex-end;
          }

          .hero-title {
            font-size: clamp(1.2rem, 5vw, 1.8rem);
          }

          .hero-desc {
            display: none;
          }

          .hero-actions {
            flex-wrap: wrap;
          }

          .btn-primary,
          .btn-secondary {
            padding: 0.7rem 1.2rem;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </motion.section>
  );
}

/* Premium Section Component */
function PremiumSection({
  eyebrow,
  title,
  subtitle,
  items,
  variant = "normal",
}) {
  return (
    <section className="premium-section">
      <div className="section-inner">
        <div className="section-header">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2 className="title">{title}</h2>
            {subtitle && <p className="subtitle">{subtitle}</p>}
          </div>
        </div>

        {items.length === 0 ? (
          <MovieCardSkeleton count={6} />
        ) : (
          <div className="items-grid">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <MovieCard item={item} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .premium-section {
          padding: 4rem 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .section-inner {
          max-width: 1260px;
          margin: 0 auto;
        }

        .section-header {
          margin-bottom: 3rem;
        }

        .eyebrow {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--wobl-amber, #f59e0b);
          font-weight: 500;
          display: block;
          margin-bottom: 0.75rem;
        }

        .title {
          margin: 0 0 0.5rem 0;
          font-family: var(--wobl-display, sans-serif);
          font-size: clamp(1.8rem, 5vw, 2.8rem);
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.01em;
          color: var(--wobl-cream, #fff);
        }

        .subtitle {
          margin: 0;
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 1.5rem;
        }

        @media (max-width: 960px) {
          .premium-section {
            padding: 3rem 2rem;
          }

          .items-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 1.2rem;
          }
        }

        @media (max-width: 640px) {
          .premium-section {
            padding: 2.5rem 1.5rem;
          }

          .title {
            font-size: clamp(1.4rem, 4vw, 1.8rem);
          }

          .items-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.8rem;
          }
        }
      `}</style>
    </section>
  );
}

/* Explore Section */
function ExploreSection({ genres }) {
  return (
    <section className="explore-section">
      <div className="explore-inner">
        <div className="explore-header">
          <span className="eyebrow">Browse</span>
          <h2 className="title">Explore by Genre</h2>
          <p className="subtitle">Find your next favorite movie</p>
        </div>

        <div className="genres-grid">
          {genres.map((genre) => (
            <motion.div
              key={genre.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href={`/movies/explore?genre=${genre.id}`}
                className="genre-card"
              >
                <span className="genre-name">{genre.name}</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .explore-section {
          padding: 5rem 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .explore-inner {
          max-width: 1260px;
          margin: 0 auto;
        }

        .explore-header {
          margin-bottom: 3.5rem;
        }

        .eyebrow {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--wobl-amber, #f59e0b);
          font-weight: 500;
          display: block;
          margin-bottom: 0.75rem;
        }

        .title {
          margin: 0 0 0.5rem 0;
          font-family: var(--wobl-display, sans-serif);
          font-size: clamp(1.8rem, 5vw, 2.8rem);
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.01em;
          color: var(--wobl-cream, #fff);
        }

        .subtitle {
          margin: 0;
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .genres-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.2rem;
        }

        .genre-card {
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
          color: var(--wobl-cream, #fff);
          text-decoration: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
        }

        .genre-card:hover {
          border-color: var(--wobl-amber, #f59e0b);
          background: rgba(245, 158, 11, 0.08);
        }

        .genre-name {
          font-family: var(--wobl-display, sans-serif);
          font-size: 1.05rem;
          font-weight: 600;
        }

        @media (max-width: 960px) {
          .explore-section {
            padding: 3.5rem 2rem;
          }

          .genres-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 1rem;
          }
        }

        @media (max-width: 640px) {
          .explore-section {
            padding: 2.5rem 1.5rem;
          }

          .title {
            font-size: clamp(1.4rem, 4vw, 1.8rem);
          }

          .genres-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.8rem;
          }

          .genre-card {
            padding: 1rem;
          }

          .genre-name {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </section>
  );
}
