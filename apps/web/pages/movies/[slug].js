// pages/movies/[slug].js
// WOBL — Premium Movie & Series Detail Page

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { getBySlug, getRelated } from "shared/lib/items";

import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import MovieCard from "../../components/movies/MovieCard";
import TrailerPlayer from "../../components/movies/TrailerPlayer";
import CastList from "../../components/movies/CastList";
import MovieSEO from "../../components/movies/MovieSEO";
import SaveButton from "../../components/movies/SaveButton";
import ShareButton from "../../components/movies/ShareButton";
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
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const slug = params?.slug;

  if (!slug) {
    return {
      notFound: true,
    };
  }

  try {
    const item = await getBySlug(slug);

    if (!item) {
      return {
        notFound: true,
      };
    }

    const related = (await getRelated(item, 6)) || [];

    /*
     * IMPORTANT:
     *
     * We DO NOT fetch TMDB credits here.
     *
     * The movie page must not depend on TMDB credits.
     */
    return {
      props: {
        item,
        related,
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error("Failed to fetch detail item:", error);

    return {
      notFound: true,
    };
  }
}

export default function MovieDetailPage({ item, related }) {
  const router = useRouter();

  /*
   * ==========================================================
   * CREDITS STATE
   * ==========================================================
   *
   * Credits are completely optional.
   *
   * The movie page renders regardless of these values.
   */

  const [credits, setCredits] = useState({
    cast: [],
    crew: [],
  });

  const [creditsLoading, setCreditsLoading] = useState(true);

  /*
   * ==========================================================
   * VIEW TRACKING
   * ==========================================================
   */

  useEffect(() => {
    if (!item?.slug) return;

    fetch("/api/track-view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slug: item.slug,
      }),
    }).catch(() => {
      /*
       * View tracking is non-critical.
       * Never break the movie page because tracking failed.
       */
    });
  }, [item?.slug]);

  /*
   * ==========================================================
   * DIRECT TMDB CREDITS
   * ==========================================================
   */

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
          headers: {
            Accept: "application/json",
          },
        });

        /*
         * Even if the API returns an error status,
         * do NOT break the movie page.
         */
        if (!response.ok) {
          if (!cancelled) {
            setCredits({
              cast: [],
              crew: [],
            });
          }

          return;
        }

        const data = await response.json();

        if (cancelled) {
          return;
        }

        /*
         * Only accept arrays.
         *
         * This protects the page if TMDB/API gives us
         * unexpected or incomplete data.
         */
        const cast = Array.isArray(data?.cast) ? data.cast : [];

        const crew = Array.isArray(data?.crew) ? data.crew : [];

        setCredits({
          cast,
          crew,
        });
      } catch (error) {
        /*
         * THIS IS INTENTIONAL.
         *
         * TMDB being unavailable must only affect
         * Cast & Crew.
         *
         * The movie page continues working.
         */
        console.warn(
          "[MovieDetail] Credits unavailable:",
          error?.message || error,
        );

        if (!cancelled) {
          setCredits({
            cast: [],
            crew: [],
          });
        }
      } finally {
        if (!cancelled) {
          setCreditsLoading(false);
        }
      }
    }

    loadCredits();

    return () => {
      cancelled = true;
    };
  }, [item?.source_id]);

  /*
   * ==========================================================
   * FALLBACK PAGE
   * ==========================================================
   */

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

  /*
   * ==========================================================
   * MOVIE DATA
   * ==========================================================
   */

  const genres =
    typeof item.genre === "string"
      ? item.genre
          .split(",")
          .map((genre) => genre.trim())
          .filter(Boolean)
      : [];

  const backdrop = item.backdrop_path || item.image || "";

  const poster = item.poster_path || item.image || "";

  return (
    <>
      <MovieSEO item={item} />

      <Navbar />

      <main className="movie-page" style={{ background: W.bg }}>
        {backdrop && (
          <div
            className="ambient-backdrop"
            aria-hidden="true"
            style={{
              backgroundImage: `url(${backdrop})`,
            }}
          />
        )}

        {/* =====================================================
            HERO
            ===================================================== */}

        <section className="hero">
          <div className="hero-inner">
            <div className="movie-identity">
              {poster && (
                <div className="poster-container">
                  <img
                    src={poster}
                    alt={`${item.name} poster`}
                    className="poster"
                  />
                </div>
              )}

              <div className="movie-information">
                <div className="info-topline">
                  <div className="identity-label">
                    <span className="eyebrow">
                      {item.type === "tv" ? "TV Series" : "Movie"}
                    </span>
                  </div>

                  <div className="actions">
                    <SaveButton item={item} />
                    <ShareButton item={item} />
                  </div>
                </div>

                <h1 className="title">{item.name}</h1>

                <div className="meta-row">
                  {item.rating != null && (
                    <span className="rating">★ {item.rating}</span>
                  )}

                  {item.year && <span>{item.year}</span>}

                  {item.runtime && <span>{item.runtime} min</span>}
                </div>

                {genres.length > 0 && (
                  <div className="genre-pills">
                    {genres.map((genre) => (
                      <span key={genre} className="genre-pill">
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {item.short_desc && (
                  <p className="short-desc">{item.short_desc}</p>
                )}

                {item.director && (
                  <div className="director-credit">
                    Directed by{" "}
                    <a href={`/movies/director/${slugify(item.director)}`}>
                      {item.director}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            STORYLINE
            ===================================================== */}

        <section className="content-section storyline-section">
          <div className="content-inner">
            <div className="section-heading">
              <span className="section-eyebrow">Storyline</span>

              <span className="section-line" />
            </div>

            {item.long_desc ? (
              <p className="long-desc">{item.long_desc}</p>
            ) : (
              <p className="empty-copy">
                No storyline is available for this title yet.
              </p>
            )}
          </div>
        </section>

        {/* =====================================================
            TRAILER
            ===================================================== */}

        <section className="content-section trailer-section">
          <div className="content-inner trailer-inner">
            <div className="section-heading">
              <div>
                <span className="section-eyebrow">Watch Trailer</span>

                <h2 className="section-title">
                  {item.type === "tv"
                    ? "Watch the latest trailer"
                    : "Watch the official trailer"}
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

        {/* =====================================================
            CAST & CREW
            ===================================================== */}

        <section className="content-section cast-section">
          <div className="content-inner">
            <div className="section-heading">
              <span className="section-eyebrow">Cast & Crew</span>

              <span className="section-line" />
            </div>

            {/*
             * This component is completely independent
             * from the rest of the movie page.
             */}
            <CastList
              cast={credits.cast}
              crew={credits.crew}
              loading={creditsLoading}
            />
          </div>
        </section>

        {/* =====================================================
            RELATED
            ===================================================== */}

        {related.length > 0 && (
          <section className="related-section">
            <div className="related-container">
              <div className="section-heading">
                <span className="section-eyebrow">You Might Also Like</span>

                <span className="section-line" />
              </div>

              <div className="related-grid">
                {related.map((relatedItem) => (
                  <MovieCard key={relatedItem.id} item={relatedItem} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />

      <style jsx>{`
        .movie-page {
          position: relative;
          min-height: 100vh;
          padding-bottom: 7rem;
          overflow: hidden;
        }

        .ambient-backdrop {
          position: absolute;
          z-index: 0;
          top: -120px;
          left: 0;
          right: 0;
          height: 780px;
          background-size: cover;
          background-position: center top;
          opacity: 0.13;
          filter: blur(80px);
          transform: scale(1.08);
          pointer-events: none;

          mask-image: linear-gradient(
            to bottom,
            black 0%,
            rgba(0, 0, 0, 0.7) 45%,
            transparent 100%
          );

          -webkit-mask-image: linear-gradient(
            to bottom,
            black 0%,
            rgba(0, 0, 0, 0.7) 45%,
            transparent 100%
          );
        }

        .hero,
        .content-section,
        .related-section {
          position: relative;
          z-index: 1;
        }

        .hero {
          max-width: 1260px;
          margin: 0 auto;
          padding: 4.5rem 2rem 3.5rem;
        }

        .hero-inner {
          width: 100%;
        }

        .movie-identity {
          display: grid;
          grid-template-columns: 250px minmax(0, 680px);
          gap: 3rem;
          align-items: start;
        }

        .poster-container {
          width: 250px;
          aspect-ratio: 2 / 3;
          overflow: hidden;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow:
            0 30px 70px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.02);
        }

        .poster {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .movie-information {
          min-width: 0;
          padding-top: 0.15rem;
        }

        .info-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          min-height: 34px;
        }

        .identity-label {
          min-width: 0;
        }

        .eyebrow,
        .section-eyebrow {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--wobl-amber, #f59e0b);
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-left: auto;
        }

        .title {
          max-width: 800px;
          margin: 0.55rem 0 0.8rem;
          font-family: var(--wobl-display, sans-serif);
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          line-height: 0.98;
          letter-spacing: -0.04em;
          color: var(--wobl-cream, #fff);
        }

        .meta-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.55rem;
          margin-bottom: 1.1rem;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.78rem;
          color: var(--wobl-cream-dim, #bbb);
        }

        .meta-row > span + span::before {
          content: "·";
          margin-right: 0.55rem;
          color: rgba(255, 255, 255, 0.35);
        }

        .rating {
          color: var(--wobl-amber, #f59e0b);
          font-weight: 600;
        }

        .genre-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-bottom: 1.3rem;
        }

        .genre-pill {
          padding: 0.3rem 0.7rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.035);
          color: var(--wobl-cream-dim, #ccc);
          font-family: var(--wobl-mono, monospace);
          font-size: 0.66rem;
        }

        .short-desc {
          max-width: 62ch;
          margin: 0;
          color: var(--wobl-cream-dim, #c8c8c8);
          font-size: 0.98rem;
          line-height: 1.75;
        }

        .director-credit {
          margin-top: 1.5rem;
          padding-top: 1.15rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.5);
          font-family: var(--wobl-mono, monospace);
          font-size: 0.77rem;
        }

        .director-credit a {
          color: var(--wobl-amber, #f59e0b);
          text-decoration: none;
        }

        .director-credit a:hover {
          text-decoration: underline;
        }

        .content-section {
          max-width: 1260px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .content-inner {
          padding: 3rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .section-heading {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }

        .section-line {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.06);
        }

        .long-desc {
          max-width: 860px;
          margin: 0;
          color: var(--wobl-cream-dim, #c8c8c8);
          font-size: 1.02rem;
          line-height: 1.85;
        }

        .empty-copy {
          margin: 0;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.9rem;
        }

        .trailer-inner {
          padding-top: 3.25rem;
          padding-bottom: 3.75rem;
        }

        .trailer-inner .section-heading {
          align-items: flex-end;
          margin-bottom: 1.5rem;
        }

        .section-title {
          margin: 0.4rem 0 0;
          color: var(--wobl-cream, #fff);
          font-family: var(--wobl-display, sans-serif);
          font-size: clamp(1.4rem, 2vw, 1.8rem);
          font-weight: 600;
          letter-spacing: -0.02em;
        }

        .trailer-wrapper {
          width: min(100%, 1080px);
        }

        .cast-section .content-inner {
          padding-top: 3.25rem;
        }

        .related-section {
          max-width: 1260px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .related-container {
          padding-top: 3.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 1.15rem;
        }

        @media (max-width: 960px) {
          .hero {
            padding-top: 3rem;
          }

          .movie-identity {
            grid-template-columns: 210px minmax(0, 1fr);
            gap: 2rem;
          }

          .poster-container {
            width: 210px;
          }

          .title {
            font-size: clamp(2.2rem, 6vw, 3.4rem);
          }

          .related-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .hero {
            padding: 2rem 1rem 2.5rem;
          }

          .movie-identity {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.75rem;
          }

          .poster-container {
            width: min(230px, 62vw);
          }

          .movie-information {
            width: 100%;
            text-align: center;
          }

          .info-topline {
            justify-content: center;
          }

          .actions {
            margin-left: 0;
          }

          .title {
            margin-top: 0.65rem;
            font-size: clamp(2rem, 9vw, 2.7rem);
            line-height: 1;
          }

          .meta-row {
            justify-content: center;
          }

          .genre-pills {
            justify-content: center;
          }

          .short-desc {
            margin: 0 auto;
            font-size: 0.92rem;
            line-height: 1.7;
          }

          .director-credit {
            text-align: center;
          }

          .content-section {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .content-inner {
            padding-top: 2.4rem;
            padding-bottom: 2.75rem;
          }

          .section-heading {
            gap: 0.75rem;
          }

          .section-eyebrow {
            white-space: nowrap;
            font-size: 0.65rem;
          }

          .long-desc {
            font-size: 0.95rem;
            line-height: 1.75;
          }

          .trailer-inner {
            padding-top: 2.75rem;
            padding-bottom: 3rem;
          }

          .trailer-inner .section-heading {
            display: block;
          }

          .section-title {
            font-size: 1.35rem;
          }

          .trailer-wrapper {
            width: 100%;
          }

          .related-section {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .related-container {
            padding-top: 2.75rem;
          }

          .related-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.9rem;
          }
        }
      `}</style>
    </>
  );
}
