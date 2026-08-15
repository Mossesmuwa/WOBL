// components/movies/CastList.js
// WOBL — Cast & Crew
//
// Cast/crew is fetched directly from TMDB through the WOBL API.
// It is intentionally NOT required for the movie page to render.
//
// Expected:
//   <CastList tmdbId={item.source_id} />
//
// Movie source_id:
//   "12345"
//
// TV source_id:
//   "tv-94997"

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

function getInitials(name) {
  const value = String(name || "").trim();

  if (!value) {
    return "?";
  }

  const parts = value.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getProfileUrl(profilePath) {
  if (!profilePath) {
    return null;
  }

  if (profilePath.startsWith("http://")) {
    return profilePath;
  }

  if (profilePath.startsWith("https://")) {
    return profilePath;
  }

  if (profilePath.startsWith("/")) {
    return `https://image.tmdb.org/t/p/w185${profilePath}`;
  }

  return `https://image.tmdb.org/t/p/w185/${profilePath}`;
}

function PersonCard({ person, crew = false }) {
  const profileUrl = getProfileUrl(person.profile_path);

  const role = crew
    ? person.job || person.department || "Crew"
    : person.character || "Cast";

  return (
    <div className="person-card">
      <div className="person-photo-wrap">
        {profileUrl ? (
          <img
            src={profileUrl}
            alt={person.name || "Cast member"}
            className="person-photo"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";

              const fallback =
                event.currentTarget.parentElement?.querySelector(
                  ".person-fallback",
                );

              if (fallback) {
                fallback.style.display = "flex";
              }
            }}
          />
        ) : null}

        <div
          className="person-fallback"
          style={{
            display: profileUrl ? "none" : "flex",
          }}
          aria-hidden="true"
        >
          {getInitials(person.name)}
        </div>
      </div>

      <div className="person-name">{person.name || "Unknown"}</div>

      <div className="person-role">{role}</div>
    </div>
  );
}

export default function CastList({ tmdbId }) {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const media = useMemo(() => parseMediaId(tmdbId), [tmdbId]);

  useEffect(() => {
    let cancelled = false;

    async function loadCredits() {
      if (!media) {
        setLoading(false);
        setCredits(null);
        return;
      }

      setLoading(true);
      setFailed(false);

      try {
        const params = new URLSearchParams({
          tmdb_id: tmdbId,
        });

        const response = await fetch(
          `/api/movies/credits?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error(`Credits request failed with ${response.status}`);
        }

        const data = await response.json();

        if (cancelled) {
          return;
        }

        if (!data?.success) {
          throw new Error(data?.error || "Credits request failed.");
        }

        setCredits({
          cast: Array.isArray(data.cast) ? data.cast : [],
          crew: Array.isArray(data.crew) ? data.crew : [],
          director: data.director || null,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.warn("[CastList] Unable to load credits:", error);

        setCredits(null);
        setFailed(true);
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
  }, [media, tmdbId]);

  /*
   * IMPORTANT:
   *
   * Never throw here.
   *
   * Cast/crew is optional content. If TMDB is unavailable,
   * the rest of the movie page must continue working.
   */

  if (!media) {
    return null;
  }

  if (loading) {
    return (
      <div className="cast-loading">
        <div className="loading-row">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="loading-card" key={index}>
              <div className="loading-photo" />

              <div className="loading-name" />

              <div className="loading-role" />
            </div>
          ))}
        </div>

        <style jsx>{`
          .cast-loading {
            width: 100%;
            overflow: hidden;
          }

          .loading-row {
            display: flex;
            gap: 1rem;
            overflow-x: auto;
            padding: 0.25rem 0 0.75rem;
            scrollbar-width: none;
          }

          .loading-row::-webkit-scrollbar {
            display: none;
          }

          .loading-card {
            flex: 0 0 92px;
          }

          .loading-photo {
            width: 76px;
            height: 76px;
            margin: 0 auto 0.65rem;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.06);
            animation: pulse 1.4s ease-in-out infinite;
          }

          .loading-name {
            width: 70px;
            height: 8px;
            margin: 0 auto 0.45rem;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.06);
            animation: pulse 1.4s ease-in-out infinite;
          }

          .loading-role {
            width: 52px;
            height: 6px;
            margin: 0 auto;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.04);
            animation: pulse 1.4s ease-in-out infinite;
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

  /*
   * If credits failed, DO NOT break the page.
   *
   * Just render a quiet fallback.
   */
  if (failed || !credits) {
    return (
      <div className="empty-state">
        <span>Cast and crew information is not available right now.</span>

        <style jsx>{`
          .empty-state {
            min-height: 72px;
            display: flex;
            align-items: center;
            padding: 1rem 1.25rem;
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.025);
            color: ${W.creamDim};
            font-family: ${W.monoFont};
            font-size: 0.72rem;
          }
        `}</style>
      </div>
    );
  }

  const cast = credits.cast || [];
  const crew = credits.crew || [];

  /*
   * Remove duplicate crew people.
   */
  const uniqueCrew = [];
  const crewSeen = new Set();

  for (const person of crew) {
    if (!person?.name) {
      continue;
    }

    const key = `${person.name}-${person.job || person.department}`;

    if (crewSeen.has(key)) {
      continue;
    }

    crewSeen.add(key);
    uniqueCrew.push(person);
  }

  /*
   * Keep the most useful crew roles.
   */
  const preferredJobs = [
    "Director",
    "Series Director",
    "Executive Producer",
    "Producer",
    "Writer",
    "Screenplay",
    "Director of Photography",
    "Original Music Composer",
    "Music",
    "Editor",
  ];

  const sortedCrew = [...uniqueCrew]
    .sort((a, b) => {
      const aIndex = preferredJobs.indexOf(a.job);
      const bIndex = preferredJobs.indexOf(b.job);

      const normalizedA = aIndex === -1 ? 999 : aIndex;

      const normalizedB = bIndex === -1 ? 999 : bIndex;

      return normalizedA - normalizedB;
    })
    .slice(0, 8);

  const hasCast = cast.length > 0;
  const hasCrew = sortedCrew.length > 0;

  /*
   * Nothing available.
   *
   * Still return safely.
   */
  if (!hasCast && !hasCrew) {
    return (
      <div className="empty-state">
        Cast and crew information is not available yet.
        <style jsx>{`
          .empty-state {
            min-height: 72px;
            display: flex;
            align-items: center;
            padding: 1rem 1.25rem;
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.025);
            color: ${W.creamDim};
            font-family: ${W.monoFont};
            font-size: 0.72rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="credits">
      {/* =====================================================
          CAST
          ===================================================== */}

      {hasCast && (
        <div className="credit-group">
          <div className="subheading">
            <span>Cast</span>
          </div>

          <div className="people-row">
            {cast.map((person, index) => (
              <PersonCard
                key={person.id || `${person.name}-${index}`}
                person={person}
              />
            ))}
          </div>
        </div>
      )}

      {/* =====================================================
          CREW
          ===================================================== */}

      {hasCrew && (
        <div className="credit-group crew-group">
          <div className="subheading">
            <span>Crew</span>
          </div>

          <div className="people-row">
            {sortedCrew.map((person, index) => (
              <PersonCard
                key={person.id || `${person.name}-${person.job}-${index}`}
                person={person}
                crew
              />
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .credits {
          width: 100%;
        }

        .credit-group {
          width: 100%;
        }

        .crew-group {
          margin-top: 2.5rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .subheading {
          margin-bottom: 1rem;
          color: ${W.cream};
          font-family: ${W.monoFont};
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .people-row {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding: 0.25rem 0 0.8rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
        }

        .people-row::-webkit-scrollbar {
          height: 5px;
        }

        .people-row::-webkit-scrollbar-track {
          background: transparent;
        }

        .people-row::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 999px;
        }

        .person-card {
          flex: 0 0 92px;
          min-width: 92px;
          text-align: center;
        }

        .person-photo-wrap {
          position: relative;
          width: 76px;
          height: 76px;
          margin: 0 auto 0.65rem;
          overflow: hidden;
          border-radius: 50%;
          background: ${W.surface};
          border: 1px solid rgba(255, 255, 255, 0.09);
        }

        .person-photo {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .person-fallback {
          position: absolute;
          inset: 0;
          align-items: center;
          justify-content: center;
          background: ${W.surface};
          color: ${W.creamDim};
          font-family: ${W.displayFont};
          font-size: 1.1rem;
        }

        .person-name {
          overflow: hidden;
          color: ${W.cream};
          font-family: ${W.bodyFont};
          font-size: 0.7rem;
          line-height: 1.25;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .person-role {
          margin-top: 0.2rem;
          overflow: hidden;
          color: ${W.creamDim};
          font-family: ${W.monoFont};
          font-size: 0.59rem;
          line-height: 1.25;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media (max-width: 700px) {
          .people-row {
            gap: 0.8rem;
          }

          .person-card {
            flex-basis: 84px;
            min-width: 84px;
          }

          .person-photo-wrap {
            width: 68px;
            height: 68px;
          }

          .person-name {
            font-size: 0.66rem;
          }

          .person-role {
            font-size: 0.56rem;
          }
        }
      `}</style>
    </div>
  );
}
