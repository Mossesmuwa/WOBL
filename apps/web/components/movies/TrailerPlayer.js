// components/TrailerPlayer.js
// Wobl — Clean Premium Trailer Player
//
// Architecture:
// 1. Preview state: one custom Wobl play button.
// 2. Playing state: real YouTube iframe in the same player bounds.
// 3. No cinema mode.
// 4. No custom play button over the YouTube player.
// 5. Trailer bounds are controlled by the parent page.

import { useState, useEffect, useCallback } from "react";

const normalizeTrailers = (list = []) =>
  (Array.isArray(list) ? list : [])
    .map((trailer) => {
      if (typeof trailer === "string") {
        return {
          key: trailer,
          name: "Official Trailer",
          type: "Trailer",
        };
      }

      if (trailer && typeof trailer === "object" && trailer.key) {
        return {
          ...trailer,
          name: trailer.name || "Trailer",
          type: trailer.type || "Trailer",
        };
      }

      return null;
    })
    .filter(Boolean);

function PlayIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <span className="spinner" aria-hidden="true">
      <span />
    </span>
  );
}

export default function TrailerPlayer({
  tmdbId,
  itemName,
  trailers: trailersProp,
  slug,
  backdropUrl,
}) {
  const [trailers, setTrailers] = useState(() =>
    normalizeTrailers(trailersProp),
  );

  const [selectedTrailer, setSelectedTrailer] = useState(() => {
    const normalized = normalizeTrailers(trailersProp);
    return normalized[0] || null;
  });

  const [loading, setLoading] = useState(() => {
    return normalizeTrailers(trailersProp).length === 0;
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);

  const fetchTrailers = useCallback(async () => {
    if (!tmdbId && !slug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const query = new URLSearchParams({
        tmdb_id: tmdbId || "",
        slug: slug || "",
      });

      const response = await fetch(`/api/trailers?${query.toString()}`);

      if (!response.ok) {
        throw new Error(`Trailer request failed: ${response.status}`);
      }

      const data = await response.json();

      const normalized = normalizeTrailers(data?.trailers || []);

      setTrailers(normalized);
      setSelectedTrailer(normalized[0] || null);
    } catch (err) {
      console.error("Failed to fetch trailers:", err);

      setTrailers([]);
      setSelectedTrailer(null);
      setError(true);
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
      setError(false);
      return;
    }

    fetchTrailers();
  }, [trailersProp, fetchTrailers]);

  // Selecting another trailer always returns to preview mode.
  useEffect(() => {
    setIsPlaying(false);
  }, [selectedTrailer?.key]);

  const handlePlay = () => {
    if (!selectedTrailer?.key) return;

    setIsPlaying(true);
  };

  /*
   * ------------------------------------------------------------
   * LOADING
   * ------------------------------------------------------------
   */

  if (loading) {
    return (
      <>
        <div className="player-stage loading-stage">
          {backdropUrl && (
            <div
              className="loading-backdrop"
              style={{
                backgroundImage: `url(${backdropUrl})`,
              }}
            />
          )}

          <div className="loading-content">
            <LoadingSpinner />
            <span>Loading trailer</span>
          </div>
        </div>

        <style jsx>{`
          .player-stage {
            position: relative;
            width: 100%;
            aspect-ratio: 16 / 9;
            overflow: hidden;
            border-radius: 16px;
            background: #070707;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .loading-backdrop {
            position: absolute;
            inset: 0;
            background-size: cover;
            background-position: center;
            filter: blur(12px);
            transform: scale(1.05);
            opacity: 0.2;
          }

          .loading-content {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            color: rgba(255, 255, 255, 0.55);
            font-family: var(--wobl-mono, monospace);
            font-size: 0.68rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .spinner {
            width: 18px;
            height: 18px;
            display: block;
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-top-color: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          .spinner span {
            display: block;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </>
    );
  }

  /*
   * ------------------------------------------------------------
   * NO TRAILER
   * ------------------------------------------------------------
   */

  if (!selectedTrailer) {
    return (
      <>
        <div
          className="player-stage unavailable-stage"
          style={
            backdropUrl
              ? {
                  backgroundImage: `
                    linear-gradient(
                      rgba(5,5,5,0.35),
                      rgba(5,5,5,0.82)
                    ),
                    url(${backdropUrl})
                  `,
                }
              : undefined
          }
        >
          <div className="unavailable-content">
            <span>Trailer unavailable</span>

            {error && (
              <button type="button" onClick={fetchTrailers}>
                Try again
              </button>
            )}
          </div>
        </div>

        <style jsx>{`
          .player-stage {
            position: relative;
            width: 100%;
            aspect-ratio: 16 / 9;
            overflow: hidden;
            border-radius: 16px;
            background-color: #070707;
            background-size: cover;
            background-position: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .unavailable-content {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            color: rgba(255, 255, 255, 0.55);
            font-family: var(--wobl-mono, monospace);
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }

          .unavailable-content button {
            border: 0;
            background: transparent;
            color: var(--wobl-amber, #f59e0b);
            font: inherit;
            cursor: pointer;
            text-decoration: underline;
          }
        `}</style>
      </>
    );
  }

  /*
   * ------------------------------------------------------------
   * PLAYING
   * ------------------------------------------------------------
   *
   * The YouTube player stays inside the normal page flow.
   * There is no overlay, modal, cinema mode, or scroll lock.
   */

  if (isPlaying) {
    return (
      <>
        <div className="player-container">
          <div className="video-frame">
            <iframe
              key={selectedTrailer.key}
              src={`https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=1&rel=0&modestbranding=1`}
              title={`${selectedTrailer.name || "Trailer"} — ${itemName}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {trailers.length > 1 && (
            <div className="trailer-selector">
              {trailers.map((trailer) => {
                const active = trailer.key === selectedTrailer.key;

                return (
                  <button
                    key={trailer.key}
                    type="button"
                    className={`trailer-item ${
                      active ? "trailer-item-active" : ""
                    }`}
                    onClick={() => setSelectedTrailer(trailer)}
                  >
                    <span
                      className="trailer-thumb"
                      style={{
                        backgroundImage: `url(https://img.youtube.com/vi/${trailer.key}/mqdefault.jpg)`,
                      }}
                    />

                    <span className="trailer-item-name">
                      {trailer.name || trailer.type || "Trailer"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <style jsx>{`
          .player-container {
            width: 100%;
          }

          .video-frame {
            position: relative;
            width: 100%;
            aspect-ratio: 16 / 9;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 16px;
            background: #000;
            box-shadow:
              0 25px 60px rgba(0, 0, 0, 0.45),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
          }

          .video-frame iframe {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            border: 0;
          }

          .trailer-selector {
            display: flex;
            gap: 10px;
            margin-top: 12px;
            overflow-x: auto;
            padding: 2px 2px 6px;
          }

          .trailer-item {
            flex: 0 0 150px;
            padding: 0;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.025);
            color: rgba(255, 255, 255, 0.65);
            cursor: pointer;
            text-align: left;
            transition:
              border-color 160ms ease,
              transform 160ms ease;
          }

          .trailer-item:hover {
            transform: translateY(-2px);
            border-color: rgba(255, 255, 255, 0.2);
          }

          .trailer-item-active {
            border-color: rgba(255, 255, 255, 0.32);
          }

          .trailer-thumb {
            display: block;
            width: 100%;
            aspect-ratio: 16 / 9;
            background-position: center;
            background-size: cover;
          }

          .trailer-item-name {
            display: block;
            padding: 7px 9px 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-family: var(--wobl-mono, monospace);
            font-size: 0.62rem;
          }

          @media (max-width: 640px) {
            .video-frame {
              border-radius: 12px;
            }
          }
        `}</style>
      </>
    );
  }

  /*
   * ------------------------------------------------------------
   * PREVIEW
   * ------------------------------------------------------------
   *
   * IMPORTANT:
   * There is ONLY ONE play button here.
   *
   * The YouTube iframe does not exist yet.
   */

  const thumbnail = `https://img.youtube.com/vi/${selectedTrailer.key}/maxresdefault.jpg`;

  return (
    <>
      <div className="player-container">
        <button
          type="button"
          className="preview"
          onClick={handlePlay}
          aria-label={`Watch trailer for ${itemName}`}
          style={{
            backgroundImage: `
              linear-gradient(
                to top,
                rgba(0,0,0,0.78),
                rgba(0,0,0,0.05) 65%
              ),
              url(${thumbnail})
            `,
          }}
        >
          <div className="preview-center">
            <span className="play-button">
              <PlayIcon />
            </span>
          </div>

          <div className="preview-information">
            <span className="watch-label">Watch trailer</span>

            <span className="trailer-name">
              {selectedTrailer.name || "Official Trailer"}
            </span>
          </div>
        </button>

        {trailers.length > 1 && (
          <div className="trailer-selector">
            {trailers.map((trailer) => {
              const active = trailer.key === selectedTrailer.key;

              return (
                <button
                  key={trailer.key}
                  type="button"
                  className={`trailer-item ${
                    active ? "trailer-item-active" : ""
                  }`}
                  onClick={() => setSelectedTrailer(trailer)}
                >
                  <span
                    className="trailer-thumb"
                    style={{
                      backgroundImage: `url(https://img.youtube.com/vi/${trailer.key}/mqdefault.jpg)`,
                    }}
                  />

                  <span className="trailer-item-name">
                    {trailer.name || trailer.type || "Trailer"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .player-container {
          width: 100%;
        }

        .preview {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 16 / 9;
          padding: 0;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          background-color: #050505;
          background-size: cover;
          background-position: center;
          cursor: pointer;
          box-shadow:
            0 25px 60px rgba(0, 0, 0, 0.45),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .preview::after {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0);
          transition: background 180ms ease;
          pointer-events: none;
        }

        .preview:hover::after {
          background: rgba(0, 0, 0, 0.08);
        }

        .preview-center {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .play-button {
          width: 66px;
          height: 66px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-left: 2px;
          border-radius: 50%;
          color: var(--wobl-cream, #fff);
          background: rgba(18, 18, 18, 0.42);
          border: 1px solid rgba(255, 255, 255, 0.24);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow:
            0 15px 40px rgba(0, 0, 0, 0.38),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
          transition:
            transform 180ms ease,
            background 180ms ease;
        }

        .preview:hover .play-button {
          transform: scale(1.06);
          background: rgba(25, 25, 25, 0.55);
        }

        .preview-information {
          position: absolute;
          z-index: 3;
          left: 22px;
          right: 22px;
          bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          text-align: left;
        }

        .watch-label {
          color: var(--wobl-cream, #fff);
          font-family: var(--wobl-display, sans-serif);
          font-size: 0.95rem;
          font-weight: 600;
        }

        .trailer-name {
          color: rgba(255, 255, 255, 0.58);
          font-family: var(--wobl-mono, monospace);
          font-size: 0.68rem;
        }

        .trailer-selector {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          overflow-x: auto;
          padding: 2px 2px 6px;
        }

        .trailer-item {
          flex: 0 0 150px;
          padding: 0;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.025);
          color: rgba(255, 255, 255, 0.65);
          cursor: pointer;
          text-align: left;
          transition:
            border-color 160ms ease,
            transform 160ms ease;
        }

        .trailer-item:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .trailer-item-active {
          border-color: rgba(255, 255, 255, 0.32);
        }

        .trailer-thumb {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 9;
          background-position: center;
          background-size: cover;
        }

        .trailer-item-name {
          display: block;
          padding: 7px 9px 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.62rem;
        }

        @media (max-width: 640px) {
          .preview {
            border-radius: 12px;
          }

          .play-button {
            width: 58px;
            height: 58px;
          }

          .preview-information {
            left: 16px;
            right: 16px;
            bottom: 16px;
          }
        }
      `}</style>
    </>
  );
}
