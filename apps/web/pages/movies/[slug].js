// pages/movies/[slug].js
// Wobl — Premium Movie Detail Page (Redesigned)
// Sophisticated design, premium spacing, smooth animations, visual hierarchy

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

import { getBySlug, getRelated } from "shared/lib/items";

import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import Reveal from "../../components/shared/Reveal";
import MovieCard from "../../components/movies/MovieCard";
import TrailerPlayer from "../../components/movies/TrailerPlayer";
import CastList from "../../components/movies/CastList";
import MovieSEO from "../../components/movies/MovieSEO";
import SaveButton from "../../components/movies/SaveButton";
import ShareButton from "../../components/movies/ShareButton";
import RatingRing from "../../components/movies/RatingRing";
import { W } from "../../components/shared/wobl-theme";

function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const slug = params?.slug;
  if (!slug) return { notFound: true };

  try {
    const item = await getBySlug(slug);
    if (!item) return { notFound: true };
    const related = (await getRelated(item, 6)) || [];

    return { props: { item, related }, revalidate: 3600 };
  } catch (error) {
    console.error("Failed to fetch detail item:", error);
    return { notFound: true };
  }
}

export default function MovieDetailPage({ item, related }) {
  const router = useRouter();
  const [credits, setCredits] = useState({ cast: [], crew: [] });
  const [creditsLoading, setCreditsLoading] = useState(true);

  useEffect(() => {
    if (!item?.slug) return;
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: item.slug }),
    }).catch(() => {});
  }, [item?.slug]);

  useEffect(() => {
    if (!item?.source_id) {
      setCreditsLoading(false);
      return;
    }
    let cancelled = false;

    async function loadCredits() {
      try {
        setCreditsLoading(true);
        const query = new URLSearchParams();
        query.set("tmdb_id", String(item.source_id));
        const response = await fetch(`/api/tmdb/credits?${query.toString()}`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          if (!cancelled) setCredits({ cast: [], crew: [] });
          return;
        }
        const data = await response.json();
        if (cancelled) return;
        setCredits({
          cast: Array.isArray(data?.cast) ? data.cast : [],
          crew: Array.isArray(data?.crew) ? data.crew : [],
        });
      } catch (error) {
        console.warn(
          "[MovieDetail] Credits unavailable:",
          error?.message || error,
        );
        if (!cancelled) setCredits({ cast: [], crew: [] });
      } finally {
        if (!cancelled) setCreditsLoading(false);
      }
    }

    loadCredits();
    return () => {
      cancelled = true;
    };
  }, [item?.source_id]);

  if (router.isFallback || !item) {
    return (
      <>
        <Navbar />
        <main className="loading-page" style={{ background: W.bg }}>
          <div className="page-skeleton" />
        </main>
        <Footer />
        <style jsx>{`
          .loading-page {
            min-height: 100vh;
            padding: 3rem 2rem;
          }
          .page-skeleton {
            max-width: 1260px;
            height: 70vh;
            margin: 0 auto;
            border-radius: 24px;
            background: rgba(255, 255, 255, 0.035);
            animation: woblPulse 1.5s ease-in-out infinite;
          }
          @keyframes woblPulse {
            0%,
            100% {
              opacity: 0.45;
            }
            50% {
              opacity: 0.8;
            }
          }
        `}</style>
      </>
    );
  }

  const genres =
    typeof item.genre === "string"
      ? item.genre
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean)
      : [];

  const backdrop = item.backdrop_path || item.image || "";
  const poster = item.image || "";

  return (
    <>
      <MovieSEO item={item} />
      <Navbar />

      <main className="movie-page" style={{ background: W.bg }}>
        {/* Ambient Backdrop */}
        {backdrop && (
          <div
            className="ambient-backdrop"
            style={{ backgroundImage: `url(${backdrop})` }}
            aria-hidden="true"
          />
        )}
        {backdrop && <div className="ambient-wash" aria-hidden="true" />}

        {/* Hero Section */}
        <motion.section
          className="hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="hero-inner">
            <div className="movie-identity">
              {poster && (
                <motion.div
                  className="poster-container"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <img
                    src={poster}
                    alt={`${item.name} poster`}
                    className="poster"
                  />
                </motion.div>
              )}

              <motion.div
                className="movie-information"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Top Actions */}
                <div className="info-topline">
                  <span className="eyebrow">
                    {item.type === "tv" ? "TV Series" : "Movie"}
                  </span>
                  <div className="actions">
                    <motion.a
                      href={`/movies/${item.slug}/watch`}
                      className="watch-now-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Watch Now
                    </motion.a>
                    <SaveButton item={item} />
                    <ShareButton item={item} />
                  </div>
                </div>

                {/* Title & Rating */}
                <div className="title-rating-row">
                  <h1 className="title">{item.name}</h1>
                  {item.rating != null && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <RatingRing rating={item.rating} />
                    </motion.div>
                  )}
                </div>

                {/* Meta Row */}
                <div className="meta-row">
                  {item.year && <span>{item.year}</span>}
                  {item.rating_count > 0 && (
                    <span>{item.rating_count.toLocaleString()} ratings</span>
                  )}
                </div>

                {/* Genre Pills */}
                {genres.length > 0 && (
                  <motion.div
                    className="genre-pills"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {genres.map((g, idx) => (
                      <motion.span
                        key={g}
                        className="genre-pill"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + idx * 0.05 }}
                      >
                        {g}
                      </motion.span>
                    ))}
                  </motion.div>
                )}

                {/* Short Description */}
                {item.short_desc && (
                  <p className="short-desc">{item.short_desc}</p>
                )}

                {/* Director Credit */}
                {item.director && (
                  <div className="director-credit">
                    Directed by{" "}
                    <a href={`/movies/director/${slugify(item.director)}`}>
                      {item.director}
                    </a>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Storyline Section */}
        <Reveal>
          <section className="content-section storyline-section">
            <div className="content-inner">
              <div className="section-header">
                <div>
                  <span className="section-eyebrow">The Story</span>
                  <h2 className="section-title">Storyline</h2>
                </div>
              </div>
              {item.long_desc ? (
                <p className="long-desc">{item.long_desc}</p>
              ) : (
                <p className="empty-copy">No storyline available.</p>
              )}
            </div>
          </section>
        </Reveal>

        {/* Trailer Section */}
        <Reveal delay={0.05}>
          <section className="content-section trailer-section">
            <div className="content-inner trailer-inner">
              <div className="section-header">
                <div>
                  <span className="section-eyebrow">Preview</span>
                  <h2 className="section-title">
                    {item.type === "tv" ? "Latest Trailer" : "Official Trailer"}
                  </h2>
                </div>
              </div>
              <div className="trailer-wrapper">
                <TrailerPlayer
                  tmdbId={item.source_id}
                  slug={item.slug}
                  itemName={item.name}
                  trailers={item.trailer_url ? [item.trailer_url] : []}
                  backdropUrl={backdrop}
                />
              </div>
            </div>
          </section>
        </Reveal>

        {/* Cast Section */}
        <Reveal delay={0.1}>
          <section className="content-section cast-section">
            <div className="content-inner">
              <div className="section-header">
                <div>
                  <span className="section-eyebrow">Talent</span>
                  <h2 className="section-title">Cast & Crew</h2>
                </div>
              </div>
              <CastList
                cast={credits.cast}
                crew={credits.crew}
                loading={creditsLoading}
              />
            </div>
          </section>
        </Reveal>

        {/* Related Section */}
        {related && related.length > 0 && (
          <Reveal delay={0.15}>
            <section className="content-section related-section">
              <div className="content-inner">
                <div className="section-header">
                  <div>
                    <span className="section-eyebrow">More to Explore</span>
                    <h2 className="section-title">Related Titles</h2>
                  </div>
                </div>
                <div className="related-grid">
                  {related.map((rel) => (
                    <MovieCard key={rel.id} item={rel} />
                  ))}
                </div>
              </div>
            </section>
          </Reveal>
        )}
      </main>

      <Footer />

      <style jsx>{`
        .movie-page {
          position: relative;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* Ambient Effects */
        .ambient-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          opacity: 0.08;
          filter: blur(40px);
          pointer-events: none;
          z-index: 0;
        }

        .ambient-wash {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            ellipse at center,
            transparent 0%,
            var(--wobl-bg, #0a0a0a) 100%
          );
          pointer-events: none;
          z-index: 1;
        }

        /* Hero Section */
        .hero {
          position: relative;
          z-index: 2;
          padding: 4rem 2rem 3rem;
        }

        .hero-inner {
          max-width: 1260px;
          margin: 0 auto;
        }

        .movie-identity {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 3rem;
          align-items: flex-start;
        }

        .poster-container {
          flex-shrink: 0;
          width: 240px;
          aspect-ratio: 2/3;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .poster {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .movie-information {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .info-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }

        .eyebrow {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--wobl-amber, #f59e0b);
          font-weight: 500;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .watch-now-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.7rem 1.4rem;
          background: var(--wobl-amber, #f59e0b);
          color: #0a0a0a;
          border-radius: 10px;
          font-family: var(--wobl-display, sans-serif);
          font-size: 0.95rem;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid var(--wobl-amber, #f59e0b);
        }

        .watch-now-btn:hover {
          background: #e59b00;
          border-color: #e59b00;
          box-shadow: 0 12px 32px rgba(245, 158, 11, 0.3);
        }

        /* Title & Rating Row */
        .title-rating-row {
          display: flex;
          align-items: flex-start;
          gap: 2rem;
        }

        .title {
          margin: 0;
          font-family: var(--wobl-display, sans-serif);
          font-size: clamp(2.2rem, 6vw, 4rem);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: var(--wobl-cream, #fff);
        }

        /* Meta Row */
        .meta-row {
          display: flex;
          gap: 1.5rem;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .meta-row span {
          display: flex;
          align-items: center;
        }

        /* Genre Pills */
        .genre-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .genre-pill {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid rgba(245, 158, 11, 0.4);
          background: rgba(245, 158, 11, 0.08);
          color: var(--wobl-amber, #f59e0b);
          font-family: var(--wobl-display, sans-serif);
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .genre-pill:hover {
          border-color: var(--wobl-amber, #f59e0b);
          background: rgba(245, 158, 11, 0.15);
        }

        /* Descriptions */
        .short-desc {
          font-size: 1.05rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }

        .director-credit {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .director-credit a {
          color: var(--wobl-amber, #f59e0b);
          text-decoration: none;
          transition: opacity 0.2s ease;
        }

        .director-credit a:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        /* Content Sections */
        .content-section {
          position: relative;
          z-index: 2;
          padding: 3.5rem 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .content-inner {
          max-width: 1100px;
          margin: 0 auto;
        }

        .section-header {
          margin-bottom: 2.5rem;
        }

        .section-eyebrow {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--wobl-amber, #f59e0b);
          font-weight: 500;
          display: block;
          margin-bottom: 0.5rem;
        }

        .section-title {
          margin: 0;
          font-family: var(--wobl-display, sans-serif);
          font-size: clamp(1.5rem, 4vw, 2.2rem);
          font-weight: 600;
          line-height: 1.2;
          letter-spacing: -0.01em;
          color: var(--wobl-cream, #fff);
        }

        .long-desc {
          font-size: 1.05rem;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.75);
          margin: 0;
        }

        .empty-copy {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
          font-style: italic;
        }

        /* Trailer Section */
        .trailer-inner {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .trailer-wrapper {
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        /* Related Grid */
        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 1.2rem;
          margin-top: 2rem;
        }

        /* Responsive */
        @media (max-width: 960px) {
          .hero {
            padding: 3rem 2rem 2.5rem;
          }

          .movie-identity {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }

          .poster-container {
            width: 200px;
            margin: 0 auto;
          }

          .title {
            font-size: clamp(1.8rem, 5vw, 2.8rem);
          }

          .info-topline {
            flex-direction: column;
            align-items: flex-start;
          }

          .title-rating-row {
            flex-direction: column;
          }
        }

        @media (max-width: 640px) {
          .hero {
            padding: 2rem 1.5rem;
          }

          .movie-information {
            gap: 1.5rem;
          }

          .poster-container {
            width: 160px;
          }

          .title {
            font-size: clamp(1.5rem, 6vw, 2.2rem);
          }

          .short-desc {
            font-size: 0.95rem;
          }

          .content-section {
            padding: 2.5rem 1.5rem;
          }

          .section-title {
            font-size: clamp(1.2rem, 4vw, 1.8rem);
          }

          .related-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.8rem;
          }
        }
      `}</style>
    </>
  );
}
