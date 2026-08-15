// components/shared/Reveal.js
// Wobl — scroll-reveal wrapper. Sections fade + rise into view once,
// giving the page motion beyond a static scroll. Respects
// prefers-reduced-motion globally via wobl-tokens.css's animation
// override — no per-component check needed.

import { motion } from "motion/react";

export default function Reveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
