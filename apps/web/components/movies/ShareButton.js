// components/movies/ShareButton.js
// Wobl — Share action. Uses the native Web Share API where available
// (mobile mostly), falls back to copy-link + toast on desktop. Per spec:
// direct action button, not hidden behind a menu.

import { motion } from "motion/react";
import { Share2 } from "lucide-react";
import { useToast } from "../shared/Toast";
import { W, glassPanel } from "../shared/wobl-theme";

export default function ShareButton({ item, size = "default" }) {
  const { showToast } = useToast();
  const isSmall = size === "small";

  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/movies/${item.slug}`
        : "";
    const shareData = {
      title: item.name,
      text: item.short_desc || `Check out ${item.name} on Wobl`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled the share sheet — not an error, do nothing.
        if (err.name !== "AbortError") showToast("Couldn't share right now");
      }
      return;
    }

    // Desktop fallback — copy link.
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied");
    } catch {
      showToast("Couldn't copy link");
    }
  };

  return (
    <motion.button
      onClick={handleShare}
      whileTap={{ scale: 0.9 }}
      aria-label="Share"
      style={{
        ...glassPanel,
        width: isSmall ? 32 : 40,
        height: isSmall ? 32 : 40,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: W.cream,
      }}
    >
      <Share2 size={isSmall ? 15 : 18} strokeWidth={2} />
    </motion.button>
  );
}
