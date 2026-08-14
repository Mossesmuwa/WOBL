// components/movies/CastList.js
// Wobl — Cast display. Extracted from being inlined directly in
// [slug].js so it's reusable and the detail page stays focused on
// layout, not rendering logic. Reads item.metadata.cast, populated by
// TMDBProvider's credits fetch.

import { W } from "../shared/wobl-theme";

export default function CastList({ cast }) {
  if (!cast || cast.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        overflowX: "auto",
        paddingBottom: "0.5rem",
        marginBottom: "1.5rem",
      }}
    >
      {cast.map((c, i) => (
        <div key={i} style={{ flexShrink: 0, width: 76, textAlign: "center" }}>
          {c.profile_path ? (
            <img
              src={c.profile_path}
              alt={c.name}
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                objectFit: "cover",
                margin: "0 auto 0.4rem",
              }}
            />
          ) : (
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                margin: "0 auto 0.4rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: W.surface,
                color: W.creamDim,
                fontFamily: W.displayFont,
                fontSize: "1.1rem",
              }}
            >
              {c.name?.charAt(0)}
            </div>
          )}
          <div
            style={{
              fontFamily: W.bodyFont,
              fontSize: "0.7rem",
              color: W.cream,
              lineHeight: 1.2,
            }}
          >
            {c.name}
          </div>
          {c.character && (
            <div
              style={{
                fontFamily: W.monoFont,
                fontSize: "0.62rem",
                color: W.creamDim,
                marginTop: 2,
              }}
            >
              {c.character}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
