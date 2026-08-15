// components/movies/CastList.js
// WOBL — Cast & Crew display
//
// This component knows NOTHING about TMDB.
// It only receives already-normalized cast + crew data.
//
// Missing data is completely safe.

import { W } from "../shared/wobl-theme";

function PersonImage({ person, size = 64 }) {
  if (person?.profile_path) {
    return (
      <img
        src={person.profile_path}
        alt={person.name || "Person"}
        loading="lazy"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          display: "block",
          margin: "0 auto 0.5rem",
          background: W.surface,
        }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        margin: "0 auto 0.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: W.surface,
        border: "1px solid rgba(255,255,255,0.08)",
        color: W.creamDim,
        fontFamily: W.displayFont,
        fontSize: "1.1rem",
      }}
    >
      {person?.name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

function CastSection({ cast }) {
  if (!Array.isArray(cast) || cast.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <h3
        style={{
          margin: "0 0 1rem",
          fontFamily: W.displayFont,
          fontSize: "1rem",
          fontWeight: 600,
          color: W.cream,
        }}
      >
        Cast
      </h3>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          overflowX: "auto",
          paddingBottom: "0.75rem",
          scrollbarWidth: "thin",
        }}
      >
        {cast.map((person, index) => (
          <div
            key={`${person.id || person.name}-${index}`}
            style={{
              flex: "0 0 86px",
              width: 86,
              textAlign: "center",
            }}
          >
            <PersonImage person={person} size={64} />

            <div
              style={{
                fontFamily: W.bodyFont,
                fontSize: "0.72rem",
                lineHeight: 1.25,
                color: W.cream,
              }}
            >
              {person.name}
            </div>

            {person.character && (
              <div
                style={{
                  marginTop: "0.25rem",
                  fontFamily: W.monoFont,
                  fontSize: "0.6rem",
                  lineHeight: 1.3,
                  color: W.creamDim,
                }}
              >
                {person.character}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CrewSection({ crew }) {
  if (!Array.isArray(crew) || crew.length === 0) {
    return null;
  }

  return (
    <div>
      <h3
        style={{
          margin: "0 0 1rem",
          fontFamily: W.displayFont,
          fontSize: "1rem",
          fontWeight: 600,
          color: W.cream,
        }}
      >
        Crew
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "0.75rem",
        }}
      >
        {crew.map((person, index) => (
          <div
            key={`${person.id || person.name}-${person.job}-${index}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <PersonImage person={person} size={44} />

            <div
              style={{
                minWidth: 0,
                flex: 1,
              }}
            >
              <div
                style={{
                  color: W.cream,
                  fontFamily: W.bodyFont,
                  fontSize: "0.75rem",
                  lineHeight: 1.25,
                }}
              >
                {person.name}
              </div>

              {person.job && (
                <div
                  style={{
                    marginTop: "0.2rem",
                    color: W.creamDim,
                    fontFamily: W.monoFont,
                    fontSize: "0.6rem",
                    lineHeight: 1.3,
                  }}
                >
                  {person.job}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CastList({ cast = [], crew = [], loading = false }) {
  /*
   * Loading credits must NEVER affect the rest of the movie page.
   */
  if (loading) {
    return (
      <div
        style={{
          padding: "1rem 0",
          color: W.creamDim,
          fontFamily: W.monoFont,
          fontSize: "0.7rem",
        }}
      >
        Loading cast & crew…
      </div>
    );
  }

  const hasCast = Array.isArray(cast) && cast.length > 0;

  const hasCrew = Array.isArray(crew) && crew.length > 0;

  /*
   * Both missing.
   *
   * IMPORTANT:
   * We return a small message instead of throwing an error.
   */
  if (!hasCast && !hasCrew) {
    return (
      <div
        style={{
          padding: "1rem 0",
          color: W.creamDim,
          fontFamily: W.monoFont,
          fontSize: "0.7rem",
        }}
      >
        Cast & crew information is not available yet.
      </div>
    );
  }

  return (
    <div>
      <CastSection cast={cast} />
      <CrewSection crew={crew} />
    </div>
  );
}
