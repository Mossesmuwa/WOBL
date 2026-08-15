// components/movies/CastList.js
// Wobl — Cast & Crew
// Fetches credits directly from WOBL's API instead of relying on DB metadata.

import { useEffect, useMemo, useState } from "react";
import { W } from "../shared/wobl-theme";

function parseMediaId(rawId) {
  const value = String(rawId || "").trim();

  if (/^tv-\d+$/i.test(value)) {
    return {
      mediaType: "tv",
      id: value.slice(3),
    };
  }

  if (/^\d+$/.test(value)) {
    return {
      mediaType: "movie",
      id: value,
    };
  }

  return null;
}

function initials(name) {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export default function CastList({ tmdbId }) {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const media = useMemo(() => parseMediaId(tmdbId), [tmdbId]);

  useEffect(() => {
    let cancelled = false;

    async function loadCredits() {
      if (!media) {
        setCredits(null);
        setLoading(false);
        setError(true);
        return;
      }

      setLoading(true);
      setError(false);

      try {
        const params = new URLSearchParams({
          tmdb_id: `${media.mediaType === "tv" ? "tv-" : ""}${media.id}`,
        });

        const response = await fetch(`/api/movie-credits?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to load credits.");
        }

        const data = await response.json();

        if (!cancelled) {
          setCredits(data);
        }
      } catch (err) {
        console.error("[CastList] Failed to load credits:", err);

        if (!cancelled) {
          setError(true);
          setCredits(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCredits();

    return () => {
      cancelled = true;
    };
  }, [media]);

  if (loading) {
    return (
      <div className="credits-loading">
        <div className="loading-row">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div className="loading-card" key={item}>
              <div className="loading-avatar" />
              <div className="loading-line" />
              <div className="loading-line short" />
            </div>
          ))}
        </div>

        <style jsx>{`
          .credits-loading {
            width: 100%;
            overflow: hidden;
          }

          .loading-row {
            display: flex;
            gap: 1rem;
            overflow: hidden;
          }

          .loading-card {
            flex: 0 0 92px;
          }

          .loading-avatar {
            width: 72px;
            height: 72px;
            margin-bottom: 0.65rem;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.06);
            animation: pulse 1.4s ease-in-out infinite;
          }

          .loading-line {
            width: 80px;
            height: 8px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.06);
            animation: pulse 1.4s ease-in-out infinite;
          }

          .loading-line.short {
            width: 55px;
            margin-top: 6px;
          }

          @keyframes pulse {
            0%,
            100% {
              opacity: 0.45;
            }

            50% {
              opacity: 0.9;
            }
          }
        `}</style>
      </div>
    );
  }

  if (
    error ||
    !credits ||
    ((!credits.cast || credits.cast.length === 0) &&
      (!credits.crew || credits.crew.length === 0))
  ) {
    return (
      <div className="empty-credits">
        <div className="empty-icon">—</div>
        <p>Cast and crew information is not available yet.</p>

        <style jsx>{`
          .empty-credits {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            min-height: 70px;
            color: rgba(255, 255, 255, 0.45);
          }

          .empty-icon {
            width: 34px;
            height: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 50%;
            color: ${W.creamDim};
          }

          .empty-credits p {
            margin: 0;
            font-family: ${W.bodyFont};
            font-size: 0.85rem;
          }
        `}</style>
      </div>
    );
  }

  const cast = Array.isArray(credits.cast) ? credits.cast : [];
  const crew = Array.isArray(credits.crew) ? credits.crew : [];

  return (
    <div className="credits">
      {cast.length > 0 && (
        <section className="credit-group">
          <div className="group-header">
            <h3>Cast</h3>
            <span>{cast.length}</span>
          </div>

          <div className="cast-list">
            {cast.map((person) => (
              <div className="cast-card" key={person.id || person.credit_id}>
                <div className="person-image">
                  {person.profile_path ? (
                    <img
                      src={person.profile_path}
                      alt={person.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="person-placeholder">
                      {initials(person.name)}
                    </div>
                  )}
                </div>

                <div className="person-name">{person.name}</div>

                {person.character && (
                  <div className="person-role">{person.character}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {crew.length > 0 && (
        <section className="credit-group crew-group">
          <div className="group-header">
            <h3>Crew</h3>
            <span>{crew.length}</span>
          </div>

          <div className="crew-grid">
            {crew.map((person) => (
              <div
                className="crew-card"
                key={`${person.id || person.credit_id}-${person.job || person.department}`}
              >
                <div className="crew-avatar">
                  {person.profile_path ? (
                    <img
                      src={person.profile_path}
                      alt={person.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="crew-placeholder">
                      {initials(person.name)}
                    </div>
                  )}
                </div>

                <div className="crew-information">
                  <div className="crew-name">{person.name}</div>

                  {person.job && <div className="crew-role">{person.job}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <style jsx>{`
        .credits {
          width: 100%;
        }

        .credit-group + .credit-group {
          margin-top: 3rem;
        }

        .group-header {
          display: flex;
          align-items: baseline;
          gap: 0.65rem;
          margin-bottom: 1.25rem;
        }

        .group-header h3 {
          margin: 0;
          color: ${W.cream};
          font-family: ${W.displayFont};
          font-size: 1.15rem;
          font-weight: 600;
          letter-spacing: -0.015em;
        }

        .group-header span {
          color: ${W.creamDim};
          font-family: ${W.monoFont};
          font-size: 0.65rem;
        }

        .cast-list {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding: 0.2rem 0 0.75rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.14) transparent;
        }

        .cast-card {
          flex: 0 0 92px;
          text-align: center;
        }

        .person-image {
          width: 72px;
          height: 72px;
          margin: 0 auto 0.7rem;
          overflow: hidden;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: ${W.surface};
        }

        .person-image img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .person-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${W.creamDim};
          font-family: ${W.displayFont};
          font-size: 1rem;
        }

        .person-name {
          color: ${W.cream};
          font-family: ${W.bodyFont};
          font-size: 0.72rem;
          font-weight: 500;
          line-height: 1.25;
        }

        .person-role {
          margin-top: 0.2rem;
          color: ${W.creamDim};
          font-family: ${W.monoFont};
          font-size: 0.58rem;
          line-height: 1.25;
        }

        .crew-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.7rem;
          max-width: 850px;
        }

        .crew-card {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          min-width: 0;
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.025);
        }

        .crew-avatar {
          flex: 0 0 40px;
          width: 40px;
          height: 40px;
          overflow: hidden;
          border-radius: 50%;
          background: ${W.surface};
        }

        .crew-avatar img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .crew-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${W.creamDim};
          font-family: ${W.monoFont};
          font-size: 0.65rem;
        }

        .crew-information {
          min-width: 0;
        }

        .crew-name {
          overflow: hidden;
          color: ${W.cream};
          font-family: ${W.bodyFont};
          font-size: 0.76rem;
          font-weight: 500;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .crew-role {
          margin-top: 0.2rem;
          overflow: hidden;
          color: ${W.creamDim};
          font-family: ${W.monoFont};
          font-size: 0.59rem;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media (max-width: 800px) {
          .crew-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 520px) {
          .cast-list {
            gap: 0.75rem;
          }

          .cast-card {
            flex-basis: 82px;
          }

          .person-image {
            width: 64px;
            height: 64px;
          }

          .crew-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
