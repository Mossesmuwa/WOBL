// components/movies/CastList.js
// Wobl — Dynamic Cast & Crew
//
// Fetches credits directly from the Wobl API route.
// Cast does NOT need to be stored in the database.
//
// Usage:
// <CastList tmdbId={item.source_id} />

import { useEffect, useState } from "react";
import { W } from "../shared/wobl-theme";

function parseMediaId(rawId) {
  const value = String(rawId || "").trim();

  // WOBL TV IDs use: tv-94997
  if (/^tv-\d+$/i.test(value)) {
    return {
      mediaType: "tv",
      id: value.slice(3),
    };
  }

  // Movie IDs are numeric
  if (/^\d+$/.test(value)) {
    return {
      mediaType: "movie",
      id: value,
    };
  }

  return null;
}

function PersonPlaceholder({ name }) {
  return (
    <div className="person-placeholder" aria-hidden="true">
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

export default function CastList({ tmdbId }) {
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!tmdbId) {
      setLoading(false);
      return;
    }

    const media = parseMediaId(tmdbId);

    if (!media) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchCredits() {
      setLoading(true);
      setError(false);

      try {
        const params = new URLSearchParams({
          tmdb_id: tmdbId,
        });

        const response = await fetch(`/api/credits?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Credits request failed: ${response.status}`);
        }

        const data = await response.json();

        if (cancelled) return;

        setCast(Array.isArray(data?.cast) ? data.cast : []);
        setCrew(Array.isArray(data?.crew) ? data.crew : []);
      } catch (err) {
        if (cancelled) return;

        console.error("[CastList] Failed to load credits:", err);

        setCast([]);
        setCrew([]);
        setError(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCredits();

    return () => {
      cancelled = true;
    };
  }, [tmdbId]);

  if (loading) {
    return (
      <>
        <div className="credits-loading">
          <div className="loading-line loading-line-large" />
          <div className="loading-line" />
          <div className="loading-line" />
          <div className="loading-line" />
        </div>

        <style jsx>{`
          .credits-loading {
            display: flex;
            gap: 1rem;
            overflow: hidden;
            padding: 0.25rem 0 0.75rem;
          }

          .loading-line {
            flex: 0 0 120px;
            height: 150px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.035);
            border: 1px solid rgba(255, 255, 255, 0.06);
            animation: pulse 1.5s ease-in-out infinite;
          }

          .loading-line-large {
            flex-basis: 140px;
          }

          @keyframes pulse {
            0%,
            100% {
              opacity: 0.45;
            }

            50% {
              opacity: 0.8;
            }
          }
        `}</style>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="credits-empty">Unable to load cast information.</div>

        <style jsx>{`
          .credits-empty {
            padding: 1rem 0;
            color: rgba(255, 255, 255, 0.4);
            font-family: var(--wobl-mono, monospace);
            font-size: 0.72rem;
          }
        `}</style>
      </>
    );
  }

  if (cast.length === 0 && crew.length === 0) {
    return (
      <>
        <div className="credits-empty">
          Cast and crew information is not available yet.
        </div>

        <style jsx>{`
          .credits-empty {
            padding: 1rem 0;
            color: rgba(255, 255, 255, 0.4);
            font-family: var(--wobl-mono, monospace);
            font-size: 0.72rem;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="credits">
        {cast.length > 0 && (
          <div className="credits-group">
            <div className="group-label">
              <span>Cast</span>
              <span className="group-count">{cast.length}</span>
            </div>

            <div className="cast-list">
              {cast.map((person, index) => (
                <div
                  className="cast-card"
                  key={`${person.id || person.name}-${index}`}
                >
                  <div className="person-photo">
                    {person.profile_path ? (
                      <img
                        src={person.profile_path}
                        alt={person.name}
                        loading="lazy"
                      />
                    ) : (
                      <PersonPlaceholder name={person.name} />
                    )}
                  </div>

                  <div className="person-name">{person.name}</div>

                  {person.character && (
                    <div className="person-character">{person.character}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {crew.length > 0 && (
          <div className="crew-section">
            <div className="group-label">
              <span>Crew</span>
              <span className="group-count">{crew.length}</span>
            </div>

            <div className="crew-list">
              {crew.map((person, index) => (
                <div
                  className="crew-card"
                  key={`${person.id || person.name}-${person.job}-${index}`}
                >
                  <div className="crew-name">{person.name}</div>

                  {person.job && <div className="crew-job">{person.job}</div>}

                  {person.department && (
                    <div className="crew-department">{person.department}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .credits {
          width: 100%;
        }

        .credits-group {
          width: 100%;
        }

        .group-label {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 1rem;
          color: var(--wobl-cream, #fff);
          font-family: var(--wobl-display, sans-serif);
          font-size: 0.95rem;
          font-weight: 600;
        }

        .group-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 22px;
          height: 22px;
          padding: 0 0.45rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.035);
          color: rgba(255, 255, 255, 0.45);
          font-family: var(--wobl-mono, monospace);
          font-size: 0.6rem;
          font-weight: 400;
        }

        .cast-list {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding: 0.15rem 0.15rem 0.75rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
        }

        .cast-list::-webkit-scrollbar {
          height: 5px;
        }

        .cast-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .cast-list::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
        }

        .cast-card {
          flex: 0 0 128px;
          min-width: 0;
        }

        .person-photo {
          width: 128px;
          aspect-ratio: 2 / 3;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.035);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.28);
        }

        .person-photo img {
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
          color: var(--wobl-cream-dim, #aaa);
          font-family: var(--wobl-display, sans-serif);
          font-size: 2rem;
          background:
            radial-gradient(
              circle at 50% 35%,
              rgba(255, 255, 255, 0.08),
              transparent 45%
            ),
            rgba(255, 255, 255, 0.025);
        }

        .person-name {
          margin-top: 0.65rem;
          overflow: hidden;
          color: var(--wobl-cream, #fff);
          font-family: var(--wobl-display, sans-serif);
          font-size: 0.78rem;
          font-weight: 600;
          line-height: 1.25;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .person-character {
          margin-top: 0.25rem;
          overflow: hidden;
          color: var(--wobl-cream-dim, #999);
          font-family: var(--wobl-mono, monospace);
          font-size: 0.6rem;
          line-height: 1.35;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .crew-section {
          margin-top: 2.5rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
        }

        .crew-list {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.75rem;
        }

        .crew-card {
          min-width: 0;
          padding: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.025);
        }

        .crew-name {
          overflow: hidden;
          color: var(--wobl-cream, #fff);
          font-family: var(--wobl-display, sans-serif);
          font-size: 0.8rem;
          font-weight: 600;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .crew-job {
          margin-top: 0.35rem;
          color: var(--wobl-amber, #f59e0b);
          font-family: var(--wobl-mono, monospace);
          font-size: 0.62rem;
          line-height: 1.4;
        }

        .crew-department {
          margin-top: 0.2rem;
          color: rgba(255, 255, 255, 0.38);
          font-family: var(--wobl-mono, monospace);
          font-size: 0.56rem;
        }

        .credits-empty {
          padding: 1rem 0;
          color: rgba(255, 255, 255, 0.4);
          font-family: var(--wobl-mono, monospace);
          font-size: 0.72rem;
        }

        @media (max-width: 700px) {
          .cast-list {
            gap: 0.8rem;
          }

          .cast-card {
            flex-basis: 110px;
          }

          .person-photo {
            width: 110px;
          }

          .crew-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
