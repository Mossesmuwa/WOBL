// components/movies/GenreFilter.js
// Wobl — Genre filter. Direct buttons, not a hidden dropdown, per the
// spec's Letterboxd-derived lesson (primary actions should be visible,
// not buried). Genres are real resolved names from TMDBProvider's genre
// map — not raw IDs.

import { W } from "../shared/wobl-theme";

export default function GenreFilter({ genres, active, onChange }) {
  if (!genres || genres.length === 0) return null;

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button onClick={() => onChange(null)} style={pillStyle(active === null)}>
        All
      </button>
      {genres.map((g) => (
        <button
          key={g}
          onClick={() => onChange(g)}
          style={pillStyle(active === g)}
        >
          {g}
        </button>
      ))}
    </div>
  );
}

function pillStyle(isActive) {
  return {
    fontFamily: W.bodyFont,
    fontSize: 13,
    padding: "6px 14px",
    borderRadius: 20,
    border: `0.5px solid ${isActive ? W.amber : W.surfaceBorder}`,
    background: isActive ? "rgba(242,166,90,0.12)" : "transparent",
    color: isActive ? W.amber : W.creamDim,
    cursor: "pointer",
    transition: `all ${W.ease} 0.15s`,
  };
}
