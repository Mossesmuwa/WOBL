// components/movies/SaveButton.js
// Wobl — Save/favorite toggle. Closes the loop: favorites.js could only
// ever display/remove, nothing could add. Per spec: icon fills + brief
// glass ripple on toggle, toast confirmation, never a jarring alert.

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useSupabase } from "shared/lib/SupabaseContext";
import { addFavorite, removeFavorite, getFavorites } from "shared/lib/items";
import { useToast } from "../shared/Toast";
import { W, glassPanel } from "../shared/wobl-theme";

function HeartIcon({ filled, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function SaveButton({ item, size = "default" }) {
  const { user } = useSupabase();
  const { showToast } = useToast();
  const [saved, setSaved] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || !item) {
      setChecking(false);
      return;
    }
    // Lightweight check against the user's favorites — acceptable for
    // hobby-scale traffic; a dedicated "is this saved" query would be
    // more efficient at larger scale but isn't needed yet.
    getFavorites(user.id).then((favs) => {
      setSaved(favs.some((f) => f.id === item.id));
      setChecking(false);
    });
  }, [user, item]);

  const handleToggle = async () => {
    if (!user) {
      showToast("Sign in to save titles");
      return;
    }
    if (busy) return;
    setBusy(true);

    if (saved) {
      const result = await removeFavorite(user.id, item.id);
      if (result.success) {
        setSaved(false);
        showToast("Removed from your shelf");
      } else {
        showToast("Couldn't remove — try again");
      }
    } else {
      const result = await addFavorite(user.id, item.id);
      if (result.success) {
        setSaved(true);
        showToast("Saved to your shelf");
      } else {
        showToast("Couldn't save — try again");
      }
    }
    setBusy(false);
  };

  const isSmall = size === "small";

  return (
    <motion.button
      onClick={handleToggle}
      disabled={checking || busy}
      whileTap={{ scale: 0.9 }}
      aria-label={saved ? "Remove from shelf" : "Save to shelf"}
      aria-pressed={saved}
      style={{
        ...glassPanel,
        width: isSmall ? 32 : 40,
        height: isSmall ? 32 : 40,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: checking || busy ? "default" : "pointer",
        color: saved ? W.marquee : W.cream,
        opacity: checking ? 0.5 : 1,
      }}
    >
      <HeartIcon filled={saved} size={isSmall ? 14 : 18} />
    </motion.button>
  );
}
