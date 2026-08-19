// components/movies/SaveButton.js
// Wobl — Save/favorite toggle. Closes the loop: favorites.js could only
// ever display/remove, nothing could add. Per spec: icon fills + brief
// glass ripple on toggle, toast confirmation, never a jarring alert.

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { useSupabase } from "shared/lib/SupabaseContext";
import { addFavorite, removeFavorite, getFavorites } from "shared/lib/items";
import { useToast } from "../shared/Toast";
import { W, glassPanel } from "../shared/wobl-theme";

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
        background: saved ? "rgba(217,113,60,0.25)" : "rgba(10,9,8,0.55)",
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
      <Heart
        size={isSmall ? 16 : 18}
        fill={saved ? "currentColor" : "none"}
        strokeWidth={2}
      />
    </motion.button>
  );
}
