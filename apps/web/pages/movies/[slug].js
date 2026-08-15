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

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const item = await getBySlug(params?.slug);
  if (!item) return { notFound: true };
  const related = await getRelated(item, 6);
  return { props: { item, related }, revalidate: 3600 };
}

export default function MovieDetailPage({ item, related }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("trailer"); // 'trailer' | 'backdrop'

  useEffect(() => {
    if (!item) return;
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
        <main
          style={{ background: W.bg, minHeight: "100vh", padding: "3rem 2rem" }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div
              style={{
                aspectRatio: "16/9",
                borderRadius: W.radius,
                background: W.surface,
                animation: "woblDetailPulse 1.4s ease-in-out infinite",
              }}
            />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const genres = (item.genre || "")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);
  const backdrop = item.backdrop_path || item.image;
  const poster = item.poster_path || item.image;

  return (
    <>
      <MovieSEO item={item} />
      <Navbar />

      <main style={{ background: W.bg, minHeight: "100vh" }}>
        {/* Top Hero Section */}
        <section className="hero-container">
          {/* Media Player / Ambient Backdrop */}
          <div className="hero-media">
            {activeTab === "trailer" && (item.trailer_url || item.source_id) ? (
              <div className="player-frame">
                <TrailerPlayer
                  tmdbId={item.source_id}
                  slug={item.slug}
                  itemName={item.name}
                  trailers={item.trailer_url ? [item.trailer_url] : []}
                  backdropUrl={backdrop}
                />
              </div>
            ) : (
              <div
                className="backdrop-image"
                style={{ backgroundImage: `url(${backdrop})` }}
              />
            )}
            <div className="scrim" />
          </div>

          {/* Floating Details + Poster Split */}
          <div className="hero-content">
            <div className="poster-wrapper">
              <img src={poster} alt={item.name} className="poster-img" />
            </div>

            <div className="info-card">
              <div className="card-header">
                {item.type === "tv" && <span className="eyebrow">Series</span>}
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
                {item.year && <span className="dot-sep">{item.year}</span>}
                {item.rating_count > 0 && (
                  <span className="dot-sep">
                    {item.rating_count.toLocaleString()} votes
                  </span>
                )}
              </div>

              {genres.length > 0 && (
                <div className="genre-pills">
                  {genres.map((g) => (
                    <span key={g} className="genre-pill">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {item.short_desc && <p className="desc">{item.short_desc}</p>}

              {/* View Toggle */}
              <div className="media-tabs">
                <button
                  className={`tab-btn ${activeTab === "trailer" ? "active" : ""}`}
                  onClick={() => setActiveTab("trailer")}
                >
                  Trailer
                </button>
                <button
                  className={`tab-btn ${activeTab === "backdrop" ? "active" : ""}`}
                  onClick={() => setActiveTab("backdrop")}
                >
                  Backdrop View
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Content Body */}
        <div className="content-body">
          {item.long_desc && item.long_desc !== item.short_desc && (
            <div className="section-block">
              <span className="section-eyebrow">Overview</span>
              <p className="long-desc">{item.long_desc}</p>
            </div>
          )}

          <CastList cast={item.metadata?.cast} />

          {related && related.length > 0 && (
            <section className="related">
              <span className="section-eyebrow">You Might Also Like</span>
              <div className="related-grid">
                {related.map((r) => (
                  <MovieCard key={r.id} item={r} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .hero-container {
          position: relative;
          min-height: 80vh;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        .hero-media {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .player-frame {
          width: 100%;
          height: 100%;
          background: #000;
        }
        .backdrop-image {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center 20%;
        }
        .scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            var(--wobl-bg) 5%,
            rgba(10, 9, 8, 0.75) 60%,
            rgba(10, 9, 8, 0.4) 100%
          );
        }
        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem;
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 2.5rem;
          align-items: flex-end;
        }
        .poster-wrapper {
          width: 100%;
          aspect-ratio: 2 / 3;
          border-radius: var(--wobl-radius, 14px);
          overflow: hidden;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .poster-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .info-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(24px) saturate(1.4);
          border: 0.5px solid rgba(255, 255, 255, 0.12);
          border-radius: var(--wobl-radius, 14px);
          padding: 2rem;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .eyebrow {
          font-family: var(--wobl-mono);
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--wobl-amber);
        }
        .actions {
          display: flex;
          gap: 0.5rem;
        }
        .title {
          font-family: var(--wobl-display);
          font-size: clamp(2rem, 4vw, 3rem);
          color: var(--wobl-cream);
          margin: 0.5rem 0;
          line-height: 1.1;
        }
        .meta-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: var(--wobl-mono);
          font-size: 0.85rem;
          color: var(--wobl-cream-dim);
          margin-bottom: 0.8rem;
        }
        .rating {
          color: var(--wobl-marquee);
        }
        .dot-sep::before {
          content: "·";
          margin-right: 0.6rem;
        }
        .genre-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-bottom: 1rem;
        }
        .genre-pill {
          font-size: 0.75rem;
          padding: 0.25rem 0.7rem;
          border-radius: 20px;
          border: 0.5px solid rgba(255, 255, 255, 0.15);
          color: var(--wobl-cream-dim);
        }
        .desc {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--wobl-cream-dim);
          margin-bottom: 1.25rem;
        }
        .media-tabs {
          display: flex;
          gap: 0.5rem;
        }
        .tab-btn {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: transparent;
          color: #fff;
          font-size: 0.8rem;
          cursor: pointer;
        }
        .tab-btn.active {
          background: #fff;
          color: #000;
          border-color: #fff;
        }
        .content-body {
          max-width: 1100px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }
        .section-eyebrow {
          display: block;
          font-family: var(--wobl-mono);
          font-size: 0.75rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--wobl-amber);
          margin-bottom: 0.75rem;
        }
        .long-desc {
          font-size: 1rem;
          line-height: 1.7;
          color: var(--wobl-cream-dim);
          margin-bottom: 2rem;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 1.25rem;
        }
        @media (max-width: 768px) {
          .hero-content {
            grid-template-columns: 1fr;
            align-items: center;
          }
          .poster-wrapper {
            max-width: 180px;
            margin: 0 auto;
          }
        }
      `}</style>
    </>
  );
}
