// pages/favorites.js
// Wobl — Personal "shelf." Framed as a collection, not a plain list, per
// spec 3.6. Warm empty state for new users (never just "nothing saved").

import { useEffect, useState } from "react";
import Head from "next/head";
import { motion, AnimatePresence } from "motion/react";
import { useSupabase } from "shared/lib/SupabaseContext";
import { getFavorites, removeFavorite, getTrending } from "shared/lib/items";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import MovieCard from "../components/movies/MovieCard";
import MovieCardSkeleton from "../components/movies/MovieCardSkeleton";
import { W } from "../components/shared/wobl-theme";

export default function FavoritesPage() {
  const { user, loading: authLoading } = useSupabase();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      getTrending(6, "movies").then(setSuggestions);
      return;
    }
    getFavorites(user.id).then((data) => {
      setItems(data);
      setLoading(false);
      if (data.length === 0) getTrending(6, "movies").then(setSuggestions);
    });
  }, [user, authLoading]);

  const handleRemove = async (itemId) => {
    if (!user) return;
    // Optimistic — fades the card before the request resolves, per the
    // spec's "removing an item" motion note.
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    await removeFavorite(user.id, itemId);
  };

  return (
    <>
      <Head>
        <title>Your Shelf — Wobl</title>
      </Head>

      <Navbar />

      <main
        style={{
          background: W.bg,
          minHeight: "100vh",
          padding: "3rem 2rem 4rem",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              fontFamily: W.monoFont,
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: W.marquee,
              marginBottom: 6,
            }}
          >
            Your Shelf
          </div>
          <h1
            style={{
              fontFamily: W.displayFont,
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
              color: W.cream,
              margin: "0 0 2rem",
            }}
          >
            Saved
          </h1>

          {loading ? (
            <MovieCardSkeleton count={6} />
          ) : !user ? (
            <SignInPrompt />
          ) : items.length === 0 ? (
            <EmptyShelf suggestions={suggestions} />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
                gap: "1.25rem",
              }}
            >
              <AnimatePresence>
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    layout
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                  >
                    <MovieCard item={item} frame={i + 1} />
                    <button
                      onClick={() => handleRemove(item.id)}
                      style={{
                        marginTop: 6,
                        fontFamily: W.monoFont,
                        fontSize: 10,
                        color: W.creamFaint,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Remove
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

function SignInPrompt() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "3rem 1rem",
        fontFamily: W.bodyFont,
        fontSize: 14,
        color: W.creamDim,
      }}
    >
      Sign in to start building your shelf.
      <div style={{ marginTop: 12 }}>
        <a
          href="/account/login"
          style={{
            fontFamily: W.monoFont,
            fontSize: 12,
            color: W.marquee,
            textDecoration: "none",
            borderBottom: `1px solid ${W.marquee}`,
          }}
        >
          Sign in →
        </a>
      </div>
    </div>
  );
}

function EmptyShelf({ suggestions }) {
  return (
    <div>
      <div
        style={{
          textAlign: "center",
          padding: "2rem 1rem 2.5rem",
          fontFamily: W.bodyFont,
          fontSize: 14,
          color: W.creamDim,
        }}
      >
        Nothing saved yet — your shelf is waiting. Here's what's rising right
        now:
      </div>
      {suggestions.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {suggestions.map((item, i) => (
            <MovieCard key={item.id} item={item} frame={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
