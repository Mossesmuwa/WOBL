// components/movies/RatingRing.js
// Wobl — circular rating indicator. Real visual weight instead of plain
// "★ 7.2" text buried in a meta row — matches how Letterboxd/Apple TV+
// treat rating as a distinct visual element, not inline copy.

import { W } from "../shared/wobl-theme";

export default function RatingRing({ rating, size = 54 }) {
  if (rating == null) return null;

  const pct = Math.max(0, Math.min(1, rating / 10));
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
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
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={W.marquee}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: W.displayFont,
          fontSize: size * 0.32,
          fontWeight: 600,
          color: W.cream,
        }}
      >
        {rating}
      </div>
    </div>
  );
}
