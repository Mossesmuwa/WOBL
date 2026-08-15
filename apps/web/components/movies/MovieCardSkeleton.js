// components/movies/MovieCardSkeleton.js
// Wobl — Loading skeleton matching MovieCard's exact layout structure.
// Reused across homepage sections, category pages, and favorites.

import { W } from "../shared/wobl-theme";

export default function MovieCardSkeleton({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-poster">
            <div className="shimmer-effect" />
            <div className="skeleton-tag" />
          </div>
          <div className="skeleton-info">
            <div className="skeleton-line title-line" />
            <div className="skeleton-line meta-line" />
          </div>
        </div>
      ))}

      <style jsx>{`
        .skeleton-card {
          display: flex;
          flex-direction: column;
        }

        .skeleton-poster {
          position: relative;
          aspect-ratio: 2 / 3;
          border-radius: 8px;
          overflow: hidden;
          background: var(--wobl-surface, #141210);
          border: 1px solid rgba(255, 255, 255, 0.04);
        }

        /* Cinematic Shimmer Effect */
        .shimmer-effect {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.04) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmerAnimation 1.6s infinite linear;
        }

        .skeleton-tag {
          position: absolute;
          top: 0.5rem;
          left: 0.5rem;
          width: 2rem;
          height: 1rem;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
        }

        .skeleton-info {
          padding: 0.75rem 0.15rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .skeleton-line {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 4px;
        }

        .title-line {
          width: 85%;
          height: 14px;
        }

        .meta-line {
          width: 45%;
          height: 11px;
        }

        @keyframes shimmerAnimation {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </>
  );
}
