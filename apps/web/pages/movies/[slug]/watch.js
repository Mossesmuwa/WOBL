// pages/movies/[slug]/watch.js
// Wobl — Premium Watch Page (Enhanced)
// Full-screen player with multi-server selection, smart episode selector for series

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getBySlug } from "shared/lib/items";
import { getAllProviders } from "shared/lib/streamProviders";
import MovieSEO from "../../../components/movies/MovieSEO";
import { W } from "../../../components/shared/wobl-theme";

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const slug = params?.slug;
  if (!slug) return { notFound: true };

  try {
    const item = await getBySlug(slug);
    if (!item) return { notFound: true };
    return { props: { item }, revalidate: 3600 };
  } catch (error) {
    console.error("Failed to fetch watch item:", error);
    return { notFound: true };
  }
}

export default function WatchPage({ item }) {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState("cinesrc");
  const [streamUrl, setStreamUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [watchTime, setWatchTime] = useState(0);
  const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);

  const providers = getAllProviders();
  const isTV = item?.type === "tv";

  // Max episodes per season (for UI - servers handle actual episodes)
  const maxEpisodesPerSeason = 20;
  const maxSeasons = 15;

  // Save watch time to localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      if (item?.slug) {
        try {
          localStorage.setItem(
            `wobl_watch_${item.slug}`,
            JSON.stringify({ season, episode, watchTime }),
          );
        } catch {}
      }
    }, 10000); // Save every 10 seconds

    return () => clearInterval(interval);
  }, [item?.slug, season, episode, watchTime]);

  // Load last watched position
  useEffect(() => {
    if (!item?.slug) return;
    try {
      const saved = localStorage.getItem(`wobl_watch_${item.slug}`);
      if (saved) {
        const { season: lastSeason, episode: lastEpisode } = JSON.parse(saved);
        setSeason(lastSeason);
        setEpisode(lastEpisode);
      }
    } catch {}
  }, [item?.slug]);

  // Fetch stream URL when provider, season, or episode changes
  useEffect(() => {
    if (!item?.source_id) {
      setError("Content not available");
      setLoading(false);
      return;
    }

    const fetchStream = async () => {
      setLoading(true);
      setError(null);

      try {
        const query = new URLSearchParams();
        query.set("tmdb_id", String(item.source_id));
        query.set("provider", selectedProvider);
        query.set("type", item.type || "movie");

        if (isTV) {
          query.set("season", String(season));
          query.set("episode", String(episode));
        }

        const response = await fetch(`/api/stream?${query.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to load stream");
        }

        const data = await response.json();
        setStreamUrl(data.url);
      } catch (err) {
        console.error("Stream error:", err);
        setError("Failed to load video. Try another server.");
        setStreamUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStream();
  }, [item, selectedProvider, season, episode, isTV]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowRight" && isTV && episode < maxEpisodesPerSeason) {
        setEpisode((prev) => prev + 1);
      } else if (e.key === "ArrowLeft" && isTV && episode > 1) {
        setEpisode((prev) => prev - 1);
      } else if (e.key === "ArrowUp" && isTV && season < maxSeasons) {
        setSeason((prev) => prev + 1);
      } else if (e.key === "ArrowDown" && isTV && season > 1) {
        setSeason((prev) => prev - 1);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isTV, season, episode]);

  if (router.isFallback || !item) {
    return (
      <div className="watch-page loading" style={{ background: W.bg }}>
        <div className="watch-skeleton" />
        <style jsx>{`
          .watch-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .watch-skeleton {
            width: 90%;
            max-width: 1260px;
            aspect-ratio: 16 / 9;
            border-radius: 16px;
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
      </div>
    );
  }

  return (
    <>
      <MovieSEO item={item} />

      <div className="watch-page" style={{ background: W.bg }}>
        {/* Header */}
        <motion.div
          className="watch-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="header-inner">
            <Link href={`/movies/${item.slug}`} className="back-link">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Back to {item.name}</span>
            </Link>

            <div className="header-info">
              <h1>{item.name}</h1>
              {isTV && <span className="badge">TV Series</span>}
              {!isTV && <span className="badge">Movie</span>}
            </div>

            {item.short_desc && (
              <p className="header-desc">{item.short_desc}</p>
            )}
          </div>
        </motion.div>

        {/* Player Container */}
        <motion.div
          className="player-container"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="player-wrapper">
            {loading ? (
              <div className="player-loading">
                <motion.div
                  className="spinner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Loading stream...</span>
              </div>
            ) : error ? (
              <div className="player-error">
                <span className="error-icon">⚠</span>
                <p>{error}</p>
                <motion.button
                  onClick={() => setSelectedProvider("cinesrc")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Try Different Server
                </motion.button>
              </div>
            ) : streamUrl ? (
              <iframe
                src={streamUrl}
                className="player-iframe"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                key={`${selectedProvider}-${season}-${episode}`}
              />
            ) : null}
          </div>
        </motion.div>

        {/* Server Selector */}
        <motion.div
          className="servers-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="servers-inner">
            <div className="servers-label">
              <span className="label-text">Select Streaming Server</span>
            </div>

            <div className="servers-grid">
              {providers.map((provider) => (
                <motion.button
                  key={provider.id}
                  className={`server-button ${
                    selectedProvider === provider.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedProvider(provider.id)}
                  disabled={loading}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="server-name">{provider.name}</div>
                  {provider.features.length > 0 && (
                    <div className="server-features">
                      {provider.features.slice(0, 2).map((feature, idx) => (
                        <span key={idx} className="feature">
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* TV Series Controls */}
        {isTV && (
          <motion.div
            className="episode-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="episode-inner">
              <div className="episode-header">
                <span className="label-text">Episodes</span>
                <button
                  className="toggle-selector"
                  onClick={() => setShowEpisodeSelector(!showEpisodeSelector)}
                >
                  Season {season}, Episode {episode}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d={
                        showEpisodeSelector ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"
                      }
                    />
                  </svg>
                </button>
              </div>

              <AnimatePresence>
                {showEpisodeSelector && (
                  <motion.div
                    className="selector-panel"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="selector-controls">
                      <div className="control-group">
                        <label>Season</label>
                        <div className="select-wrapper">
                          <select
                            value={season}
                            onChange={(e) => {
                              setSeason(parseInt(e.target.value));
                              setEpisode(1);
                            }}
                          >
                            {Array.from(
                              { length: maxSeasons },
                              (_, i) => i + 1,
                            ).map((s) => (
                              <option key={s} value={s}>
                                Season {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="control-group">
                        <label>Episode</label>
                        <div className="select-wrapper">
                          <select
                            value={episode}
                            onChange={(e) =>
                              setEpisode(parseInt(e.target.value))
                            }
                          >
                            {Array.from(
                              { length: maxEpisodesPerSeason },
                              (_, i) => i + 1,
                            ).map((e) => (
                              <option key={e} value={e}>
                                Episode {e}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button
                        className="nav-button prev"
                        onClick={() => {
                          if (episode > 1) setEpisode(episode - 1);
                          else if (season > 1) {
                            setSeason(season - 1);
                            setEpisode(maxEpisodesPerSeason);
                          }
                        }}
                      >
                        ← Prev
                      </button>

                      <button
                        className="nav-button next"
                        onClick={() => {
                          if (episode < maxEpisodesPerSeason)
                            setEpisode(episode + 1);
                          else if (season < maxSeasons) {
                            setSeason(season + 1);
                            setEpisode(1);
                          }
                        }}
                      >
                        Next →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="keyboard-hint">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>Use arrow keys to navigate</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .watch-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
        }

        /* Header */
        .watch-header {
          margin-bottom: 2rem;
        }

        .header-inner {
          max-width: 1260px;
          margin: 0 auto;
          width: 100%;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          color: var(--wobl-amber, #f59e0b);
          text-decoration: none;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: opacity 0.2s ease;
          margin-bottom: 1.5rem;
        }

        .back-link:hover {
          opacity: 0.8;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .header-info h1 {
          margin: 0;
          font-family: var(--wobl-display, sans-serif);
          font-size: clamp(2rem, 5vw, 3rem);
          color: var(--wobl-cream, #fff);
          font-weight: 600;
          letter-spacing: -0.02em;
        }

        .badge {
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: var(--wobl-amber, #f59e0b);
          font-family: var(--wobl-mono, monospace);
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .header-desc {
          margin: 0;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.95rem;
          max-width: 600px;
        }

        /* Player */
        .player-container {
          flex: 1;
          max-width: 1260px;
          width: 100%;
          margin: 0 auto 2rem;
        }

        .player-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 16px;
          overflow: hidden;
          background: #070707;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
        }

        .player-loading,
        .player-error {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          color: rgba(255, 255, 255, 0.6);
          font-family: var(--wobl-mono, monospace);
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-top-color: var(--wobl-amber, #f59e0b);
          border-radius: 50%;
        }

        .player-error {
          background: rgba(0, 0, 0, 0.5);
        }

        .error-icon {
          font-size: 2.5rem;
          opacity: 0.8;
        }

        .player-error p {
          margin: 0;
          font-size: 0.95rem;
          max-width: 400px;
        }

        .player-error button {
          margin-top: 0.5rem;
          padding: 0.6rem 1.2rem;
          border: 1px solid var(--wobl-amber, #f59e0b);
          background: transparent;
          color: var(--wobl-amber, #f59e0b);
          border-radius: 6px;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .player-error button:hover {
          background: var(--wobl-amber, #f59e0b);
          color: #0a0a0a;
        }

        .player-iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        /* Servers */
        .servers-section {
          max-width: 1260px;
          width: 100%;
          margin: 0 auto 2rem;
        }

        .servers-inner {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .servers-label {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .label-text {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--wobl-amber, #f59e0b);
          font-weight: 500;
        }

        .servers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }

        .server-button {
          padding: 1.25rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          text-align: left;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          font-family: var(--wobl-display, sans-serif);
        }

        .server-button:hover:not(:disabled) {
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
        }

        .server-button.active {
          border-color: var(--wobl-amber, #f59e0b);
          background: rgba(245, 158, 11, 0.08);
          color: var(--wobl-cream, #fff);
        }

        .server-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .server-name {
          font-size: 1.1rem;
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        .server-features {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .feature {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.6rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.5);
        }

        /* TV Controls */
        .episode-section {
          max-width: 1260px;
          width: 100%;
          margin: 0 auto;
        }

        .episode-inner {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .episode-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .toggle-selector {
          padding: 0.7rem 1.2rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.02);
          color: var(--wobl-cream, #fff);
          cursor: pointer;
          font-family: var(--wobl-display, sans-serif);
          font-size: 0.95rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          transition: all 0.2s ease;
        }

        .toggle-selector:hover {
          border-color: var(--wobl-amber, #f59e0b);
          background: rgba(245, 158, 11, 0.08);
        }

        .selector-panel {
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .selector-controls {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          align-items: flex-end;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .control-group label {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--wobl-amber, #f59e0b);
        }

        .select-wrapper {
          position: relative;
        }

        .control-group select {
          padding: 0.6rem 0.9rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          color: var(--wobl-cream, #fff);
          font-family: var(--wobl-display, sans-serif);
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
          appearance: none;
          padding-right: 2rem;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23f59e0b' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.6rem center;
        }

        .control-group select:hover {
          border-color: rgba(255, 255, 255, 0.15);
          background-color: rgba(255, 255, 255, 0.06);
        }

        .control-group select:focus {
          outline: none;
          border-color: var(--wobl-amber, #f59e0b);
        }

        .nav-button {
          padding: 0.6rem 1.2rem;
          border: 1px solid rgba(245, 158, 11, 0.3);
          background: transparent;
          color: var(--wobl-amber, #f59e0b);
          border-radius: 6px;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .nav-button:hover {
          background: rgba(245, 158, 11, 0.1);
          border-color: var(--wobl-amber, #f59e0b);
        }

        .keyboard-hint {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
          font-family: var(--wobl-mono, monospace);
        }

        /* Responsive */
        @media (max-width: 960px) {
          .watch-page {
            padding: 1rem;
          }

          .header-info h1 {
            font-size: clamp(1.5rem, 4vw, 2.2rem);
          }

          .servers-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .watch-page {
            padding: 0.75rem;
          }

          .watch-header {
            margin-bottom: 1.5rem;
          }

          .header-info h1 {
            font-size: clamp(1.2rem, 5vw, 1.8rem);
          }

          .header-desc {
            display: none;
          }

          .servers-grid {
            grid-template-columns: 1fr;
            gap: 0.8rem;
          }

          .server-button {
            padding: 1rem;
          }

          .selector-controls {
            flex-direction: column;
          }

          .nav-button {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
