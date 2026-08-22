// components/movies/CastList.js
// Wobl — Enhanced Cast & Crew Display
// Premium animations, better interactions, improved typography

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { W } from "../shared/wobl-theme";

function PersonImage({ person, size = 64 }) {
  if (person?.profile_path) {
    return (
      <motion.img
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
          border: "2px solid rgba(255, 255, 255, 0.08)",
        }}
        whileHover={{ scale: 1.08 }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        margin: "0 auto 0.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${W.amber}22, ${W.surface})`,
        border: `2px solid ${W.amber}40`,
        color: W.creamDim,
        fontFamily: W.displayFont,
        fontSize: "1.1rem",
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {person?.name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

function CastSection({ cast, showAll = false, onToggle }) {
  if (!Array.isArray(cast) || cast.length === 0) {
    return null;
  }

  const displayCast = showAll ? cast : cast.slice(0, 8);
  const hasMore = cast.length > 8;

  return (
    <div style={{ marginBottom: "3rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: W.displayFont,
            fontSize: "1.15rem",
            fontWeight: 700,
            color: W.cream,
            letterSpacing: "-0.01em",
          }}
        >
          Starring
        </h3>
        {hasMore && (
          <motion.button
            onClick={() => onToggle("cast")}
            style={{
              border: `1px solid ${W.amber}40`,
              background: "transparent",
              color: W.amber,
              padding: "0.4rem 0.8rem",
              borderRadius: "6px",
              fontFamily: W.monoFont,
              fontSize: "0.65rem",
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
            whileHover={{ scale: 1.05 }}
          >
            {showAll ? "Show Less" : "Show All"}
          </motion.button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          overflowX: "auto",
          paddingBottom: "0.75rem",
          scrollbarWidth: "thin",
          scrollbarColor: `${W.amber}40 transparent`,
        }}
      >
        <AnimatePresence>
          {displayCast.map((person, index) => (
            <motion.div
              key={`${person.id || person.name}-${index}`}
              style={{
                flex: "0 0 100px",
                width: 100,
                textAlign: "center",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <motion.div whileHover={{ scale: 1.08 }}>
                <PersonImage person={person} size={80} />
              </motion.div>

              <motion.div
                style={{
                  fontFamily: W.displayFont,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: W.cream,
                  marginBottom: "0.3rem",
                }}
                whileHover={{ color: W.amber }}
              >
                {person.name}
              </motion.div>

              {person.character && (
                <div
                  style={{
                    fontFamily: W.monoFont,
                    fontSize: "0.65rem",
                    lineHeight: 1.3,
                    color: W.creamDim,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {person.character}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CrewSection({ crew, showAll = false, onToggle }) {
  if (!Array.isArray(crew) || crew.length === 0) {
    return null;
  }

  // Group crew by department
  const crewByRole = {};
  crew.forEach((person) => {
    const job = person.job || "Other";
    if (!crewByRole[job]) crewByRole[job] = [];
    crewByRole[job].push(person);
  });

  const displayRoles = showAll
    ? Object.keys(crewByRole)
    : Object.keys(crewByRole).slice(0, 3);
  const hasMore = Object.keys(crewByRole).length > 3;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: W.displayFont,
            fontSize: "1.15rem",
            fontWeight: 700,
            color: W.cream,
            letterSpacing: "-0.01em",
          }}
        >
          Crew
        </h3>
        {hasMore && (
          <motion.button
            onClick={() => onToggle("crew")}
            style={{
              border: `1px solid ${W.amber}40`,
              background: "transparent",
              color: W.amber,
              padding: "0.4rem 0.8rem",
              borderRadius: "6px",
              fontFamily: W.monoFont,
              fontSize: "0.65rem",
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
            whileHover={{ scale: 1.05 }}
          >
            {showAll ? "Show Less" : "Show All"}
          </motion.button>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        <AnimatePresence>
          {displayRoles.map((role) =>
            crewByRole[role].map((person, index) => (
              <motion.div
                key={`${person.id || person.name}-${role}-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "1rem",
                  borderRadius: "12px",
                  background: `linear-gradient(135deg, rgba(245, 158, 11, 0.04), rgba(255, 255, 255, 0.02))`,
                  border: "1px solid rgba(255, 255, 255, 0.07)",
                  transition: "all 0.3s ease",
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{
                  borderColor: `${W.amber}60`,
                  background: `linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(255, 255, 255, 0.04))`,
                  y: -2,
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <PersonImage person={person} size={48} />
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      color: W.cream,
                      fontFamily: W.displayFont,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      lineHeight: 1.2,
                      marginBottom: "0.3rem",
                    }}
                  >
                    {person.name}
                  </div>

                  <div
                    style={{
                      color: W.amber,
                      fontFamily: W.monoFont,
                      fontSize: "0.65rem",
                      lineHeight: 1.3,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      fontWeight: 500,
                      marginBottom: "0.2rem",
                    }}
                  >
                    {role}
                  </div>

                  {person.job && person.job !== role && (
                    <div
                      style={{
                        color: W.creamDim,
                        fontFamily: W.monoFont,
                        fontSize: "0.6rem",
                        lineHeight: 1.2,
                      }}
                    >
                      ({person.job})
                    </div>
                  )}
                </div>
              </motion.div>
            )),
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function CastList({ cast = [], crew = [], loading = false }) {
  const [showAll, setShowAll] = useState({ cast: false, crew: false });

  if (loading) {
    return (
      <motion.div
        style={{
          padding: "2rem",
          color: W.creamDim,
          fontFamily: W.monoFont,
          fontSize: "0.75rem",
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Loading cast & crew…
      </motion.div>
    );
  }

  const hasCast = Array.isArray(cast) && cast.length > 0;
  const hasCrew = Array.isArray(crew) && crew.length > 0;

  if (!hasCast && !hasCrew) {
    return (
      <motion.div
        style={{
          padding: "2rem",
          color: W.creamDim,
          fontFamily: W.monoFont,
          fontSize: "0.75rem",
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Cast & crew information is not available yet.
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {hasCast && (
        <CastSection
          cast={cast}
          showAll={showAll.cast}
          onToggle={(type) => setShowAll((s) => ({ ...s, [type]: !s[type] }))}
        />
      )}
      {hasCrew && (
        <CrewSection
          crew={crew}
          showAll={showAll.crew}
          onToggle={(type) => setShowAll((s) => ({ ...s, [type]: !s[type] }))}
        />
      )}
    </motion.div>
  );
}
