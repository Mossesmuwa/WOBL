import { useEffect, useState } from "react";
import { W } from "../shared/wobl-theme";

export default function CastList({ tmdbId }) {
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tmdbId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadCredits() {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/movie-credits?tmdb_id=${encodeURIComponent(tmdbId)}`,
        );

        if (!response.ok) {
          throw new Error("Failed to load credits.");
        }

        const data = await response.json();

        if (cancelled) return;

        setCast(Array.isArray(data?.cast) ? data.cast : []);
        setCrew(Array.isArray(data?.crew) ? data.crew : []);
      } catch (error) {
        console.error("Failed to load cast and crew:", error);

        if (!cancelled) {
          setCast([]);
          setCrew([]);
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
  }, [tmdbId]);

  if (loading) {
    return (
      <div className="loading">
        Loading cast & crew
        <style jsx>{`
          .loading {
            color: ${W.creamDim};
            font-family: ${W.monoFont};
            font-size: 0.68rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
        `}</style>
      </div>
    );
  }

  if (cast.length === 0 && crew.length === 0) {
    return (
      <p className="empty">
        Cast and crew information is not available for this title yet.
        <style jsx>{`
          .empty {
            margin: 0;
            color: ${W.creamDim};
            font-size: 0.9rem;
          }
        `}</style>
      </p>
    );
  }

  return (
    <div className="credits">
      {cast.length > 0 && (
        <section className="credit-group">
          <div className="subheading">Cast</div>

          <div className="cast-row">
            {cast.map((person) => (
              <article className="person" key={person.id}>
                <div className="portrait">
                  {person.profile_path ? (
                    <img
                      src={person.profile_path}
                      alt={person.name}
                      loading="lazy"
                    />
                  ) : (
                    <span>{person.name?.charAt(0)?.toUpperCase() || "?"}</span>
                  )}
                </div>

                <div className="name">{person.name}</div>

                {person.character && (
                  <div className="character">{person.character}</div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {crew.length > 0 && (
        <section className="credit-group crew-group">
          <div className="subheading">Crew</div>

          <div className="crew-grid">
            {crew.map((person) => (
              <div className="crew-person" key={`${person.id}-${person.job}`}>
                <div className="crew-name">{person.name}</div>
                <div className="crew-job">{person.job}</div>
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
          margin-top: 2.5rem;
        }

        .subheading {
          margin-bottom: 1rem;
          color: ${W.cream};
          font-family: ${W.displayFont};
          font-size: 1rem;
          font-weight: 600;
        }

        .cast-row {
          display: flex;
          gap: 1.15rem;
          overflow-x: auto;
          padding: 0.25rem 0.1rem 0.75rem;
          scrollbar-width: thin;
        }

        .person {
          flex: 0 0 108px;
          text-align: center;
        }

        .portrait {
          width: 82px;
          height: 82px;
          margin: 0 auto 0.7rem;
          overflow: hidden;
          border-radius: 50%;
          background: ${W.surface};
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${W.creamDim};
          font-family: ${W.displayFont};
          font-size: 1.4rem;
        }

        .portrait img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .name {
          color: ${W.cream};
          font-size: 0.78rem;
          line-height: 1.3;
        }

        .character {
          margin-top: 0.2rem;
          color: ${W.creamDim};
          font-family: ${W.monoFont};
          font-size: 0.6rem;
          line-height: 1.3;
        }

        .crew-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.75rem;
        }

        .crew-person {
          min-width: 0;
          padding: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.025);
        }

        .crew-name {
          color: ${W.cream};
          font-size: 0.8rem;
          line-height: 1.35;
        }

        .crew-job {
          margin-top: 0.3rem;
          color: ${W.creamDim};
          font-family: ${W.monoFont};
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @media (max-width: 760px) {
          .crew-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
