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

          {/* Subtle atmospheric vignette gradient overlay on hover */}
          <div className="poster-vignette" />
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
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .card:hover {
          transform: translateY(-5px);
        }
        .card:active {
          transform: scale(0.97);
        }
        @media (min-width: 1440px) {
          .card:hover {
            transform: translateY(-7px) scale(1.01);
          }
        }
        .poster-wrap {
          position: relative;
          aspect-ratio: 2 / 3;
          border-radius: 8px;
          overflow: hidden;
          background: var(--wobl-surface, #141210);
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          transition:
            border-color 0.3s ease,
            box-shadow 0.3s ease;
        }
        .card:hover .poster-wrap {
          border-color: rgba(245, 158, 11, 0.3);
          box-shadow:
            0 20px 45px rgba(0, 0, 0, 0.7),
            0 0 20px rgba(245, 158, 11, 0.1);
        }
        .poster-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .card:hover .poster-wrap img {
          transform: scale(1.05);
        }
        .poster-vignette {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(10, 9, 8, 0.4) 0%,
            transparent 50%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .card:hover .poster-vignette {
          opacity: 1;
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
          background: rgba(20, 17, 15, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 0.2rem 0.45rem;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          z-index: 1;
        }
        .type-tag {
          position: absolute;
          bottom: 0.5rem;
          right: 0.5rem;
          font-family: var(--wobl-mono);
          font-size: 0.65rem;
          color: var(--wobl-amber);
          background: rgba(20, 17, 15, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 0.2rem 0.45rem;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          z-index: 1;
        }
        .save-overlay {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          z-index: 2;
        }
        .card-info {
          padding: 0.75rem 0.15rem 0;
        }
        .card-title {
          font-family: var(--wobl-display);
          font-size: 0.92rem;
          font-weight: 500;
          color: var(--wobl-cream);
          margin: 0 0 0.25rem;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.2s ease;
        }
        .card:hover .card-title {
          color: var(--wobl-amber, #f59e0b);
        }
        .card-meta {
          display: flex;
          gap: 0.6rem;
          font-family: var(--wobl-mono);
          font-size: 0.72rem;
          color: var(--wobl-cream-dim);
        }
        .rating {
          color: var(--wobl-marquee, #f59e0b);
        }
      `}</style>
    </div>
  );
}
