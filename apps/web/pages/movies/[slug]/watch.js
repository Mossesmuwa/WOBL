// pages/movies/[slug]/watch.js
// Wobl — Premium Watch Page
// Full-screen video player with multi-server selection

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
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

  const providers = getAllProviders();

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
        if (item.type === "tv") {
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
  }, [item, selectedProvider, season, episode]);

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

  const isTV = item.type === "tv";

  return (
    <>
      <MovieSEO item={item} />

      <div className="watch-page" style={{ background: W.bg }}>
        {/* Header */}
        <div className="watch-header">
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

            <div className="header-title">
              <h1>{item.name}</h1>
              {isTV && <span className="badge">TV Series</span>}
            </div>
          </div>
        </div>

        {/* Player Container */}
        <div className="player-container">
          <div className="player-wrapper">
            {loading ? (
              <div className="player-loading">
                <div className="spinner" />
                <span>Loading stream...</span>
              </div>
            ) : error ? (
              <div className="player-error">
                <span className="error-icon">⚠</span>
                <p>{error}</p>
                <button onClick={() => setSelectedProvider("cinesrc")}>
                  Try Different Server
                </button>
              </div>
            ) : streamUrl ? (
              <iframe
                src={streamUrl}
                className="player-iframe"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
              />
            ) : null}
          </div>
        </div>

        {/* Server Selector */}
        <div className="servers-section">
          <div className="servers-inner">
            <div className="servers-label">
              <span className="label-text">Select Server</span>
            </div>

            <div className="servers-grid">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  className={`server-button ${
                    selectedProvider === provider.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedProvider(provider.id)}
                  disabled={loading}
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
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TV Controls */}
        {isTV && (
          <div className="episode-controls">
            <div className="controls-inner">
              <div className="control-group">
                <label>Season</label>
                <select
                  value={season}
                  onChange={(e) => setSeason(parseInt(e.target.value))}
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={s}>
                      Season {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="control-group">
                <label>Episode</label>
                <select
                  value={episode}
                  onChange={(e) => setEpisode(parseInt(e.target.value))}
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((e) => (
                    <option key={e} value={e}>
                      Episode {e}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .watch-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 2rem;
        }

        .watch-header {
          margin-bottom: 2rem;
          animation: slideDown 0.5s ease;
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

        .header-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-title h1 {
          margin: 0;
          font-family: var(--wobl-display, sans-serif);
          font-size: clamp(2rem, 4vw, 3rem);
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

        /* Player Container */
        .player-container {
          flex: 1;
          max-width: 1260px;
          width: 100%;
          margin: 0 auto 2rem;
          animation: fadeIn 0.6s ease 0.1s both;
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
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
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

        /* Servers Section */
        .servers-section {
          max-width: 1260px;
          width: 100%;
          margin: 0 auto 3rem;
          animation: fadeIn 0.6s ease 0.2s both;
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
        }

        .server-button:hover:not(:disabled) {
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-2px);
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
          font-family: var(--wobl-display, sans-serif);
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
        .episode-controls {
          max-width: 1260px;
          width: 100%;
          margin: 0 auto 2rem;
          animation: fadeIn 0.6s ease 0.3s both;
        }

        .controls-inner {
          display: flex;
          gap: 1.5rem;
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
        }

        .control-group select:hover {
          border-color: rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.06);
        }

        .control-group select:focus {
          outline: none;
          border-color: var(--wobl-amber, #f59e0b);
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }

        /* Animations */
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Responsive */
        @media (max-width: 960px) {
          .watch-page {
            padding: 1.5rem;
          }

          .header-title h1 {
            font-size: clamp(1.5rem, 5vw, 2.2rem);
          }

          .servers-grid {
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          }
        }

        @media (max-width: 640px) {
          .watch-page {
            padding: 1rem;
          }

          .watch-header {
            margin-bottom: 1.5rem;
          }

          .back-link {
            margin-bottom: 1rem;
          }

          .header-title h1 {
            font-size: clamp(1.2rem, 6vw, 1.8rem);
          }

          .player-container {
            margin-bottom: 1.5rem;
          }

          .servers-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.8rem;
          }

          .server-button {
            padding: 1rem;
          }

          .server-name {
            font-size: 1rem;
          }

          .controls-inner {
            gap: 1rem;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </>
  );
}
