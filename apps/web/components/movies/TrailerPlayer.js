// components/TrailerPlayer.js
// Wobl — Premium trailer player.
// Preview-first trailer experience with a focused cinema surface, graceful
// thumbnail fallbacks, trailer switching, keyboard escape, scroll locking,
// and restrained WOBL chrome around the YouTube playback surface.

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { W, glassPanel } from "../shared/wobl-theme";

const normalizeTrailers = (list = []) =>
  (Array.isArray(list) ? list : [])
    .map((trailer) => {
      if (typeof trailer === "string") {
        return { key: trailer, name: "Trailer", type: "Trailer", published_at: null };
      }
      if (trailer && typeof trailer === "object" && trailer.key) return trailer;
      return null;
    })
    .filter(Boolean);

function PlayIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function CloseIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function FullscreenIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5" />
    </svg>
  );
}

function Thumbnail({ trailer, large = false, className = "" }) {
  const [src, setSrc] = useState(
    `https://img.youtube.com/vi/${trailer?.key}/${large ? "maxresdefault" : "mqdefault"}.jpg`,
  );

  useEffect(() => {
    setSrc(
      `https://img.youtube.com/vi/${trailer?.key}/${large ? "maxresdefault" : "mqdefault"}.jpg`,
    );
  }, [trailer?.key, large]);

  if (!trailer?.key) return null;

  return (
    <img
      src={src}
      alt=""
      className={className}
      onError={() => {
        if (!src.endsWith("/hqdefault.jpg")) {
          setSrc(`https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg`);
        }
      }}
      draggable="false"
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
  const [trailers, setTrailers] = useState(() => normalizeTrailers(trailersProp));
  const [loading, setLoading] = useState(!trailersProp || trailersProp.length === 0);
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const [cinemaMode, setCinemaMode] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef(null);
  const cinemaFrameRef = useRef(null);

  useEffect(() => {
    const normalized = normalizeTrailers(trailersProp);
    if (normalized.length > 0) {
      setTrailers(normalized);
      setSelectedTrailer(normalized[0]);
      setLoading(false);
      return;
    }
    if (tmdbId || slug) fetchTrailers();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tmdbId, slug, trailersProp]);

  async function fetchTrailers() {
    setLoading(true);
    try {
      const query = new URLSearchParams({ tmdb_id: tmdbId || "", slug: slug || "" }).toString();
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

  const closeCinema = useCallback(() => {
    setCinemaMode(false);
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 3200);
  }, []);

  useEffect(() => {
    if (!cinemaMode) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    resetHideTimer();

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeCinema();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [cinemaMode, closeCinema, resetHideTimer]);

  if (loading) {
    return (
      <div className="wobl-trailer-loading" style={{ position: "relative", aspectRatio: "16/9", borderRadius: W.radius, overflow: "hidden", background: W.surface, marginBottom: 32 }}>
        {backdropUrl && <img src={backdropUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.3 }} />}
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,9,8,0.58)" }} />
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}><div className="wobl-loading-dot" aria-label="Loading trailer" /></div>
      </div>
    );
  }

  if (trailers.length === 0) {
    if (!backdropUrl) return null;
    return (
      <div style={{ position: "relative", aspectRatio: "16/9", borderRadius: W.radius, overflow: "hidden", background: W.surface, marginBottom: 32 }}>
        <img src={backdropUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 35%, rgba(10,9,8,0.78) 100%)" }} />
        <div style={{ position: "absolute", bottom: 14, left: 14, ...glassPanel, borderRadius: "20px", padding: "5px 12px", fontFamily: W.monoFont, fontSize: 10, letterSpacing: "0.06em", color: W.creamDim }}>TRAILER NOT AVAILABLE</div>
      </div>
    );
  }

  const trailerLabel = selectedTrailer?.name || selectedTrailer?.type || "Trailer";

  return (
    <div className="wobl-trailer-root" style={{ marginBottom: 32 }} onMouseMove={cinemaMode ? resetHideTimer : undefined}>
      {!cinemaMode && (
        <motion.button
          type="button"
          onClick={() => setCinemaMode(true)}
          whileHover={{ scale: 1.008 }}
          whileTap={{ scale: 0.985 }}
          aria-label={`Watch ${trailerLabel}`}
          style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: W.radius, overflow: "hidden", border: `1px solid ${W.surfaceBorder}`, cursor: "pointer", padding: 0, background: W.surface, display: "block" }}
        >
          <Thumbnail trailer={selectedTrailer} large className="wobl-trailer-image" />
          <div className="wobl-preview-vignette" />
          <div className="wobl-preview-sheen" />
          <div style={{ position: "absolute", left: 20, right: 20, bottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <motion.div animate={{ scale: [1, 1.035, 1], opacity: [0.88, 1, 0.88] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }} style={{ width: 46, height: 46, flexShrink: 0, borderRadius: "50%", ...glassPanel, display: "flex", alignItems: "center", justifyContent: "center", color: W.cream, border: `1px solid ${W.surfaceBorder}` }}>
                <PlayIcon size={17} />
              </motion.div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: W.bodyFont, fontSize: 13, fontWeight: 650, color: W.cream, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Watch trailer</div>
                <div style={{ marginTop: 3, fontFamily: W.monoFont, fontSize: 9.5, color: W.creamDim, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{trailerLabel}</div>
              </div>
            </div>
            <div className="wobl-preview-hint">OPEN CINEMA</div>
          </div>
        </motion.button>
      )}

      <AnimatePresence>
        {cinemaMode && selectedTrailer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="wobl-cinema-overlay"
            onMouseMove={resetHideTimer}
            onClick={(event) => { if (event.target === event.currentTarget) closeCinema(); }}
          >
            <div className="wobl-cinema-backdrop" />
            <motion.div
              ref={cinemaFrameRef}
              className="wobl-cinema-frame"
              initial={{ scale: 0.965, y: 8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.975, y: 5, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className="wobl-video-shell">
                <iframe
                  key={selectedTrailer.key}
                  title={`${itemName || "Wobl"} — ${trailerLabel}`}
                  src={`https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&color=white&controls=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />

                <AnimatePresence>
                  {controlsVisible && (
                    <motion.div className="wobl-player-chrome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}>
                      <div className="wobl-player-topbar">
                        <div className="wobl-player-title">
                          <span>{itemName || "Wobl"}</span>
                          <small>{trailerLabel}</small>
                        </div>
                        <button type="button" className="wobl-player-icon" onClick={closeCinema} aria-label="Close cinema mode" title="Close"><CloseIcon /></button>
                      </div>
                      <div className="wobl-player-bottom">
                        <div className="wobl-player-actions">
                          <span className="wobl-player-meta">WOBL · TRAILER</span>
                          <button type="button" className="wobl-player-icon" onClick={() => cinemaFrameRef.current?.requestFullscreen?.()} aria-label="Fullscreen" title="Fullscreen"><FullscreenIcon /></button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!cinemaMode && trailers.length > 1 && (
        <div className="wobl-trailer-list" aria-label="More trailers">
          {trailers.map((trailer) => {
            const selected = trailer.key === selectedTrailer?.key;
            return (
              <motion.button
                key={trailer.key}
                type="button"
                onClick={() => setSelectedTrailer(trailer)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.985 }}
                className={`wobl-trailer-thumb ${selected ? "is-selected" : ""}`}
                aria-label={`Select ${trailer.name || trailer.type || "trailer"}`}
                aria-pressed={selected}
              >
                <Thumbnail trailer={trailer} />
                <span className="wobl-trailer-thumb-overlay" />
                <span className="wobl-trailer-thumb-copy">{trailer.name || trailer.type || "Trailer"}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .wobl-trailer-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1); }
        .wobl-trailer-root button:hover .wobl-trailer-image { transform: scale(1.025); }
        .wobl-preview-vignette { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(10,9,8,0.04) 25%, rgba(10,9,8,0.82) 100%), linear-gradient(90deg, rgba(10,9,8,0.28), transparent 45%); }
        .wobl-preview-sheen { position: absolute; inset: 0; background: linear-gradient(115deg, rgba(255,255,255,0.07), transparent 28%, transparent 70%, rgba(217,113,60,0.05)); pointer-events: none; }
        .wobl-preview-hint { flex-shrink: 0; font-family: ${W.monoFont}; font-size: 9px; letter-spacing: 0.1em; color: ${W.creamDim}; padding: 7px 10px; border: 1px solid ${W.surfaceBorder}; border-radius: 999px; background: rgba(10,9,8,0.35); backdrop-filter: blur(10px); }
        .wobl-cinema-overlay { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 32px; background: rgba(7,6,5,0.88); backdrop-filter: blur(18px) saturate(0.82); cursor: default; }
        .wobl-cinema-backdrop { position: absolute; inset: -40px; opacity: 0.16; filter: blur(36px) saturate(0.55); background-image: ${backdropUrl ? `url(${backdropUrl})` : "none"}; background-size: cover; background-position: center; pointer-events: none; }
        .wobl-cinema-frame { position: relative; width: min(1180px, 94vw); max-height: calc(100vh - 64px); aspect-ratio: 16 / 9; z-index: 1; border-radius: ${W.radius}; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.68), 0 0 0 1px rgba(255,255,255,0.06); }
        .wobl-video-shell { position: absolute; inset: 0; background: #050505; }
        .wobl-video-shell iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; display: block; }
        .wobl-player-chrome { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; pointer-events: none; background: linear-gradient(180deg, rgba(7,6,5,0.48), transparent 22%, transparent 72%, rgba(7,6,5,0.6)); }
        .wobl-player-topbar, .wobl-player-bottom { padding: 16px; pointer-events: auto; }
        .wobl-player-topbar { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
        .wobl-player-title { display: flex; flex-direction: column; gap: 3px; min-width: 0; font-family: ${W.bodyFont}; font-size: 13px; font-weight: 600; color: ${W.cream}; text-shadow: 0 2px 12px rgba(0,0,0,0.5); }
        .wobl-player-title small { font-family: ${W.monoFont}; font-size: 9px; font-weight: 400; letter-spacing: 0.08em; text-transform: uppercase; color: ${W.creamDim}; }
        .wobl-player-icon { width: 38px; height: 38px; flex-shrink: 0; display: grid; place-items: center; border: 1px solid ${W.surfaceBorder}; border-radius: 50%; background: rgba(10,9,8,0.45); backdrop-filter: blur(14px); color: ${W.cream}; cursor: pointer; transition: transform 160ms ease, background 160ms ease, border-color 160ms ease; }
        .wobl-player-icon:hover { transform: translateY(-1px); background: rgba(10,9,8,0.72); border-color: rgba(245,239,230,0.24); }
        .wobl-player-bottom { display: flex; justify-content: flex-end; }
        .wobl-player-actions { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 12px; }
        .wobl-player-meta { font-family: ${W.monoFont}; font-size: 8px; letter-spacing: 0.1em; color: ${W.creamDim}; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
        .wobl-trailer-list { display: flex; gap: 10px; margin-top: 12px; padding: 2px 1px 4px; overflow-x: auto; scrollbar-width: none; }
        .wobl-trailer-list::-webkit-scrollbar { display: none; }
        .wobl-trailer-thumb { position: relative; flex: 0 0 156px; aspect-ratio: 16 / 9; padding: 0; overflow: hidden; border: 1px solid transparent; border-radius: ${W.radiusSm}; background: ${W.surface}; cursor: pointer; }
        .wobl-trailer-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 350ms ease; }
        .wobl-trailer-thumb:hover img { transform: scale(1.035); }
        .wobl-trailer-thumb.is-selected { border-color: rgba(245,239,230,0.42); }
        .wobl-trailer-thumb-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 38%, rgba(10,9,8,0.78)); }
        .wobl-trailer-thumb-copy { position: absolute; left: 9px; right: 9px; bottom: 7px; text-align: left; font-family: ${W.monoFont}; font-size: 8px; letter-spacing: 0.04em; color: ${W.cream}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-transform: uppercase; }
        .wobl-loading-dot { width: 8px; height: 8px; border-radius: 50%; background: ${W.creamDim}; box-shadow: 0 0 0 0 rgba(245,239,230,0.25); animation: wobl-pulse 1.5s ease-in-out infinite; }
        @keyframes wobl-pulse { 0%, 100% { opacity: 0.4; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }
        @media (max-width: 640px) {
          .wobl-cinema-overlay { padding: 0; }
          .wobl-cinema-frame { width: 100vw; height: 100vh; max-height: none; aspect-ratio: auto; border-radius: 0; }
          .wobl-player-topbar, .wobl-player-bottom { padding: 14px; }
          .wobl-preview-hint { display: none; }
          .wobl-trailer-thumb { flex-basis: 142px; }
        }
      `}</style>
    </div>
  );
}
