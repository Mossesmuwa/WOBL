// components/movies/ThumbCard.js
// Wobl — poster thumbnail. On desktop hover (with real trailer data),
// swaps to a muted autoplay preview after a short hover-intent delay —
// this is the actual "put trailers" moment on the landing page, not
// just a static poster with a play icon.

import { useState, useRef } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { W } from "../shared/wobl-theme";

export default function ThumbCard({ item }) {
  const [previewing, setPreviewing] = useState(false);
  const timerRef = useRef(null);

  if (!item) return null;

  const canPreview =
    !!item.trailer_url &&
    typeof window !== "undefined" &&
    window.matchMedia?.("(hover: hover)").matches;

  const handleEnter = () => {
    if (!canPreview) return;
    timerRef.current = setTimeout(() => setPreviewing(true), 450);
  };

  const handleLeave = () => {
    clearTimeout(timerRef.current);
    setPreviewing(false);
  };

  return (
    <Link
      href={`/movies/${item.slug}`}
      className="thumb-card"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="thumb-poster">
        {previewing ? (
          <iframe
            className="thumb-preview"
            src={`https://www.youtube.com/embed/${item.trailer_url}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${item.trailer_url}`}
            allow="autoplay; encrypted-media"
            title={`${item.name} preview`}
          />
        ) : item.image ? (
          <img src={item.image} alt={item.name} loading="lazy" />
        ) : (
          <div className="thumb-fallback">{item.name}</div>
        )}

        {!previewing && (
          <div className="play-circle">
            <Play size={16} fill="currentColor" strokeWidth={0} />
          </div>
        )}
      </div>
      <div className="thumb-name">{item.name}</div>
      {item.rating != null && (
        <div className="thumb-rating">★ {item.rating}</div>
      )}

      <style jsx>{`
        .thumb-card {
          display: block;
          text-decoration: none;
          color: inherit;
        }
        .thumb-poster {
          position: relative;
          aspect-ratio: 2 / 3;
          border-radius: 8px;
          overflow: hidden;
          background: var(--wobl-surface, #1a1613);
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.28);
          transition: transform 0.2s ease;
        }
        .thumb-card:hover .thumb-poster {
          transform: translateY(-3px);
        }
        .thumb-poster img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .thumb-preview {
          position: absolute;
          inset: -20%;
          width: 140%;
          height: 140%;
          border: none;
          pointer-events: none;
        }
        .thumb-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 0.7rem;
          text-align: center;
          font-family: var(--wobl-display, serif);
          font-size: 0.8rem;
          color: var(--wobl-cream-dim, #b8ac9c);
        }
        .play-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(10, 9, 8, 0.55);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--wobl-cream, #f5efe6);
          pointer-events: none;
        }
        .thumb-name {
          font-family: var(--wobl-body, sans-serif);
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--wobl-cream, #f5efe6);
          margin-top: 0.4rem;
          line-height: 1.3;
        }
        .thumb-rating {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.7rem;
          color: var(--wobl-marquee, #d9713c);
          margin-top: 0.1rem;
        }
      `}</style>
    </Link>
  );
}
