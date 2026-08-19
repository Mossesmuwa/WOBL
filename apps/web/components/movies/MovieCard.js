// components/movies/MovieCard.js
// Wobl — premium card, revised per direct feedback:
// - No frame numbers (001, 002...) — those only belong on a dedicated
//   Top 10 page, not general grids, per explicit direction.
// - Save/like button is prominent and clearly visible, not tucked away.
// - "Series" tag sits directly below the save button, stacked.
// - Sizing is responsive — smaller base card, tighter on mobile.

import Link from "next/link";
import SaveButton from "./SaveButton";
import RatingRing from "./RatingRing";
import { W } from "../shared/wobl-theme";

export default function MovieCard({ item }) {
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

          <div className="scrim" />

          {item.rating != null && (
            <div className="rating-badge">
              <RatingRing rating={item.rating} size={28} />
            </div>
          )}

          <div className="poster-content">
            <h3 className="card-title">{item.name}</h3>
            <div className="card-meta">
              {item.year && <span className="year">{item.year}</span>}
              {genres[0] && <span className="genre-tag">{genres[0]}</span>}
            </div>
          </div>
        </div>
      </Link>

      {/* Sibling to Link, not nested in its <a> — a <button> inside <a>
          is invalid HTML nesting. */}
      <div className="side-actions">
        <SaveButton item={item} size="small" />
        {item.type === "tv" && <span className="series-tag">Series</span>}
      </div>

      <style jsx>{`
        .card-wrap {
          position: relative;
          width: 100%;
        }
        .card {
          display: block;
          text-decoration: none;
          color: inherit;
        }
        .poster-wrap {
          position: relative;
          aspect-ratio: 2 / 3;
          border-radius: 8px;
          overflow: hidden;
          background: var(--wobl-surface, #1a1613);
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.28);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }
        .card:hover .poster-wrap {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.45);
        }
        .poster-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }
        .card:hover .poster-img {
          transform: scale(1.05);
        }
        .poster-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 0.75rem;
          text-align: center;
          font-family: var(--wobl-display, serif);
          font-size: 0.8rem;
          color: var(--wobl-cream-dim, #b8ac9c);
        }
        .scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(10, 9, 8, 0.92) 0%,
            rgba(10, 9, 8, 0.45) 32%,
            transparent 62%
          );
          pointer-events: none;
        }
        .rating-badge {
          position: absolute;
          top: 0.4rem;
          right: 0.4rem;
          z-index: 2;
          background: rgba(10, 9, 8, 0.5);
          border-radius: 50%;
        }
        .side-actions {
          position: absolute;
          top: 0.4rem;
          left: 0.4rem;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.3rem;
        }
        .series-tag {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.6rem;
          color: var(--wobl-amber, #f2a65a);
          background: rgba(10, 9, 8, 0.65);
          padding: 0.12rem 0.4rem;
          border-radius: 3px;
        }
        .poster-content {
          position: absolute;
          left: 0.6rem;
          right: 0.6rem;
          bottom: 0.55rem;
          z-index: 2;
        }
        .card-title {
          font-family: var(--wobl-display, serif);
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--wobl-cream, #f5efe6);
          margin: 0 0 0.2rem;
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
        }
        .card-meta {
          display: flex;
          gap: 0.35rem;
          align-items: center;
          flex-wrap: wrap;
        }
        .year {
          font-family: var(--wobl-mono, monospace);
          font-size: 0.62rem;
          color: var(--wobl-cream-dim, #b8ac9c);
        }
        .genre-tag {
          padding: 0.03rem 0.35rem;
          border-radius: 8px;
          border: 0.5px solid rgba(255, 255, 255, 0.18);
          font-family: var(--wobl-mono, monospace);
          font-size: 0.56rem;
          color: var(--wobl-cream-dim, #b8ac9c);
        }
        /* Smaller cards, denser grid on small screens */
        @media (max-width: 480px) {
          .card-title {
            font-size: 0.75rem;
          }
          .rating-badge {
            transform: scale(0.85);
            transform-origin: top right;
          }
        }
      `}</style>
    </div>
  );
}
