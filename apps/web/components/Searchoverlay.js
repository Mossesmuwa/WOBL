// components/SearchOverlay.js
// Wobl — Command-palette style search. Opens as a glass overlay, not a
// page. Keyboard-navigable (arrows + enter), debounced typing, shows
// trending titles by default and on no-results (never a dead end).

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { search as searchItems, getTrending } from "shared/lib/items";
import { W, glassPanel } from "./wobl-theme";
import { useSearchOverlay } from "../context/SearchContext";

const DEBOUNCE_MS = 200;

export default function SearchOverlay() {
  const { isOpen, close } = useSearchOverlay();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Load trending once, used as default suggestions and no-results fallback.
  useEffect(() => {
    if (isOpen && trending.length === 0) {
      getTrending(6, "movies").then(setTrending);
    }
  }, [isOpen, trending.length]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const data = await searchItems(query, { categoryId: "movies", limit: 8 });
      setResults(data);
      setActiveIndex(0);
      setLoading(false);
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const listShown = query.trim().length >= 2 ? results : trending;
  const isNoResults =
    query.trim().length >= 2 && !loading && results.length === 0;

  const goToItem = useCallback(
    (item) => {
      if (!item) return;
      close();
      router.push(`/movies/${item.slug}`);
    },
    [close, router],
  );

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, listShown.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      goToItem(listShown[activeIndex]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(10,9,8,0.7)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "12vh",
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: -16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -12, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            style={{
              ...glassPanel,
              width: "min(560px, 90vw)",
              borderRadius: W.radius,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 18px",
                borderBottom: `0.5px solid ${W.surfaceBorder}`,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={W.creamDim}
                strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search movies and shows…"
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: W.cream,
                  fontFamily: W.bodyFont,
                  fontSize: 15,
                }}
              />
              <span
                style={{
                  fontFamily: W.monoFont,
                  fontSize: 10,
                  color: W.creamFaint,
                  border: `0.5px solid ${W.surfaceBorder}`,
                  borderRadius: 4,
                  padding: "2px 6px",
                }}
              >
                ESC
              </span>
            </div>

            <div
              style={{
                padding: "8px 8px 12px",
                maxHeight: "50vh",
                overflowY: "auto",
              }}
            >
              {query.trim().length < 2 && (
                <div
                  style={{
                    fontFamily: W.monoFont,
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: W.marquee,
                    padding: "10px 10px 6px",
                  }}
                >
                  Trending
                </div>
              )}

              {isNoResults && (
                <div style={{ padding: "16px 14px 10px" }}>
                  <div
                    style={{
                      fontFamily: W.bodyFont,
                      fontSize: 13,
                      color: W.creamDim,
                      marginBottom: 12,
                    }}
                  >
                    Nothing found for "{query}" — try a broader term.
                  </div>
                  <div
                    style={{
                      fontFamily: W.monoFont,
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: W.marquee,
                      marginBottom: 4,
                    }}
                  >
                    Trending instead
                  </div>
                </div>
              )}

              {(isNoResults ? trending : listShown).map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => goToItem(item)}
                  onMouseEnter={() => setActiveIndex(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    background:
                      i === activeIndex && !isNoResults
                        ? "rgba(255,255,255,0.06)"
                        : "transparent",
                  }}
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      style={{
                        width: 32,
                        height: 46,
                        objectFit: "cover",
                        borderRadius: 4,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: W.bodyFont,
                        fontSize: 13,
                        color: W.cream,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        fontFamily: W.monoFont,
                        fontSize: 10,
                        color: W.creamFaint,
                      }}
                    >
                      {item.year}
                      {item.rating != null ? ` · ★ ${item.rating}` : ""}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
