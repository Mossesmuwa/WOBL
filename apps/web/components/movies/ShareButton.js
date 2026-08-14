// components/movies/ShareButton.js
// Wobl — Share action. Uses the native Web Share API where available
// (mobile mostly), falls back to copy-link + toast on desktop. Per spec:
// direct action button, not hidden behind a menu.

import { motion } from "motion/react";
import { useToast } from "../shared/Toast";
import { W, glassPanel } from "../shared/wobl-theme";

function ShareIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

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
      <ShareIcon size={isSmall ? 14 : 18} />
    </motion.button>
  );
}
