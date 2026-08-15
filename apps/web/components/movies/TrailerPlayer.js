// components/TrailerPlayer.js
// Wobl — Premium cinematic trailer player.
// The page owns the layout bounds; this component owns trailer behavior.

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { W, glassPanel } from "../shared/wobl-theme";

const normalizeTrailers = (list = []) =>
  (Array.isArray(list) ? list : [])
    .map((trailer) => {
      if (typeof trailer === "string") {
        return {
          key: trailer,
          name: "Official Trailer",
          type: "Trailer",
          published_at: null,
        };
      }

      if (trailer && typeof trailer === "object" && trailer.key) {
        return {
          name: trailer.name || "Trailer",
          type: trailer.type || "Trailer",
          published_at: trailer.published_at || null,
          ...trailer,
        };
      }

      return null;
    })
    .filter(Boolean);

function PlayIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function CloseIcon({ size = 19 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function Loader() {
  return (
    <motion.span
      aria-hidden="true"
      animate={{ opacity: [0.35, 1, 0.35] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        display: "block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: W.cream,
        boxShadow: `0 0 22px ${W.cream}`,
      }}
    />
  );
}

export default function TrailerPlayer({
  tmdbId,
  itemName,
  trailers: trailersProp,
  slug,
  backdropUrl,
}) {
  const initialTrailers = normalizeTrailers(trailersProp);

  const [trailers, setTrailers] = useState(initialTrailers);
  const [loading, setLoading] = useState(initialTrailers.length === 0);
  const [selectedTrailer, setSelectedTrailer] = useState(
    initialTrailers[0] || null,
  );
  const [cinemaMode, setCinemaMode] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  const hideTimer = useRef(null);

  const fetchTrailers = useCallback(async () => {
    if (!tmdbId && !slug) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const query = new URLSearchParams({
        tmdb_id: tmdbId || "",
        slug: slug || "",
      }).toString();

      const response = await fetch(`/api/trailers?${query}`);

      if (!response.ok) {
        throw new Error(`Trailer request failed: ${response.status}`);
      }

      const data = await response.json();
      const normalized = normalizeTrailers(data.trailers || []);

      setTrailers(normalized);
      setSelectedTrailer(normalized[0] || null);
    } catch (error) {
      console.error("Failed to fetch trailers:", error);
      setTrailers([]);
      setSelectedTrailer(null);
    } finally {
      setLoading(false);
    }
  }, [tmdbId, slug]);

  useEffect(() => {
    const normalized = normalizeTrailers(trailersProp);

    if (normalized.length > 0) {
      setTrailers(normalized);
      setSelectedTrailer(normalized[0]);
      setLoading(false);
      return;
    }

    fetchTrailers();
  }, [trailersProp, fetchTrailers]);

  // Prevent the page underneath from scrolling during cinema mode.
  useEffect(() => {
    if (!cinemaMode) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [cinemaMode]);

  // Escape closes cinema mode.
  useEffect(() => {
    if (!cinemaMode) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setCinemaMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [cinemaMode]);

  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);

    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }

    hideTimer.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (!cinemaMode) return undefined;

    resetHideTimer();

    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, [cinemaMode, resetHideTimer]);

  const openCinema = () => {
    if (!selectedTrailer) return;
    setCinemaMode(true);
  };

  const retry = () => {
    setRetryKey((value) => value + 1);
  };

  const thumbnailUrl = selectedTrailer
    ? `https://img.youtube.com/vi/${selectedTrailer.key}/maxresdefault.jpg`
    : backdropUrl;

  return (
    <>
      <div
        className="wobl-trailer"
        onMouseMove={cinemaMode ? resetHideTimer : undefined}
      >
        {/* Player stage */}
        <div className="player-stage">
          {loading ? (
            <div
              className="loading-state"
              style={{
                backgroundImage: backdropUrl
                  ? `linear-gradient(rgba(8,8,8,.32), rgba(8,8,8,.68)), url(${backdropUrl})`
                  : undefined,
              }}
              aria-label={`Loading trailer for ${itemName}`}
            >
              <Loader />
            </div>
          ) : selectedTrailer ? (
            <motion.button
              type="button"
              className="trailer-ready"
              onClick={openCinema}
              whileHover={{ scale: 1.008 }}
              whileTap={{ scale: 0.992 }}
              aria-label={`Watch trailer for ${itemName}`}
              style={{
                backgroundImage: `url(${thumbnailUrl})`,
              }}
            >
              <div className="image-vignette" />

              <div className="play-orb">
                <motion.span
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <PlayIcon size={20} />
                </motion.span>
              </div>

              <div className="trailer-label">
                <span className="trailer-label-title">Watch trailer</span>
                <span className="trailer-label-name">
                  {selectedTrailer.name || "Official Trailer"}
                </span>
              </div>
            </motion.button>
          ) : backdropUrl ? (
            <div
              className="fallback-state"
              style={{
                backgroundImage: `linear-gradient(rgba(8,8,8,.35), rgba(8,8,8,.78)), url(${backdropUrl})`,
              }}
            >
              <div className="fallback-label">
                <span>Trailer not available</span>
                <button type="button" onClick={retry} key={retryKey}>
                  Try again
                </button>
              </div>
            </div>
          ) : (
            <div className="fallback-empty">
              <span>Trailer not available</span>
              <button type="button" onClick={retry} key={retryKey}>
                Try again
              </button>
            </div>
          )}
        </div>

        {/* Multiple trailer selector */}
        {!loading && trailers.length > 1 && (
          <div className="trailer-list">
            <div className="trailer-list-label">Trailers</div>

            <div className="trailer-list-scroll">
              {trailers.map((trailer) => {
                const selected = trailer.key === selectedTrailer?.key;

                return (
                  <button
                    key={trailer.key}
                    type="button"
                    className={`trailer-option ${
                      selected ? "is-selected" : ""
                    }`}
                    onClick={() => setSelectedTrailer(trailer)}
                    aria-pressed={selected}
                  >
                    <span
                      className="trailer-option-image"
                      style={{
                        backgroundImage: `url(https://img.youtube.com/vi/${trailer.key}/mqdefault.jpg)`,
                      }}
                    />
                    <span className="trailer-option-copy">
                      <span>{trailer.name || trailer.type || "Trailer"}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Cinema mode */}
      <AnimatePresence>
        {cinemaMode && selectedTrailer && (
          <motion.div
            className="cinema-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onMouseMove={resetHideTimer}
          >
            <motion.div
              className="cinema-frame"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{
                duration: 0.34,
                ease: [0.2, 0.8, 0.2, 1],
              }}
            >
              <iframe
                key={selectedTrailer.key}
                title={`${selectedTrailer.name || "Trailer"} — ${itemName}`}
                src={`https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=1&rel=0&modestbranding=1`}
                className="youtube-frame"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

              <AnimatePresence>
                {controlsVisible && (
                  <motion.button
                    type="button"
                    className="close-button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => setCinemaMode(false)}
                    aria-label="Close trailer"
                    style={{
                      ...glassPanel,
                      border: `1px solid ${W.surfaceBorder}`,
                    }}
                  >
                    <CloseIcon />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .wobl-trailer {
          width: 100%;
        }

        .player-stage {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border-radius: 16px;
          background: #050505;
          border: 1px solid rgba(255, 255, 255, 0.11);
          box-shadow:
            0 28px 70px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
        }

        .loading-state,
        .fallback-state,
        .fallback-empty,
        .trailer-ready {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #0b0b0b;
          background-position: center;
          background-size: cover;
        }

        .trailer-ready {
          display: block;
          padding: 0;
          border: 0;
          cursor: pointer;
          background-color: #0a0a0a;
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          text-align: left;
          color: inherit;
        }

        .image-vignette {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(
              circle at center,
              transparent 28%,
              rgba(0, 0, 0, 0.18) 65%,
              rgba(0, 0, 0, 0.5) 100%
            ),
            linear-gradient(
              to top,
              rgba(5, 5, 5, 0.72),
              rgba(5, 5, 5, 0) 42%
            );
          transition: background 220ms ease;
        }

        .trailer-ready:hover .image-vignette {
          background:
            radial-gradient(
              circle at center,
              transparent 30%,
              rgba(0, 0, 0, 0.16) 68%,
              rgba(0, 0, 0, 0.45) 100%
            ),
            linear-gradient(
              to top,
              rgba(5, 5, 5, 0.72),
              rgba(5, 5, 5, 0) 42%
            );
        }

        .play-orb {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 62px;
          height: 62px;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: ${W.cream};
          background: rgba(18, 18, 18, 0.34);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow:
            0 14px 38px rgba(0, 0, 0, 0.32),
            inset 0 1px 0 rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(18px) saturate(1.25);
          -webkit-backdrop-filter: blur(18px) saturate(1.25);
          transition:
            transform 220ms ease,
            background 220ms ease,
            border-color 220ms ease;
        }

        .trailer-ready:hover .play-orb {
          transform: translate(-50%, -50%) scale(1.05);
          background: rgba(24, 24, 24, 0.44);
          border-color: rgba(255, 255, 255, 0.28);
        }

        .trailer-label {
          position: absolute;
          left: 22px;
          bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          max-width: calc(100% - 44px);
        }

        .trailer-label-title {
          color: ${W.cream};
          font-family: ${W.bodyFont};
          font-size: 0.9rem;
          font-weight: 650;
        }

        .trailer-label-name {
          color: ${W.creamDim};
          font-family: ${W.monoFont};
          font-size: 0.68rem;
          letter-spacing: 0.03em;
        }

        .fallback-state,
        .fallback-empty {
          display: flex;
          align-items: flex-end;
          justify-content: flex-start;
          background-color: #0a0a0a;
          background-position: center;
          background-size: cover;
        }

        .fallback-empty {
          align-items: center;
          justify-content: center;
        }

        .fallback-label {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 18px 18px;
          padding: 8px 10px 8px 13px;
          border: 1px solid rgba(255, 255, 255, 0.11);
          border-radius: 999px;
          color: rgba(255, 255, 255, 0.72);
          background: rgba(15, 15, 15, 0.34);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          font-family: ${W.monoFont};
          font-size: 0.66rem;
        }

        .fallback-label button,
        .fallback-empty button {
          border: 0;
          background: transparent;
          color: ${W.cream};
          cursor: pointer;
          font: inherit;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .fallback-empty {
          flex-direction: column;
          gap: 10px;
          color: rgba(255, 255, 255, 0.55);
          font-family: ${W.monoFont};
          font-size: 0.72rem;
        }

        .trailer-list {
          margin-top: 1rem;
        }

        .trailer-list-label {
          margin-bottom: 0.55rem;
          color: rgba(255, 255, 255, 0.42);
          font-family: ${W.monoFont};
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .trailer-list-scroll {
          display: flex;
          gap: 0.65rem;
          overflow-x: auto;
          padding: 2px 2px 6px;
          scrollbar-width: thin;
        }

        .trailer-option {
          position: relative;
          flex: 0 0 145px;
          padding: 0;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.025);
          cursor: pointer;
          text-align: left;
          color: ${W.cream};
        }

        .trailer-option.is-selected {
          border-color: rgba(255, 255, 255, 0.28);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
        }

        .trailer-option-image {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 9;
          background-position: center;
          background-size: cover;
        }

        .trailer-option-copy {
          display: block;
          padding: 7px 9px 8px;
          color: rgba(255, 255, 255, 0.68);
          font-family: ${W.monoFont};
          font-size: 0.62rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cinema-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4vh 4vw;
          background: rgba(4, 4, 4, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .cinema-frame {
          position: relative;
          width: min(1180px, 92vw);
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border-radius: 14px;
          background: #000;
          box-shadow:
            0 45px 100px rgba(0, 0, 0, 0.72),
            0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .youtube-frame {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }

        .close-button {
          position: absolute;
          top: max(14px, env(safe-area-inset-top));
          right: max(14px, env(safe-area-inset-right));
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border-radius: 50%;
          color: ${W.cream};
          cursor: pointer;
          z-index: 2;
        }

        @media (max-width: 640px) {
          .player-stage {
            border-radius: 12px;
          }

          .play-orb {
            width: 58px;
            height: 58px;
          }

          .trailer-label {
            left: 16px;
            bottom: 16px;
          }

          .cinema-overlay {
            padding: 0;
            background: #000;
          }

          .cinema-frame {
            width: 100vw;
            height: 100dvh;
            aspect-ratio: unset;
            border-radius: 0;
            box-shadow: none;
          }

          .youtube-frame {
            width: 100%;
            height: 100%;
          }

          .close-button {
            top: max(14px, env(safe-area-inset-top));
            right: max(14px, env(safe-area-inset-right));
          }
        }
      `}</style>
    </>
  );
}
