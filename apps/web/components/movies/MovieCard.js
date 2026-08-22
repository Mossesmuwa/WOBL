// components/movies/MovieCard.js
// Wobl — Clean Premium Card (Redesigned)
// - Clean poster (no text overlay)
// - Series badge below poster
// - Title below
// - Metadata (year, genre, rating) below title
// - Watch Now button on hover
// - Save button on hover
// - Premium spacing and hierarchy

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SaveButton from "./SaveButton";
import RatingRing from "./RatingRing";
import { W } from "../shared/wobl-theme";

export default function MovieCard({ item }) {
  const [isHovered, setIsHovered] = useState(false);

  if (!item) return null;

  const genres = (item.genre || "")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  const isTV = item.type === "tv";

  return (
    <div className="card-wrap">
      <Link href={`/movies/${item.slug}`} className="card-link">
        {/* Poster Section */}
        <motion.div
          className="poster-section"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
        >
          <div className="poster-wrap">
            {/* Poster Image */}
            {item.image ? (
              <motion.img
                src={item.image}
                alt={item.name}
                loading="lazy"
                className="poster-img"
                animate={{ scale: isHovered ? 1.06 : 1 }}
                transition={{ duration: 0.4 }}
              />
            ) : (
              <div className="poster-fallback">{item.name}</div>
            )}

            {/* Overlay on Hover */}
            <motion.div
              className="poster-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Save Button - Top Left (on hover) */}
            <motion.div
              className="btn-save"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1 : 0.8,
              }}
              transition={{ duration: 0.2 }}
            >
              <SaveButton item={item} size="small" />
            </motion.div>

            {/* Watch Now Button - Center (on hover) */}
            <motion.div
              className="btn-watch-wrap"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1 : 0.8,
              }}
              transition={{ duration: 0.3 }}
              pointerEvents={isHovered ? "auto" : "none"}
            >
              <div className="btn-watch">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Watch</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </Link>

      {/* Info Section - Below Poster */}
      <div className="info-section">
        {/* Series Badge */}
        {isTV && (
          <motion.div
            className="series-badge"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            📺 Series
          </motion.div>
        )}

        {/* Title */}
        <Link href={`/movies/${item.slug}`}>
          <motion.h3
            className="card-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
          >
            {item.name}
          </motion.h3>
        </Link>

        {/* Metadata Row */}
        <div className="metadata">
          {item.year && <span className="meta-year">{item.year}</span>}

          {genres[0] && <span className="meta-divider">•</span>}
          {genres[0] && <span className="meta-genre">{genres[0]}</span>}

          {item.rating != null && (
            <>
              <span className="meta-divider">•</span>
              <span className="meta-rating">
                ⭐ {(item.rating / 10).toFixed(1)}
              </span>
            </>
          )}
        </div>

        {/* Optional: Vote Count */}
        {item.rating_count > 0 && (
          <div className="vote-count">
            {item.rating_count.toLocaleString()} ratings
          </div>
        )}
      </div>

      <style jsx>{`
        .card-wrap {
          position: relative;
          width: 100%;
        }

        .card-link {
          display: block;
          text-decoration: none;
          color: inherit;
          outline: none;
          border-radius: 10px;
          transition: outline 0.2s ease;
        }

        .card-link:focus-visible {
          outline: 2px solid var(--wobl-amber, #f2a65a);
          outline-offset: 4px;
        }

        /* Poster Section */
        .poster-section {
          width: 100%;
          margin-bottom: 1rem;
        }

        .poster-wrap {
          position: relative;
          aspect-ratio: 2 / 3;
          border-radius: 12px;
          overflow: hidden;
          background: var(--wobl-surface, #1a1613);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          transition: box-shadow 0.3s ease;
        }

        .poster-wrap:hover,
        .card-link:focus-visible .poster-wrap {
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.5);
        }

        .poster-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .poster-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 1.5rem;
          text-align: center;
          font-family: var(--wobl-display, serif);
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--wobl-cream-dim, #b8ac9c);
          background: linear-gradient(135deg, #2a2420, #1a1613);
        }

        /* Hover Overlay */
        .poster-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.35);
          z-index: 1;
        }

        /* Save Button */
        .btn-save {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          z-index: 3;
        }

        /* Watch Button */
        .btn-watch-wrap {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .btn-watch {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1.2rem 1.6rem;
          background: var(--wobl-amber, #f2a65a);
          color: #0a0a0a;
          border-radius: 14px;
          font-family: var(--wobl-display, serif);
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          box-shadow: 0 10px 24px rgba(242, 166, 90, 0.35);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-watch:hover {
          background: #e8a050;
          transform: scale(1.1);
          box-shadow: 0 14px 32px rgba(242, 166, 90, 0.4);
        }

        .btn-watch svg {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        /* Info Section */
        .info-section {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        /* Series Badge */
        .series-badge {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--wobl-cream, #f5efe6);
          background: linear-gradient(
            135deg,
            rgba(242, 166, 90, 0.8),
            rgba(242, 166, 90, 0.6)
          );
          backdrop-filter: blur(10px);
          padding: 0.4rem 0.7rem;
          border-radius: 6px;
          border: 1px solid rgba(242, 166, 90, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          display: inline-block;
          width: fit-content;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        /* Title */
        .card-title {
          margin: 0;
          font-family: var(--wobl-display, serif);
          font-size: 1rem;
          font-weight: 700;
          color: var(--wobl-cream, #f5efe6);
          line-height: 1.3;
          letter-spacing: -0.01em;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .card-link:hover .card-title,
        .card-link:focus-visible .card-title {
          color: var(--wobl-amber, #f2a65a);
        }

        /* Metadata */
        .metadata {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          flex-wrap: wrap;
          font-size: 0.85rem;
        }

        .meta-year {
          font-family: var(--wobl-mono, monospace);
          color: rgba(255, 255, 255, 0.65);
          font-weight: 600;
        }

        .meta-divider {
          color: rgba(255, 255, 255, 0.4);
        }

        .meta-genre {
          font-family: var(--wobl-display, serif);
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.8rem;
          text-transform: capitalize;
        }

        .meta-rating {
          font-family: var(--wobl-mono, monospace);
          color: var(--wobl-amber, #f2a65a);
          font-weight: 600;
          font-size: 0.8rem;
        }

        /* Vote Count */
        .vote-count {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        /* Tablet (768px - 1024px) */
        @media (max-width: 1024px) {
          .info-section {
            gap: 0.5rem;
          }

          .card-title {
            font-size: 0.95rem;
          }

          .series-badge {
            font-size: 0.65rem;
            padding: 0.35rem 0.6rem;
          }

          .btn-watch {
            padding: 1rem 1.4rem;
            font-size: 0.9rem;
            gap: 0.4rem;
          }

          .btn-watch svg {
            width: 28px;
            height: 28px;
          }
        }

        /* Small Tablet (640px - 768px) */
        @media (max-width: 768px) {
          .poster-section {
            margin-bottom: 0.9rem;
          }

          .poster-wrap {
            border-radius: 10px;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.28);
          }

          .info-section {
            gap: 0.45rem;
          }

          .card-title {
            font-size: 0.9rem;
          }

          .series-badge {
            font-size: 0.6rem;
            padding: 0.32rem 0.55rem;
          }

          .btn-watch {
            padding: 0.9rem 1.2rem;
            font-size: 0.85rem;
          }

          .btn-watch svg {
            width: 26px;
            height: 26px;
          }

          .metadata {
            font-size: 0.8rem;
          }

          .vote-count {
            font-size: 0.65rem;
          }
        }

        /* Mobile (480px - 640px) */
        @media (max-width: 640px) {
          .poster-section {
            margin-bottom: 0.8rem;
          }

          .poster-wrap {
            border-radius: 9px;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
          }

          .btn-save {
            top: 0.6rem;
            left: 0.6rem;
            transform: scale(0.9);
          }

          .btn-watch {
            padding: 0.8rem 1.1rem;
            font-size: 0.78rem;
            gap: 0.35rem;
          }

          .btn-watch svg {
            width: 24px;
            height: 24px;
          }

          .card-title {
            font-size: 0.85rem;
          }

          .series-badge {
            font-size: 0.58rem;
            padding: 0.3rem 0.5rem;
          }

          .metadata {
            font-size: 0.75rem;
            gap: 0.4rem;
          }

          .vote-count {
            font-size: 0.6rem;
          }
        }

        /* Small Mobile (< 480px) */
        @media (max-width: 480px) {
          .info-section {
            gap: 0.4rem;
          }

          .poster-section {
            margin-bottom: 0.75rem;
          }

          .poster-wrap {
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.22);
          }

          .btn-save {
            top: 0.5rem;
            left: 0.5rem;
            transform: scale(0.8);
          }

          .btn-watch {
            padding: 0.7rem 1rem;
            font-size: 0.72rem;
            gap: 0.3rem;
          }

          .btn-watch svg {
            width: 22px;
            height: 22px;
          }

          .card-title {
            font-size: 0.8rem;
            line-height: 1.25;
          }

          .series-badge {
            font-size: 0.55rem;
            padding: 0.28rem 0.45rem;
          }

          .metadata {
            font-size: 0.7rem;
            gap: 0.35rem;
          }

          .meta-year,
          .meta-genre {
            font-size: 0.65rem;
          }

          .vote-count {
            font-size: 0.58rem;
          }
        }
      `}</style>
    </div>
  );
}
