// components/movies/MovieCard.js
// Wobl — premium card. Everything composed ON the poster (title, rating
// ring, genre, type) with a gradient scrim — not a poster followed by a
// separate plain-text block, which is what made the original version
// feel generic. Matches how Netflix/Apple TV+ actually treat cards.

import Link from "next/link";
import SaveButton from "./SaveButton";
import RatingRing from "./RatingRing";
import { W } from "../shared/wobl-theme";

export default function MovieCard({ item, frame }) {
  if (!item) return null;

  const genres = (item.genre || "")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  return (
    <div className="card-wrap">
      <Link href={`/movies/${item.slug}`} className="card">
        <div className="poster-wrap">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              className="poster-img"
            />
          ) : (
            <div className="poster-fallback">{item.name}</div>
          )}

          {frame != null && (
            <span className="frame-tag">{String(frame).padStart(3, "0")}</span>
          )}

          <div className="scrim" />

          {item.rating != null && (
            <div className="rating-badge">
              <RatingRing rating={item.rating} size={30} />
            </div>
          )}

          <div className="poster-content">
            <h3 className="card-title">{item.name}</h3>
            <div className="card-meta">
              {item.type === "tv" && <span className="genre-tag">Series</span>}
              {item.year && <span className="year">{item.year}</span>}
              {genres[0] && <span className="genre-tag">{genres[0]}</span>}
            </div>
          </div>
        </div>
      </Link>

      {/* Sibling to Link, not nested inside its <a> — a <button> inside
          an <a> is invalid HTML nesting. Positioned via absolute overlay
          on the shared .card-wrap instead. */}
      <div className="save-overlay">
        <SaveButton item={item} size="small" />
      </div>

      <style jsx>{`
        .card-wrap {
          position: relative;
        }
        .card {
          display: block;
          text-decoration: none;
          color: inherit;
        }
        .poster-wrap {
          position: relative;
          aspect-ratio: 2 / 3;
          border-radius: 10px;
          overflow: hidden;
          background: var(--wobl-surface, #1a1613);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }
        .card:hover .poster-wrap {
          transform: translateY(-4px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.5);
        }
        .poster-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }
        .card:hover .poster-img {
          transform: scale(1.06);
        }
        .poster-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 1rem;
          text-align: center;
          font-family: var(--wobl-display, serif);
          font-size: 0.95rem;
          color: var(--wobl-cream-dim, #b8ac9c);
        }
        .scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(10, 9, 8, 0.95) 0%,
            rgba(10, 9, 8, 0.55) 30%,
            transparent 60%
          );
          pointer-events: none;
        }
        /* Top row: frame number left, save button center-left, rating
           ring right — spaced so nothing overlaps. */
        .frame-tag {
          position: absolute;
          top: 0.5rem;
          left: 0.5rem;
          font-family: var(--wobl-mono, monospace);
          font-size: 0.65rem;
          letter-spacing: 0.05em;
          color: var(--wobl-cream, #f5efe6);
          background: rgba(10, 9, 8, 0.6);
          padding: 0.15rem 0.4rem;
          border-radius: 3px;
          z-index: 2;
        }
        .rating-badge {
          position: absolute;
          top: 0.4rem;
          right: 0.4rem;
          z-index: 2;
          background: rgba(10, 9, 8, 0.5);
          border-radius: 50%;
        }
        .save-overlay {
          position: absolute;
          top: 2.35rem;
          left: 0.4rem;
          z-index: 3;
        }
        .poster-content {
          position: absolute;
          left: 0.7rem;
          right: 0.7rem;
          bottom: 0.65rem;
          z-index: 2;
        }
        .card-title {
          font-family: var(--wobl-display, serif);
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--wobl-cream, #f5efe6);
          margin: 0 0 0.25rem;
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
        }
        .card-meta {
          display: flex;
          gap: 0.4rem;
          align-items: center;
          flex-wrap: wrap;
        }
        .year {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.68rem;
          color: var(--wobl-cream-dim, #b8ac9c);
        }
        .genre-tag {
          padding: 0.05rem 0.4rem;
          border-radius: 10px;
          border: 0.5px solid rgba(255, 255, 255, 0.2);
          font-family: var(--wobl-mono, monospace);
          font-size: 0.6rem;
          color: var(--wobl-cream-dim, #b8ac9c);
        }
        @media (min-width: 1440px) {
          .card:hover .poster-wrap {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </div>
  );
}
