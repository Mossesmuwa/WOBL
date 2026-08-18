// components/movies/PickForMe.js
// Wobl — the actual product moment. Not a browse grid — one confident
// answer to "what should I watch," with an instant reroll.

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getRandomPick } from "shared/lib/movies";
import SaveButton from "./SaveButton";
import ShareButton from "./ShareButton";
import RatingRing from "./RatingRing";
import TrailerPlayer from "./TrailerPlayer";
import { W, glassPanel } from "../shared/wobl-theme";

export default function PickForMe({ genres = [] }) {
  const [genre, setGenre] = useState("");
  const [pick, setPick] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notEnough, setNotEnough] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  const handlePick = async () => {
    setLoading(true);
    setNotEnough(false);
    setShowTrailer(false);
    const result = await getRandomPick({ genre: genre || null });
    setLoading(false);

    if (!result) {
      setNotEnough(true);
      setPick(null);
      return;
    }

    setPick(result);

    // Lightweight session signal — feeds the "Because you're into X"
    // section without requiring login. No server write, just local.
    if (genre && typeof window !== "undefined") {
      try {
        localStorage.setItem("wobl_genre_signal", genre);
      } catch {}
    }
  };

  return (
    <section className="pick-section">
      <div className="pick-heading">
        <span className="eyebrow">Can't decide?</span>
        <h2 className="pick-title">Pick something for me</h2>
      </div>

      {!pick && !notEnough && (
        <div className="pick-controls">
          {genres.length > 0 && (
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="genre-select"
            >
              <option value="">Any genre</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={handlePick}
            disabled={loading}
            className="pick-button"
          >
            {loading ? "Picking…" : "Pick something for me"}
          </button>
        </div>
      )}

      {notEnough && (
        <div className="not-enough">
          <p>Not enough in that genre yet — try another, or leave it open.</p>
          <button
            onClick={() => {
              setNotEnough(false);
              setGenre("");
            }}
            className="pick-button-outline"
          >
            Try again
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {pick && (
          <motion.div
            key={pick.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="pick-result"
          >
            <div className="pick-poster">
              {pick.image ? (
                <img src={pick.image} alt={pick.name} />
              ) : (
                <div className="pick-poster-fallback">{pick.name}</div>
              )}
            </div>

            <div className="pick-info">
              <div className="pick-top-row">
                {pick.rating != null && (
                  <RatingRing rating={pick.rating} size={44} />
                )}
                <div className="pick-actions">
                  <SaveButton item={pick} size="small" />
                  <ShareButton item={pick} size="small" />
                </div>
              </div>

              <h3 className="pick-name">{pick.name}</h3>
              <div className="pick-meta">
                {pick.year && <span>{pick.year}</span>}
                {pick.genre && <span>{pick.genre.split(",")[0].trim()}</span>}
              </div>
              {pick.short_desc && (
                <p className="pick-desc">{pick.short_desc}</p>
              )}

              <div className="pick-cta-row">
                <button
                  onClick={() => setShowTrailer((p) => !p)}
                  className="pick-cta"
                >
                  {showTrailer ? "Hide trailer" : "Watch trailer"}
                </button>
                <a href={`/movies/${pick.slug}`} className="pick-cta-outline">
                  View details
                </a>
                <button onClick={handlePick} className="pick-reroll">
                  Not this one →
                </button>
              </div>

              {showTrailer && (
                <div className="pick-trailer">
                  <TrailerPlayer
                    tmdbId={pick.source_id}
                    slug={pick.slug}
                    itemName={pick.name}
                    trailers={pick.trailer_url ? [pick.trailer_url] : []}
                    backdropUrl={pick.backdrop_path || pick.image}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .pick-section {
          max-width: 1100px;
          margin: 2.5rem auto 0;
          padding: 0 2rem;
        }
        .pick-heading {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .eyebrow {
          display: block;
          font-family: ${W.monoFont};
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: ${W.marquee};
          margin-bottom: 0.4rem;
        }
        .pick-title {
          font-family: ${W.displayFont};
          font-size: clamp(1.6rem, 3.5vw, 2.2rem);
          color: ${W.cream};
          margin: 0;
        }
        .pick-controls {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .genre-select {
          padding: 0.7rem 1rem;
          border-radius: 30px;
          border: 0.5px solid ${W.surfaceBorder};
          background: rgba(255, 255, 255, 0.04);
          color: ${W.cream};
          font-family: ${W.bodyFont};
          font-size: 0.9rem;
        }
        .pick-button {
          padding: 0.75rem 1.6rem;
          border-radius: 30px;
          border: none;
          background: linear-gradient(135deg, ${W.marquee}, ${W.amber});
          color: #0a0908;
          font-family: ${W.bodyFont};
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
        }
        .pick-button-outline {
          padding: 0.6rem 1.3rem;
          border-radius: 30px;
          border: 1px solid ${W.marquee};
          background: none;
          color: ${W.marquee};
          font-family: ${W.bodyFont};
          font-size: 0.85rem;
          cursor: pointer;
        }
        .not-enough {
          text-align: center;
          font-family: ${W.bodyFont};
          font-size: 0.9rem;
          color: ${W.creamDim};
        }
        .pick-result {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 2rem;
          margin-top: 1.5rem;
          padding: 1.75rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(20px);
          border: 0.5px solid ${W.surfaceBorder};
        }
        .pick-poster {
          width: 200px;
          aspect-ratio: 2/3;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        .pick-poster img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .pick-poster-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${W.surface};
          color: ${W.creamDim};
          font-family: ${W.displayFont};
          text-align: center;
          padding: 1rem;
        }
        .pick-top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.6rem;
        }
        .pick-actions {
          display: flex;
          gap: 0.4rem;
        }
        .pick-name {
          font-family: ${W.displayFont};
          font-size: 1.6rem;
          color: ${W.cream};
          margin: 0 0 0.4rem;
        }
        .pick-meta {
          display: flex;
          gap: 0.6rem;
          font-family: ${W.monoFont};
          font-size: 0.8rem;
          color: ${W.creamDim};
          margin-bottom: 0.75rem;
        }
        .pick-desc {
          font-family: ${W.bodyFont};
          font-size: 0.9rem;
          line-height: 1.55;
          color: ${W.creamDim};
          margin-bottom: 1.1rem;
          max-width: 60ch;
        }
        .pick-cta-row {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          align-items: center;
        }
        .pick-cta {
          padding: 0.55rem 1.2rem;
          border-radius: 30px;
          border: none;
          background: ${W.marquee};
          color: #0a0908;
          font-family: ${W.bodyFont};
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }
        .pick-cta-outline {
          padding: 0.55rem 1.2rem;
          border-radius: 30px;
          border: 0.5px solid ${W.surfaceBorder};
          color: ${W.cream};
          text-decoration: none;
          font-family: ${W.bodyFont};
          font-size: 0.85rem;
        }
        .pick-reroll {
          background: none;
          border: none;
          color: ${W.creamDim};
          font-family: ${W.monoFont};
          font-size: 0.8rem;
          cursor: pointer;
          margin-left: auto;
        }
        .pick-trailer {
          margin-top: 1.25rem;
        }
        @media (max-width: 640px) {
          .pick-result {
            grid-template-columns: 1fr;
            justify-items: center;
            text-align: center;
          }
          .pick-cta-row {
            justify-content: center;
          }
          .pick-reroll {
            margin-left: 0;
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </section>
  );
}
