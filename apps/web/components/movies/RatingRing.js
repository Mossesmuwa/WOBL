// components/movies/RatingRing.js
// Wobl — circular rating indicator, animated draw-in on mount so it
// feels alive, not a static SVG that just appears.

import { useEffect, useState } from "react";
import { W } from "../shared/wobl-theme";

export default function RatingRing({ rating, size = 54 }) {
  const [animatedPct, setAnimatedPct] = useState(0);

  const pct = rating != null ? Math.max(0, Math.min(1, rating / 10)) : 0;
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (rating == null) return;
    // Draw-in on mount: starts at 0, animates to real value shortly after.
    const t = setTimeout(() => setAnimatedPct(pct), 80);
    return () => clearTimeout(t);
  }, [pct, rating]);

  if (rating == null) return null;

  const offset = circumference * (1 - animatedPct);

  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="3"
        />
        <circle
          className="ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={W.marquee}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="ring-number" style={{ fontSize: size * 0.32 }}>
        {rating}
      </div>

      <style jsx>{`
        .ring-wrap {
          position: relative;
          flex-shrink: 0;
          animation: ringPulse 3s ease-in-out infinite;
        }
        .ring-progress {
          transition: stroke-dashoffset 0.9s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .ring-number {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: ${W.displayFont};
          font-weight: 600;
          color: ${W.cream};
        }
        @keyframes ringPulse {
          0%,
          100% {
            filter: drop-shadow(0 0 0 rgba(217, 113, 60, 0));
          }
          50% {
            filter: drop-shadow(0 0 4px rgba(217, 113, 60, 0.35));
          }
        }
      `}</style>
    </div>
  );
}
