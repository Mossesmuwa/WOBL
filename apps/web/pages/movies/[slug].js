// pages/movies/[slug].js
// Wobl — Premium Movie & Series Detail Page

import { useEffect } from "react";
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

const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
};

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

    return {
      props: { item, related },
      revalidate: 3600,
    };
  } catch (error) {
    console.error("Failed to fetch detail item:", error);
    return { notFound: true };
  }
}

export default function MovieDetailPage({ item, related }) {
  const router = useRouter();

  useEffect(() => {
    if (!item?.slug) return;

    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: item.slug }),
    }).catch(() => {});
  }, [item?.slug]);

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
            style={{ backgroundImage: `url(${backdrop})` }}
          />
        )}

        <section className="hero">
          <div className="hero-grid">
            <div className="hero-player">
              <TrailerPlayer
                tmdbId={item.source_id}
                slug={item.slug}
                itemName={item.name}
                trailers={item.trailer_url ? [item.trailer_url] : []}
                backdropUrl={backdrop}
              />
            </div>

            <aside className="movie-info">
              {poster && (
                <div className="poster-container">
                  <img
                    src={poster}
                    alt={`${item.name} poster`}
                    className="poster"
                  />
                </div>
              )}

              <div className="info-topline">
                {item.type === "tv" && (
                  <span className="eyebrow">TV Series</span>
                )}

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
            </aside>
          </div>
        </section>

        <section className="content-section storyline-section">
          <div className="content-inner">
            <span className="section-eyebrow">Storyline</span>

            {item.long_desc ? (
              <p className="long-desc">{item.long_desc}</p>
            ) : (
              <p className="empty-copy">
                No storyline is available for this title yet.
              </p>
            )}
          </div>
        </section>

        <section className="content-section cast-section">
          <div className="content-inner">
            <span className="section-eyebrow">Cast & Crew</span>
            <CastList cast={item.metadata?.cast} />
          </div>
        </section>

        {related.length > 0 && (
          <section className="related-section">
            <div className="related-container">
              <span className="section-eyebrow">You Might Also Like</span>

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
          top: -100px;
          left: 0;
          right: 0;
          height: 720px;
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
          padding: 4rem 2rem 4.5rem;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 330px;
          gap: 3.5rem;
          align-items: start;
        }

        .hero-player {
          min-width: 0;
        }

        .movie-info {
          min-width: 0;
          padding-top: 0.15rem;
        }

        .poster-container {
          width: 100%;
          aspect-ratio: 2 / 3;
          overflow: hidden;
          border-radius: 14px;
          margin-bottom: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 28px 55px rgba(0, 0, 0, 0.48);
        }

        .poster {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .info-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          min-height: 32px;
        }

        .eyebrow,
        .section-eyebrow {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--wobl-amber, #f59e0b);
        }

        .actions {
          display: flex;
          gap: 0.5rem;
          margin-left: auto;
        }

        .title {
          margin: 0.45rem 0 0.7rem;
          font-family: var(--wobl-display, sans-serif);
          font-size: clamp(2rem, 3vw, 2.65rem);
          line-height: 1.08;
          letter-spacing: -0.025em;
          color: var(--wobl-cream, #fff);
        }

        .meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem;
          align-items: center;
          margin-bottom: 1rem;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.8rem;
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
          margin-bottom: 1.2rem;
        }

        .genre-pill {
          padding: 0.28rem 0.7rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.035);
          color: var(--wobl-cream-dim, #ccc);
          font-size: 0.72rem;
        }

        .short-desc {
          max-width: 38ch;
          margin: 0;
          color: var(--wobl-cream-dim, #c8c8c8);
          font-size: 0.93rem;
          line-height: 1.65;
        }

        .director-credit {
          margin-top: 1.35rem;
          padding-top: 1.15rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.55);
          font-family: var(--wobl-mono, monospace);
          font-size: 0.8rem;
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
          padding: 2.75rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .section-eyebrow {
          display: block;
          margin-bottom: 1rem;
        }

        .long-desc {
          max-width: 820px;
          margin: 0;
          color: var(--wobl-cream-dim, #c8c8c8);
          font-size: 1.02rem;
          line-height: 1.8;
        }

        .empty-copy {
          margin: 0;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.9rem;
        }

        .cast-section .content-inner {
          padding-top: 2.5rem;
        }

        .related-section {
          max-width: 1260px;
          margin: 1rem auto 0;
          padding: 0 2rem;
        }

        .related-container {
          padding-top: 2.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 1.25rem;
        }

        @media (max-width: 960px) {
          .hero {
            padding-top: 2.5rem;
          }

          .hero-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }

          .movie-info {
            order: 1;
          }

          .hero-player {
            order: 2;
          }

          .poster-container {
            width: min(250px, 62vw);
            margin-left: auto;
            margin-right: auto;
          }

          .title {
            text-align: center;
          }

          .info-topline {
            justify-content: center;
          }

          .actions {
            margin-left: 0;
          }

          .meta-row,
          .genre-pills {
            justify-content: center;
          }

          .short-desc {
            max-width: 60ch;
            margin: 0 auto;
            text-align: center;
          }

          .director-credit {
            text-align: center;
          }
        }

        @media (max-width: 640px) {
          .hero {
            padding: 1.75rem 1rem 3rem;
          }

          .content-section,
          .related-section {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .content-inner,
          .related-container {
            padding-top: 2.25rem;
          }

          .title {
            font-size: clamp(1.85rem, 8vw, 2.25rem);
          }

          .long-desc {
            font-size: 0.97rem;
            line-height: 1.75;
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
