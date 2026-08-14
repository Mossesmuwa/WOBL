// components/movies/MovieCardSkeleton.js
// Wobl — Loading skeleton matching MovieCard's shape. Was duplicated
// inline in both movies/index.js and favorites.js — consolidated here.

import { W } from "../shared/wobl-theme";

export default function MovieCardSkeleton({ count = 6 }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
        gap: "1.25rem",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="wobl-skeleton-card">
          <style jsx>{`
            .wobl-skeleton-card {
              aspect-ratio: 2 / 3;
              border-radius: 12px;
              background: ${W.surface};
              animation: woblSkeletonPulse 1.4s ease-in-out infinite;
            }
            @keyframes woblSkeletonPulse {
              0%,
              100% {
                opacity: 0.5;
              }
              50% {
                opacity: 0.9;
              }
            }
          `}</style>
        </div>
      ))}
    </div>
  );
}
