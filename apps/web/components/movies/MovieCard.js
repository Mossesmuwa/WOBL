// components/MovieCard.js
// Wobl — Movie/TV card with "frame counter" signature element.
// Reused across homepage sections, category pages, and search results.

import Link from "next/link";
import SaveButton from "./SaveButton";

export default function MovieCard({ item, frame }) {
  if (!item) return null;

  return (
    <div className="card-wrap">
      <Link href={`/movies/${item.slug}`} className="card">
        <div className="poster-wrap">
          {item.image ? (
            <img src={item.image} alt={item.name} loading="lazy" />
          ) : (
            <div className="poster-fallback">{item.name}</div>
          )}
          {frame != null && (
            <span className="frame-tag">{String(frame).padStart(3, "0")}</span>
          )}
          {item.type === "tv" && <span className="type-tag">Series</span>}
        </div>

        <div className="card-info">
          <h3 className="card-title">{item.name}</h3>
          <div className="card-meta">
            {item.year && <span>{item.year}</span>}
            {item.rating != null && (
              <span className="rating">★ {item.rating}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Sibling to Link, not nested inside it — <button> inside <a> is
          invalid HTML (interactive content can't nest). Positioned via
          CSS overlay instead. */}
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
          transition: transform 0.15s ease;
        }
        .card:hover {
          transform: translateY(-3px);
        }
        .card:active {
          /* Touch devices don't get :hover — this is the mobile-equivalent
           * feedback so a tap still feels responsive. */
          transform: scale(0.97);
        }
        @media (min-width: 1440px) {
          /* Desktop-only: slightly larger lift, since cursor-driven hover
           * reads better with more travel than a touch tap would. */
          .card:hover {
            transform: translateY(-5px) scale(1.015);
          }
        }
        .poster-wrap {
          position: relative;
          aspect-ratio: 2 / 3;
          border-radius: 6px;
          overflow: hidden;
          background: var(--wobl-surface);
        }
        .poster-wrap img {
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
          font-family: var(--wobl-display);
          font-size: 0.95rem;
          color: var(--wobl-cream-dim);
        }
        .frame-tag {
          position: absolute;
          top: 0.5rem;
          left: 0.5rem;
          font-family: var(--wobl-mono);
          font-size: 0.65rem;
          letter-spacing: 0.05em;
          color: var(--wobl-cream);
          background: rgba(20, 17, 15, 0.7);
          padding: 0.15rem 0.4rem;
          border-radius: 3px;
        }
        .type-tag {
          position: absolute;
          bottom: 0.5rem;
          right: 0.5rem;
          font-family: var(--wobl-mono);
          font-size: 0.65rem;
          color: var(--wobl-amber);
          background: rgba(20, 17, 15, 0.7);
          padding: 0.15rem 0.4rem;
          border-radius: 3px;
        }
        .save-overlay {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          z-index: 2;
        }
        .card-info {
          padding: 0.6rem 0.1rem 0;
        }
        .card-title {
          font-family: var(--wobl-display);
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--wobl-cream);
          margin: 0 0 0.25rem;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-meta {
          display: flex;
          gap: 0.6rem;
          font-family: var(--wobl-mono);
          font-size: 0.75rem;
          color: var(--wobl-cream-dim);
        }
        .rating {
          color: var(--wobl-marquee);
        }
      `}</style>
    </div>
  );
}
