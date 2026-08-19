// components/movies/PickForMe.js
// Wobl — the core decision moment. Horizontal layout: heading + genre
// picker on the left, the actual pick as a poster+info card on the
// right, matching the reference's density. Buttons/colors are Wobl's
// own system, not copied literally from the reference image.

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Shuffle } from "lucide-react";
import { getRandomPick } from "shared/lib/movies";
import SaveButton from "./SaveButton";
import TrailerPlayer from "./TrailerPlayer";
import { W, glassPanel } from "../shared/wobl-theme";

export default function PickForMe({ genres = [] }) {
  const [genre, setGenre] = useState("");
  const [pick, setPick] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notEnough, setNotEnough] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [everPicked, setEverPicked] = useState(false);

  const handlePick = async () => {
    setLoading(true);
    setNotEnough(false);
    setShowTrailer(false);
    const result = await getRandomPick({ genre: genre || null });
    setLoading(false);
    setEverPicked(true);

    if (!result) {
      setNotEnough(true);
      setPick(null);
      return;
    }
    setPick(result);

    if (genre && typeof window !== "undefined") {
      try {
        localStorage.setItem("wobl_genre_signal", genre);
      } catch {}
    }
  };

  return (
    <section className="pick-section">
      <div className="pick-box">
        <div className="pick-left">
          <span className="eyebrow">Pick for me</span>
          <h2 className="pick-heading">
            Not sure what
            <br />
            to watch?
          </h2>
          <p className="pick-copy">
            Wobl picks a great match based on what people are loving right now.
          </p>

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
              className="pick-trigger"
            >
              {loading ? "Picking…" : "Pick something for me"}
            </button>
          </div>
        </div>

        <div className="pick-right">
          {!everPicked && (
            <div className="pick-placeholder">
              <span>Your pick will appear here</span>
            </div>
          )}

          {notEnough && (
            <div className="pick-placeholder">
              <span>Not enough in that genre yet — try another.</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {pick && (
              <motion.div
                key={pick.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                className="pick-card"
              >
                <div className="pick-poster">
                  {pick.image ? (
                    <img src={pick.image} alt={pick.name} />
                  ) : (
                    <div className="pick-poster-fallback">{pick.name}</div>
                  )}
                </div>

                <div className="pick-info">
                  <h3 className="pick-name">{pick.name}</h3>
                  <div className="pick-meta">
                    {pick.rating != null && <span>★ {pick.rating}</span>}
                    {pick.year && <span>{pick.year}</span>}
                    {pick.genre && (
                      <span>{pick.genre.split(",")[0].trim()}</span>
                    )}
                  </div>
                  {pick.trending && (
                    <span className="trending-badge">↗ Trending this week</span>
                  )}
                  {pick.short_desc && (
                    <p className="pick-tagline">"{pick.short_desc}"</p>
                  )}

                  <div className="pick-actions">
                    <button
                      className="btn-primary"
                      onClick={() => setShowTrailer((p) => !p)}
                    >
                      <Play size={13} fill="currentColor" /> Watch trailer
                    </button>
                    <SaveButton item={pick} />
                    <button className="btn-outline" onClick={handlePick}>
                      <Shuffle size={14} /> Not this one
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
        </div>
      </div>

      <style jsx>{`
        .pick-section {
          max-width: 1100px;
          margin: 2rem auto 0;
          padding: 0 2rem;
        }
        .pick-box {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2rem;
          padding: 2rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 0.5px solid ${W.surfaceBorder};
        }
        .eyebrow {
          display: block;
          font-family: ${W.monoFont};
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: ${W.marquee};
          margin-bottom: 0.5rem;
        }
        .pick-heading {
          font-family: ${W.displayFont};
          font-size: 1.9rem;
          line-height: 1.15;
          color: ${W.cream};
          margin: 0 0 0.75rem;
        }
        .pick-copy {
          font-family: ${W.bodyFont};
          font-size: 0.88rem;
          line-height: 1.55;
          color: ${W.creamDim};
          margin: 0 0 1.25rem;
        }
        .pick-controls {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .genre-select {
          padding: 0.65rem 0.9rem;
          border-radius: 8px;
          border: 0.5px solid ${W.surfaceBorder};
          background: rgba(255, 255, 255, 0.04);
          color: ${W.cream};
          font-family: ${W.bodyFont};
          font-size: 0.85rem;
        }
        .pick-trigger {
          padding: 0.7rem 1.2rem;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, ${W.marquee}, ${W.amber});
          color: #0a0908;
          font-family: ${W.bodyFont};
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
        }
        .pick-right {
          min-height: 260px;
          display: flex;
          align-items: center;
        }
        .pick-placeholder {
          width: 100%;
          text-align: center;
          font-family: ${W.bodyFont};
          font-size: 0.85rem;
          color: ${W.creamFaint};
        }
        .pick-card {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 1.5rem;
          width: 100%;
        }
        .pick-poster {
          aspect-ratio: 2 / 3;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
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
          padding: 0.75rem;
        }
        .pick-name {
          font-family: ${W.displayFont};
          font-size: 1.5rem;
          color: ${W.cream};
          margin: 0 0 0.35rem;
        }
        .pick-meta {
          display: flex;
          gap: 0.6rem;
          font-family: ${W.monoFont};
          font-size: 0.78rem;
          color: ${W.creamDim};
          margin-bottom: 0.4rem;
        }
        .trending-badge {
          display: inline-block;
          font-family: ${W.monoFont};
          font-size: 0.72rem;
          color: ${W.amber};
          margin-bottom: 0.6rem;
        }
        .pick-tagline {
          font-family: ${W.bodyFont};
          font-style: italic;
          font-size: 0.85rem;
          line-height: 1.5;
          color: ${W.creamDim};
          margin: 0 0 1rem;
          max-width: 50ch;
        }
        .pick-actions {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
          align-items: center;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1.1rem;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, ${W.marquee}, ${W.amber});
          color: #0a0908;
          font-family: ${W.bodyFont};
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1.1rem;
          border-radius: 8px;
          border: 0.5px solid ${W.surfaceBorder};
          background: none;
          color: ${W.creamDim};
          font-family: ${W.bodyFont};
          font-size: 0.82rem;
          cursor: pointer;
        }
        .pick-trailer {
          margin-top: 1.1rem;
        }
        @media (max-width: 780px) {
          .pick-box {
            grid-template-columns: 1fr;
          }
          .pick-card {
            grid-template-columns: 110px 1fr;
          }
        }
      `}</style>
    </section>
  );
}
