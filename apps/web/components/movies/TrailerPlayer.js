// components/TrailerPlayer.js
// Wobl — Premium trailer player.
// Idle glass state with a subtle breathing play button, expands into a
// dimmed "cinema mode" on click, auto-hiding controls, YouTube embed.
// Fetch/normalize logic kept from the original — only the surface and
// motion are new.

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { W, glassPanel } from "../shared/wobl-theme";

const normalizeTrailers = (list = []) =>
  (Array.isArray(list) ? list : [])
    .map((trailer) => {
      if (typeof trailer === "string") {
        return {
          key: trailer,
          name: "Trailer",
          type: "Trailer",
          published_at: null,
        };
      }
      if (trailer && typeof trailer === "object" && trailer.key) return trailer;
      return null;
    })
    .filter(Boolean);

function PlayIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function CloseIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
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
  const [loading, setLoading] = useState(
    !trailersProp || trailersProp.length === 0,
  );
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const [cinemaMode, setCinemaMode] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef(null);

  useEffect(() => {
    const normalized = normalizeTrailers(trailersProp);
    if (normalized.length > 0) {
      setTrailers(normalized);
      setSelectedTrailer(normalized[0]);
      setLoading(false);
      return;
    }
    if (tmdbId || slug) {
      fetchTrailers();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tmdbId, slug, trailersProp]);

  async function fetchTrailers() {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        tmdb_id: tmdbId || "",
        slug: slug || "",
      }).toString();
      const res = await fetch(`/api/trailers?${query}`);
      if (res.ok) {
        const data = await res.json();
        const normalized = normalizeTrailers(data.trailers || []);
        setTrailers(normalized);
        if (normalized.length > 0) setSelectedTrailer(normalized[0]);
      }
    } catch (err) {
      console.error("Failed to fetch trailers:", err);
    }
    setLoading(false);
  }

  // Auto-hide controls after 3s of inactivity while in cinema mode.
  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
  }, []);

  useEffect(() => {
    if (!cinemaMode) return;
    resetHideTimer();
    return () => hideTimer.current && clearTimeout(hideTimer.current);
  }, [cinemaMode, resetHideTimer]);

  if (loading) {
    return (
      <div
        style={{
          ...glassPanel,
          padding: 40,
          textAlign: "center",
          borderRadius: W.radius,
          color: W.creamDim,
          fontFamily: W.bodyFont,
          fontSize: 13,
        }}
      >
        Loading trailer…
      </div>
    );
  }

  if (trailers.length === 0) {
    // Graceful fallback — static backdrop, small unobtrusive tag.
    // Per spec: never show a broken video icon.
    if (!backdropUrl) return null;
    return (
      <div
        style={{
          position: "relative",
          aspectRatio: "16/9",
          borderRadius: W.radius,
          overflow: "hidden",
          backgroundImage: `url(${backdropUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            ...glassPanel,
            borderRadius: 20,
            padding: "4px 12px",
            fontFamily: W.monoFont,
            fontSize: 10,
            color: W.creamDim,
          }}
        >
          Trailer not available
        </div>
      </div>
    );
  }

  return (
    <div
      className="wobl-trailer-root"
      style={{ marginBottom: 32 }}
      onMouseMove={cinemaMode ? resetHideTimer : undefined}
    >
      {/* Idle state — glass card with breathing play button */}
      {!cinemaMode && (
        <motion.button
          onClick={() => setCinemaMode(true)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16/9",
            borderRadius: W.radius,
            overflow: "hidden",
            border: "none",
            cursor: "pointer",
            padding: 0,
            backgroundImage: `url(https://img.youtube.com/vi/${selectedTrailer?.key}/maxresdefault.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, transparent 40%, rgba(10,9,8,0.75) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              right: 20,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <motion.div
              animate={{ opacity: [0.65, 1, 0.65] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                ...glassPanel,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: W.cream,
              }}
            >
              <PlayIcon size={16} />
            </motion.div>
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  fontFamily: W.bodyFont,
                  fontSize: 13,
                  fontWeight: 600,
                  color: W.cream,
                }}
              >
                Watch trailer
              </div>
              <div
                style={{
                  fontFamily: W.monoFont,
                  fontSize: 10,
                  color: W.creamDim,
                }}
              >
                {selectedTrailer?.name || "Trailer"}
              </div>
            </div>
          </div>
        </motion.button>
      )}

      {/* Cinema mode — dims page, expands player, auto-hiding glass controls */}
      <AnimatePresence>
        {cinemaMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999,
              background: "rgba(10,9,8,0.92)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: controlsVisible ? "default" : "none",
            }}
          >
            <motion.div
              className="wobl-cinema-frame"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              style={{
                position: "relative",
                width: "min(1100px, 92vw)",
                aspectRatio: "16/9",
                borderRadius: W.radius,
                overflow: "hidden",
                boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=1&rel=0&modestbranding=1`}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

              <AnimatePresence>
                {controlsVisible && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setCinemaMode(false)}
                    style={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      ...glassPanel,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: W.cream,
                      cursor: "pointer",
                      border: `0.5px solid ${W.surfaceBorder}`,
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

      {/* More videos — only shown when idle, not during cinema mode */}
      {!cinemaMode && trailers.length > 1 && (
        <div
          style={{ display: "flex", gap: 10, marginTop: 12, overflowX: "auto" }}
        >
          {trailers
            .filter((t) => t.key !== selectedTrailer?.key)
            .map((trailer) => (
              <motion.button
                key={trailer.key}
                onClick={() => setSelectedTrailer(trailer)}
                whileHover={{ scale: 1.04 }}
                style={{
                  flexShrink: 0,
                  width: 140,
                  aspectRatio: "16/9",
                  borderRadius: W.radiusSm,
                  overflow: "hidden",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  position: "relative",
                  backgroundImage: `url(https://img.youtube.com/vi/${trailer.key}/mqdefault.jpg)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, transparent 50%, rgba(10,9,8,0.7) 100%)",
                  }}
                />
              </motion.button>
            ))}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 640px) {
          /* Mobile: cinema mode goes true full-bleed — no rounded corners,
           * no margins. A centered floating panel wastes precious screen
           * space on a small viewport; full-screen takeover matches how
           * every native mobile video player behaves. */
          :global(.wobl-cinema-frame) {
            width: 100vw !important;
            height: 100vh !important;
            aspect-ratio: unset !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
