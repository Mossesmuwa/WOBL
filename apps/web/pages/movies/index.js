// pages/movies/index.js
// Wobl — Movies landing. Rebuilt to match the reference layout: rich
// hero with real meta row, horizontal Pick-for-Me, persistent-play-circle
// thumbnail rows, icon-led Explore Deeper. Buttons/colors are Wobl's own
// system. NOTE: runtime and content rating (PG-13 etc.) are NOT in the
// schema/TMDBProvider output — honestly excluded from the hero meta row
// rather than fabricated to match the reference image exactly.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
import SaveButton from "../../components/movies/SaveButton";
import PickForMe from "../../components/movies/PickForMe";
import { W } from "../../components/shared/wobl-theme";

export async function getStaticProps() {
  const [hero, thisWeek, freshPrints, genres] = await Promise.all([
    getTrending(5, "movies"),
    getTrending(6, "movies"),
    getByCategory("movies", { limit: 12, sortBy: "newest" }),
    getAllGenres(),
  ]);

  return {
    props: { heroItems: hero, thisWeek, freshPrints, genres },
    revalidate: 3600,
  };
}

export default function MoviesLanding({
  heroItems,
  thisWeek,
  freshPrints,
  genres,
}) {
  const [signalGenre, setSignalGenre] = useState(null);
  const [signalItems, setSignalItems] = useState([]);
  const [signalLoading, setSignalLoading] = useState(true);

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
        {heroItems && heroItems.length > 0 && (
          <HeroCarousel items={heroItems} />
        )}

        <PickForMe genres={genres} />

        {thisWeek && thisWeek.length > 0 && (
          <Reveal>
            <ThumbRow
              eyebrow="This week"
              title="What's trending right now."
              items={thisWeek}
            />
          </Reveal>
        )}

        {!signalLoading && signalItems.length > 0 && (
          <Reveal delay={0.05}>
            <ThumbRow
              eyebrow={`Because you're into ${signalGenre}`}
              badge="Based on your picks"
              items={signalItems}
            />
          </Reveal>
        )}

        <Reveal delay={0.1}>
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              padding: "2.5rem 2rem 0",
            }}
          >
            <SectionHeading eyebrow="Fresh Prints" title="Newest additions." />
            {freshPrints.length === 0 ? (
              <MovieCardSkeleton count={6} />
            ) : (
              <div className="movie-grid">
                {freshPrints.map((item) => (
                  <MovieCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <ExploreDeeper />
        </Reveal>
      </main>

      <Footer />

      <style jsx>{`
        .movie-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }
        @media (max-width: 480px) {
          .movie-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.6rem;
          }
        }
        @media (min-width: 1440px) {
          .movie-grid {
            grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
            gap: 1.4rem;
          }
        }
      `}</style>
    </>
  );
}

function HeroCarousel({ items }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const item = items[index];
  const backdrop = item.backdrop_path || item.image;

  useEffect(() => {
    if (paused || items.length <= 1) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [paused, items.length]);

  return (
    <section
      className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          className="hero-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          style={backdrop ? { backgroundImage: `url(${backdrop})` } : undefined}
        />
      </AnimatePresence>
      <div className="hero-scrim" />

      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          className="hero-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4 }}
        >
          <span className="hero-eyebrow">Playing now</span>
          <h1 className="hero-title">{item.name}</h1>
          <div className="hero-meta">
            {item.rating != null && (
              <span className="rating">★ {item.rating}</span>
            )}
            {item.year && <span>{item.year}</span>}
          </div>
          {item.short_desc && <p className="hero-desc">{item.short_desc}</p>}
          <div className="hero-actions">
            <Link href={`/movies/${item.slug}`} className="btn-primary">
              <PlayIconSm /> Watch trailer
            </Link>
            <SaveButton item={item} />
          </div>
        </motion.div>
      </AnimatePresence>

      {items.length > 1 && (
        <div className="hero-dots">
          {items.map((it, i) => (
            <button
              key={it.id}
              className={`hero-dot ${i === index ? "active" : ""}`}
              onClick={() => setIndex(i)}
              aria-label={`Show ${it.name}`}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .hero {
          position: relative;
          min-height: 58vh;
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
            ${W.bg} 5%,
            rgba(10, 9, 8, 0.5) 45%,
            rgba(10, 9, 8, 0.1) 100%
          );
        }
        .hero-content {
          position: relative;
          z-index: 1;
          padding: 3rem 2rem 3.5rem;
          max-width: 620px;
        }
        .hero-eyebrow {
          font-family: ${W.monoFont};
          font-size: 0.75rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: ${W.amber};
        }
        .hero-title {
          font-family: ${W.displayFont};
          font-size: clamp(2rem, 5vw, 3.2rem);
          color: ${W.cream};
          margin: 0.4rem 0 0.6rem;
          line-height: 1.05;
        }
        .hero-meta {
          display: flex;
          gap: 0.8rem;
          font-family: ${W.monoFont};
          font-size: 0.85rem;
          color: ${W.creamDim};
          margin-bottom: 0.75rem;
        }
        .rating {
          color: ${W.marquee};
        }
        .hero-desc {
          font-family: ${W.bodyFont};
          font-size: 0.95rem;
          line-height: 1.55;
          color: ${W.creamDim};
          margin-bottom: 1.25rem;
          max-width: 55ch;
        }
        .hero-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.65rem 1.3rem;
          border-radius: 8px;
          background: linear-gradient(135deg, ${W.marquee}, ${W.amber});
          color: #0a0908;
          font-family: ${W.bodyFont};
          font-size: 0.88rem;
          font-weight: 600;
          text-decoration: none;
        }
        .hero-dots {
          position: absolute;
          z-index: 2;
          bottom: 1.25rem;
          right: 2rem;
          display: flex;
          gap: 0.4rem;
        }
        .hero-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          padding: 0;
          transition:
            background 0.2s ease,
            width 0.2s ease;
        }
        .hero-dot.active {
          background: ${W.marquee};
          width: 18px;
          border-radius: 3px;
        }
      `}</style>
    </section>
  );
}

function PlayIconSm() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function SectionHeading({ eyebrow, title, badge }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: "0.25rem",
      }}
    >
      <div>
        <span
          style={{
            fontFamily: W.monoFont,
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: W.marquee,
          }}
        >
          {eyebrow}
        </span>
        {badge && (
          <span
            style={{
              marginLeft: 8,
              fontFamily: W.monoFont,
              fontSize: 10,
              color: W.creamFaint,
              border: `0.5px solid ${W.surfaceBorder}`,
              borderRadius: 10,
              padding: "1px 8px",
            }}
          >
            {badge}
          </span>
        )}
        {title && (
          <div
            style={{
              fontFamily: W.bodyFont,
              fontSize: 13,
              color: W.creamDim,
              marginTop: 4,
            }}
          >
            {title}
          </div>
        )}
      </div>
      <Link
        href="/movies/browse"
        style={{
          fontFamily: W.bodyFont,
          fontSize: 13,
          color: W.creamDim,
          textDecoration: "none",
        }}
      >
        View all →
      </Link>
    </div>
  );
}

function ThumbRow({ eyebrow, title, badge, items }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 2rem 0" }}>
      <SectionHeading eyebrow={eyebrow} title={title} badge={badge} />
      <div className="thumb-grid">
        {items.map((item) => (
          <ThumbCard key={item.id} item={item} />
        ))}
      </div>
      <style jsx>{`
        .thumb-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.9rem;
          margin-top: 1.1rem;
        }
        @media (max-width: 480px) {
          .thumb-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.55rem;
          }
        }
        @media (min-width: 1440px) {
          .thumb-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
}

function ExploreDeeper() {
  const items = [
    {
      href: "/movies/browse",
      label: "Browse everything",
      sub: "See all movies",
      icon: "grid",
    },
    {
      href: "/movies/browse",
      label: "By genre",
      sub: "Find by what you love",
      icon: "tag",
    },
    {
      href: "/movies/upcoming",
      label: "Upcoming",
      sub: "What's coming soon",
      icon: "calendar",
    },
  ];
  return (
    <div
      style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem 4rem" }}
    >
      <div
        style={{
          fontFamily: W.monoFont,
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: W.marquee,
          marginBottom: 4,
        }}
      >
        Explore Deeper
      </div>
      <div
        style={{
          fontFamily: W.bodyFont,
          fontSize: 13,
          color: W.creamDim,
          marginBottom: "1.5rem",
        }}
      >
        Find exactly what you're in the mood for.
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {items.map((it) => (
          <Link
            key={it.label}
            href={it.href}
            style={{
              display: "flex",
              gap: 12,
              textDecoration: "none",
              alignItems: "center",
            }}
          >
            <ExploreIcon type={it.icon} />
            <div>
              <div
                style={{
                  fontFamily: W.bodyFont,
                  fontSize: 14,
                  fontWeight: 600,
                  color: W.cream,
                }}
              >
                {it.label}
              </div>
              <div
                style={{
                  fontFamily: W.bodyFont,
                  fontSize: 12,
                  color: W.creamFaint,
                }}
              >
                {it.sub}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ExploreIcon({ type }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: W.marquee,
    strokeWidth: 2,
  };
  if (type === "grid") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    );
  }
  if (type === "tag") {
    return (
      <svg {...common}>
        <path d="M20.59 13.41L11 3.83V3H3v8h.83L13.41 20.59a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
