// components/movies/MovieCard.js
// Wobl — Premium Card (Redesigned)
// - Prominent "Watch Now" button on hover
// - Better responsive hierarchy for all devices
// - Improved scrim for text readability
// - TV Series badge more visible
// - Smoother animations
// - Better focus/accessibility states
// - Cleaner visual balance

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
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
        <motion.div
          className="poster-wrap"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ y: -6 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Poster Image */}
          {item.image ? (
            <motion.img
              src={item.image}
              alt={item.name}
              loading="lazy"
              className="poster-img"
              animate={{ scale: isHovered ? 1.08 : 1 }}
              transition={{ duration: 0.4 }}
            />
          ) : (
            <div className="poster-fallback">{item.name}</div>
          )}

          {/* Enhanced Scrim - better readability */}
          <div className="scrim" />
          <motion.div
            className="scrim-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Rating Badge - Top Right */}
          {item.rating != null && (
            <motion.div
              className="rating-badge"
              initial={{ scale: 1 }}
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <RatingRing rating={item.rating} size={28} />
            </motion.div>
          )}

          {/* Save Button - Top Left */}
          <motion.div
            className="action-save"
            initial={{ opacity: 1 }}
            animate={{ opacity: isHovered ? 1 : 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <SaveButton item={item} size="small" />
          </motion.div>

          {/* Series Badge - Top Right (below rating) */}
          {isTV && (
            <motion.div
              className="series-badge"
              initial={{ opacity: 0.8, scale: 0.95 }}
              animate={{
                opacity: isHovered ? 1 : 0.8,
                scale: isHovered ? 1.05 : 0.95,
              }}
              transition={{ duration: 0.2 }}
            >
              📺 Series
            </motion.div>
          )}

          {/* Watch Now Button - Center (on hover) */}
          <motion.div
            className="watch-button-wrap"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
            transition={{ duration: 0.3 }}
            pointerEvents={isHovered ? "auto" : "none"}
          >
            <div className="watch-button">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Watch Now</span>
            </div>
          </motion.div>

          {/* Title & Meta - Bottom */}
          <motion.div
            className="poster-content"
            animate={{ y: isHovered ? -4 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="card-title">{item.name}</h3>
            <div className="card-meta">
              {item.year && <span className="year">{item.year}</span>}
              {genres[0] && <span className="genre-tag">{genres[0]}</span>}
            </div>
          </motion.div>
        </motion.div>
      </Link>

      <style jsx>{`
        .card-wrap {
          position: relative;
          width: 100%;
          outline: none;
        }

        .card-link {
          display: block;
          text-decoration: none;
          color: inherit;
          outline: none;
          border-radius: 8px;
          transition: outline 0.2s ease;
        }

        .card-link:focus-visible {
          outline: 2px solid var(--wobl-amber, #f2a65a);
          outline-offset: 2px;
        }

        .poster-wrap {
          position: relative;
          aspect-ratio: 2 / 3;
          border-radius: 10px;
          overflow: hidden;
          background: var(--wobl-surface, #1a1613);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.32);
          cursor: pointer;
          transition: box-shadow 0.3s ease;
        }

        .poster-wrap:hover,
        .card-link:focus-visible .poster-wrap {
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.48);
        }

        /* Poster Image */
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
          padding: 1rem;
          text-align: center;
          font-family: var(--wobl-display, serif);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--wobl-cream-dim, #b8ac9c);
          background: linear-gradient(135deg, #2a2420, #1a1613);
        }

        /* Base Scrim - always visible */
        .scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(10, 9, 8, 0.95) 0%,
            rgba(10, 9, 8, 0.65) 28%,
            rgba(10, 9, 8, 0.25) 60%,
            transparent 90%
          );
          pointer-events: none;
          z-index: 1;
        }

        /* Hover Scrim - darkens image on hover */
        .scrim-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.3);
          pointer-events: none;
          z-index: 2;
        }

        /* Rating Badge */
        .rating-badge {
          position: absolute;
          top: 0.6rem;
          right: 0.6rem;
          z-index: 4;
          background: rgba(10, 9, 8, 0.65);
          backdrop-filter: blur(8px);
          border-radius: 50%;
          padding: 2px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Save Button */
        .action-save {
          position: absolute;
          top: 0.6rem;
          left: 0.6rem;
          z-index: 4;
        }

        /* Series Badge - Top Right (below rating on desktop, moves on mobile) */
        .series-badge {
          position: absolute;
          top: 3.2rem;
          right: 0.6rem;
          z-index: 4;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--wobl-cream, #f5efe6);
          background: linear-gradient(
            135deg,
            rgba(242, 166, 90, 0.85),
            rgba(242, 166, 90, 0.65)
          );
          backdrop-filter: blur(12px);
          padding: 0.35rem 0.6rem;
          border-radius: 5px;
          border: 1px solid rgba(242, 166, 90, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          white-space: nowrap;
        }

        /* Watch Now Button */
        .watch-button-wrap {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
        }

        .watch-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 1rem 1.4rem;
          background: var(--wobl-amber, #f2a65a);
          color: #0a0a0a;
          border-radius: 12px;
          font-family: var(--wobl-display, serif);
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          box-shadow: 0 8px 20px rgba(242, 166, 90, 0.3);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .watch-button:hover {
          background: #e8a050;
          transform: scale(1.08);
          box-shadow: 0 12px 28px rgba(242, 166, 90, 0.4);
        }

        .watch-button svg {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        /* Title & Meta */
        .poster-content {
          position: absolute;
          left: 0.65rem;
          right: 0.65rem;
          bottom: 0.65rem;
          z-index: 3;
        }

        .card-title {
          font-family: var(--wobl-display, serif);
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--wobl-cream, #f5efe6);
          margin: 0 0 0.3rem;
          line-height: 1.2;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
          letter-spacing: -0.01em;
        }

        .card-meta {
          display: flex;
          gap: 0.4rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .year {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
        }

        .genre-tag {
          padding: 0.12rem 0.4rem;
          border-radius: 4px;
          border: 0.5px solid rgba(255, 255, 255, 0.2);
          font-family: var(--wobl-mono, monospace);
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-weight: 500;
        }

        /* Tablet (768px - 1024px) */
        @media (max-width: 1024px) {
          .series-badge {
            top: 3rem;
            font-size: 0.6rem;
            padding: 0.3rem 0.5rem;
          }

          .watch-button {
            padding: 0.9rem 1.2rem;
            font-size: 0.88rem;
          }

          .card-title {
            font-size: 0.82rem;
          }
        }

        /* Small Tablet (640px - 768px) */
        @media (max-width: 768px) {
          .poster-wrap {
            border-radius: 8px;
          }

          .rating-badge {
            top: 0.4rem;
            right: 0.4rem;
            transform: scale(0.9);
            transform-origin: top right;
          }

          .action-save {
            top: 0.4rem;
            left: 0.4rem;
          }

          .series-badge {
            top: 2.8rem;
            right: 0.4rem;
            font-size: 0.58rem;
            padding: 0.28rem 0.45rem;
          }

          .watch-button {
            padding: 0.8rem 1rem;
            font-size: 0.82rem;
            gap: 0.5rem;
          }

          .watch-button svg {
            width: 24px;
            height: 24px;
          }

          .card-title {
            font-size: 0.78rem;
          }

          .year {
            font-size: 0.6rem;
          }

          .genre-tag {
            font-size: 0.55rem;
          }
        }

        /* Mobile (480px - 640px) */
        @media (max-width: 640px) {
          .poster-wrap {
            border-radius: 6px;
          }

          .scrim {
            background: linear-gradient(
              to top,
              rgba(10, 9, 8, 0.96) 0%,
              rgba(10, 9, 8, 0.7) 25%,
              rgba(10, 9, 8, 0.3) 55%,
              transparent 85%
            );
          }

          .rating-badge {
            top: 0.35rem;
            right: 0.35rem;
            transform: scale(0.8);
          }

          .action-save {
            top: 0.35rem;
            left: 0.35rem;
          }

          .series-badge {
            top: 2.6rem;
            right: 0.35rem;
            font-size: 0.55rem;
            padding: 0.25rem 0.4rem;
          }

          .watch-button {
            padding: 0.7rem 0.95rem;
            font-size: 0.75rem;
            gap: 0.4rem;
          }

          .watch-button svg {
            width: 22px;
            height: 22px;
          }

          .card-title {
            font-size: 0.72rem;
            margin-bottom: 0.2rem;
          }

          .year {
            font-size: 0.55rem;
          }

          .genre-tag {
            font-size: 0.5rem;
          }
        }

        /* Small Mobile (< 480px) */
        @media (max-width: 480px) {
          .poster-wrap {
            border-radius: 6px;
          }

          .scrim {
            background: linear-gradient(
              to top,
              rgba(10, 9, 8, 0.97) 0%,
              rgba(10, 9, 8, 0.75) 20%,
              rgba(10, 9, 8, 0.25) 50%,
              transparent 80%
            );
          }

          .rating-badge {
            top: 0.3rem;
            right: 0.3rem;
            transform: scale(0.7);
          }

          .action-save {
            top: 0.3rem;
            left: 0.3rem;
            transform: scale(0.85);
          }

          .series-badge {
            top: 2.4rem;
            right: 0.3rem;
            font-size: 0.52rem;
            padding: 0.22rem 0.35rem;
          }

          .watch-button {
            padding: 0.65rem 0.9rem;
            font-size: 0.7rem;
            gap: 0.35rem;
          }

          .watch-button svg {
            width: 20px;
            height: 20px;
          }

          .card-title {
            font-size: 0.68rem;
            margin-bottom: 0.15rem;
          }

          .year {
            font-size: 0.52rem;
          }

          .genre-tag {
            font-size: 0.48rem;
          }
        }
      `}</style>
    </div>
  );
}
