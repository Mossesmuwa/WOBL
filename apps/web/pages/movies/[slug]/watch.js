// pages/movies/[slug]/watch.js
// Wobl — Complete Premium Watch Experience
// Features: Multi-server, episode selector, downloads, sharing, reviews, related content, up next, info panel

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getBySlug, getRelated } from "shared/lib/items";
import { getAllProviders } from "shared/lib/streamProviders";
import MovieSEO from "../../../components/movies/MovieSEO";
import MovieCard from "../../../components/movies/MovieCard";
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
    const related = (await getRelated(item, 8)) || [];
    return { props: { item, related }, revalidate: 3600 };
  } catch (error) {
    console.error("Failed to fetch watch item:", error);
    return { notFound: true };
  }
}

export default function WatchPage({ item, related }) {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState("cinesrc");
  const [streamUrl, setStreamUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);
  const [showDownloadChecker, setShowDownloadChecker] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [downloadChecking, setDownloadChecking] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showUpNext, setShowUpNext] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  const providers = getAllProviders();
  const isTV = item?.type === "tv";
  const maxEpisodesPerSeason = 20;
  const maxSeasons = 15;

  // Fetch stream URL
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
        if (!response.ok) throw new Error("Failed to load stream");

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

  // Check download link availability
  const checkDownloadLink = useCallback(async () => {
    setDownloadChecking(true);
    try {
      let url;
      if (isTV) {
        url = `https://vidvault.ru/tv/${item.source_id}/${season}/${episode}`;
      } else {
        url = `https://vidvault.ru/movie/${item.source_id}`;
      }

      const response = await fetch(url, { method: "HEAD" });
      setDownloadReady(response.ok);
    } catch (err) {
      setDownloadReady(false);
    } finally {
      setDownloadChecking(false);
    }
  }, [item.source_id, season, episode, isTV]);

  // Load reviews from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`wobl_reviews_${item?.slug}`);
      if (saved) setReviews(JSON.parse(saved));
    } catch {}
  }, [item?.slug]);

  // Keyboard shortcuts
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

  const handleAddReview = () => {
    if (!newReview.trim()) return;
    const review = {
      id: Date.now(),
      text: newReview,
      rating: reviewRating,
      timestamp: new Date().toLocaleDateString(),
    };
    const updated = [review, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem(
        `wobl_reviews_${item.slug}`,
        JSON.stringify(updated),
      );
    } catch {}
    setNewReview("");
    setReviewRating(5);
  };

  const shareContent = {
    title: `Check out ${item.name} on Wobl`,
    url: typeof window !== "undefined" ? window.location.href : "",
    text: item.short_desc || item.name,
  };

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
        >
          <div className="header-inner">
            <Link href={`/movies/${item.slug}`} className="back-link">
              ← Back to {item.name}
            </Link>
            <div className="header-title-bar">
              <div>
                <h1>{item.name}</h1>
                <div className="badges">
                  <span className="badge">{isTV ? "TV Series" : "Movie"}</span>
                  {item.year && <span className="badge">{item.year}</span>}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="watch-layout">
          {/* Main Player Section */}
          <motion.div
            className="player-main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Player */}
            <div className="player-container">
              <div className="player-wrapper">
                {loading ? (
                  <div className="player-loading">
                    <motion.div
                      className="spinner"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
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
            </div>

            {/* Player Controls */}
            <div className="player-controls">
              {/* Servers */}
              <div className="servers-section">
                <span className="control-label">Streaming Server</span>
                <div className="servers-grid">
                  {providers.map((provider) => (
                    <motion.button
                      key={provider.id}
                      className={`server-btn ${selectedProvider === provider.id ? "active" : ""}`}
                      onClick={() => setSelectedProvider(provider.id)}
                      disabled={loading}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="server-name">{provider.name}</span>
                      <span className="server-features">
                        {provider.features[0]}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="actions-section">
                {isTV && (
                  <motion.button
                    className="action-btn"
                    onClick={() => setShowEpisodeSelector(!showEpisodeSelector)}
                    whileHover={{ scale: 1.05 }}
                  >
                    S{season}E{episode}
                  </motion.button>
                )}

                <motion.button
                  className="action-btn"
                  onClick={() => {
                    setShowDownloadChecker(!showDownloadChecker);
                    checkDownloadLink();
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  ⬇ Download
                </motion.button>

                <motion.button
                  className="action-btn"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  whileHover={{ scale: 1.05 }}
                >
                  ↗ Share
                </motion.button>

                <motion.button
                  className="action-btn"
                  onClick={() => setShowReviews(!showReviews)}
                  whileHover={{ scale: 1.05 }}
                >
                  ⭐ Reviews ({reviews.length})
                </motion.button>
              </div>
            </div>

            {/* Episode Selector */}
            <AnimatePresence>
              {showEpisodeSelector && isTV && (
                <motion.div
                  className="episode-panel"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="episode-controls">
                    <div className="control-group">
                      <label>Season</label>
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
                    <div className="control-group">
                      <label>Episode</label>
                      <select
                        value={episode}
                        onChange={(e) => setEpisode(parseInt(e.target.value))}
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* Download Checker */}
            <AnimatePresence>
              {showDownloadChecker && (
                <motion.div
                  className="download-panel"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="download-content">
                    {downloadChecking ? (
                      <>
                        <div className="spinner-small" />
                        <span>Checking availability...</span>
                      </>
                    ) : downloadReady ? (
                      <>
                        <span className="check-icon">✓</span>
                        <p>Download available on VidVault</p>
                        <a
                          href={
                            isTV
                              ? `https://vidvault.ru/tv/${item.source_id}/${season}/${episode}`
                              : `https://vidvault.ru/movie/${item.source_id}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="download-link"
                        >
                          Go to VidVault
                        </a>
                      </>
                    ) : (
                      <>
                        <span className="x-icon">✕</span>
                        <p>Download not available for this title</p>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Share Menu */}
            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  className="share-panel"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="share-options">
                    <button
                      className="share-option"
                      onClick={() =>
                        navigator.share
                          ? navigator.share(shareContent)
                          : alert("Share not supported")
                      }
                    >
                      📱 Share App
                    </button>
                    <button
                      className="share-option"
                      onClick={() => {
                        navigator.clipboard.writeText(shareContent.url);
                        alert("Link copied!");
                      }}
                    >
                      🔗 Copy Link
                    </button>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareContent.title)}&url=${encodeURIComponent(shareContent.url)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="share-option"
                    >
                      𝕏 Tweet
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reviews Section */}
            <AnimatePresence>
              {showReviews && (
                <motion.div
                  className="reviews-panel"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="reviews-content">
                    <h3>Community Reviews</h3>
                    <div className="review-input">
                      <div className="rating-selector">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <button
                            key={r}
                            className={`star ${reviewRating >= r ? "active" : ""}`}
                            onClick={() => setReviewRating(r)}
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                      <textarea
                        placeholder="Share your thoughts..."
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        maxLength={300}
                      />
                      <button
                        className="submit-review"
                        onClick={handleAddReview}
                      >
                        Post Review
                      </button>
                    </div>

                    <div className="reviews-list">
                      {reviews.map((review) => (
                        <div key={review.id} className="review-item">
                          <div className="review-rating">
                            {"⭐".repeat(review.rating)}
                          </div>
                          <p>{review.text}</p>
                          <span className="review-date">
                            {review.timestamp}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Info Sidebar */}
          <motion.div
            className="info-sidebar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="info-card">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="poster-thumb"
                />
              )}

              <div className="info-details">
                <h3>{item.name}</h3>
                {item.year && <p className="year">{item.year}</p>}
                {item.rating && (
                  <p className="rating">★ {(item.rating / 10).toFixed(1)}/10</p>
                )}
                {item.short_desc && <p className="desc">{item.short_desc}</p>}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Content */}
        {related && related.length > 0 && (
          <motion.section
            className="related-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="related-inner">
              <h2>More Like This</h2>
              <div className="related-grid">
                {related.slice(0, 6).map((item) => (
                  <MovieCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </div>

      <style jsx>{`
        .watch-page {
          min-height: 100vh;
          padding: 1.5rem;
        }

        .watch-header {
          margin-bottom: 2rem;
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
        }

        .back-link {
          display: inline-block;
          color: var(--wobl-amber, #f59e0b);
          text-decoration: none;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        .header-title-bar h1 {
          margin: 0 0 0.5rem 0;
          font-family: var(--wobl-display, sans-serif);
          font-size: clamp(2rem, 5vw, 3rem);
          color: var(--wobl-cream, #fff);
          font-weight: 600;
        }

        .badges {
          display: flex;
          gap: 0.75rem;
        }

        .badge {
          display: inline-block;
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

        .watch-layout {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .player-main {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .player-container {
          width: 100%;
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
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-top-color: var(--wobl-amber, #f59e0b);
          border-radius: 50%;
        }

        .spinner-small {
          width: 20px;
          height: 20px;
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

        .player-iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        .player-controls {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .control-label {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--wobl-amber, #f59e0b);
          font-weight: 500;
        }

        .servers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .server-btn {
          padding: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.02);
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          font-family: var(--wobl-display, sans-serif);
        }

        .server-btn:hover:not(:disabled) {
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
        }

        .server-btn.active {
          border-color: var(--wobl-amber, #f59e0b);
          background: rgba(245, 158, 11, 0.08);
          color: var(--wobl-cream, #fff);
        }

        .server-name {
          font-size: 0.95rem;
          font-weight: 600;
        }

        .server-features {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .actions-section {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 0.6rem 1.2rem;
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 8px;
          background: transparent;
          color: var(--wobl-amber, #f59e0b);
          cursor: pointer;
          font-family: var(--wobl-display, sans-serif);
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: rgba(245, 158, 11, 0.1);
          border-color: var(--wobl-amber, #f59e0b);
        }

        .episode-panel,
        .download-panel,
        .share-panel,
        .reviews-panel {
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .episode-controls {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .control-group label {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.65rem;
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
          cursor: pointer;
        }

        .download-content,
        .share-options,
        .reviews-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
        }

        .check-icon {
          font-size: 2rem;
          color: var(--wobl-amber, #f59e0b);
        }

        .download-link {
          padding: 0.7rem 1.4rem;
          background: var(--wobl-amber, #f59e0b);
          color: #0a0a0a;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .download-link:hover {
          background: #e59b00;
        }

        .share-options {
          display: flex;
          gap: 0.75rem;
          width: 100%;
        }

        .share-option {
          flex: 1;
          padding: 0.7rem;
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 8px;
          background: transparent;
          color: var(--wobl-amber, #f59e0b);
          cursor: pointer;
          text-decoration: none;
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }

        .share-option:hover {
          background: rgba(245, 158, 11, 0.1);
        }

        .reviews-content {
          width: 100%;
        }

        .reviews-content h3 {
          margin: 0;
          color: var(--wobl-cream, #fff);
          font-family: var(--wobl-display, sans-serif);
        }

        .review-input {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
        }

        .rating-selector {
          display: flex;
          gap: 0.4rem;
        }

        .star {
          border: none;
          background: transparent;
          font-size: 1.5rem;
          cursor: pointer;
          opacity: 0.3;
          transition: opacity 0.2s ease;
        }

        .star.active {
          opacity: 1;
        }

        .review-input textarea {
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          color: var(--wobl-cream, #fff);
          font-family: var(--wobl-body, sans-serif);
          font-size: 0.85rem;
          resize: vertical;
          min-height: 80px;
        }

        .submit-review {
          padding: 0.6rem 1.2rem;
          background: var(--wobl-amber, #f59e0b);
          color: #0a0a0a;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .submit-review:hover {
          background: #e59b00;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 300px;
          overflow-y: auto;
          width: 100%;
        }

        .review-item {
          padding: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.02);
        }

        .review-rating {
          font-size: 0.9rem;
          margin-bottom: 0.4rem;
        }

        .review-item p {
          margin: 0 0 0.4rem 0;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.85rem;
          line-height: 1.5;
        }

        .review-date {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .info-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .info-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .poster-thumb {
          width: 100%;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .info-details h3 {
          margin: 0 0 0.5rem 0;
          font-size: 0.95rem;
          color: var(--wobl-cream, #fff);
        }

        .info-details p {
          margin: 0.3rem 0;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .related-section {
          margin-top: 3rem;
          padding-top: 3rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .related-inner {
          max-width: 1400px;
          margin: 0 auto;
        }

        .related-inner h2 {
          margin: 0 0 2rem 0;
          font-family: var(--wobl-display, sans-serif);
          font-size: clamp(1.5rem, 4vw, 2.2rem);
          color: var(--wobl-cream, #fff);
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 1.2rem;
        }

        @media (max-width: 1200px) {
          .watch-layout {
            grid-template-columns: 1fr;
          }

          .info-sidebar {
            order: 2;
            grid-column: 1;
          }
        }

        @media (max-width: 768px) {
          .watch-page {
            padding: 1rem;
          }

          .servers-grid {
            grid-template-columns: repeat(2, 1fr);
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
