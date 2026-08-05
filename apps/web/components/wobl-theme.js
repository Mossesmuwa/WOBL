// components/wobl-theme.js
// Wobl — shared color/style constants for JS inline-style components.
// Mirrors styles/wobl-tokens.css. Kept separate from shared/lib/design.js,
// which belongs to the rest of the app (ai-tools, VIndex-style pages).

export const W = {
  bg: "#0A0908",
  surface: "rgba(255,255,255,0.05)",
  surfaceBorder: "rgba(255,255,255,0.12)",
  glassBlur: "blur(24px) saturate(1.4)",

  cream: "#F5EFE6",
  creamDim: "#B8AC9C",
  creamFaint: "#8A8078",

  marquee: "#D9713C",
  amber: "#F2A65A",

  displayFont: '"Fraunces", Georgia, serif',
  bodyFont: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
  monoFont: '"JetBrains Mono", monospace',

  radius: "14px",
  radiusSm: "8px",

  ease: "cubic-bezier(0.2, 0.8, 0.2, 1)",
};

// Breakpoints — mobile-first. Use in styled-jsx media queries as
// `@media (min-width: ${bp.tablet})` etc.
export const bp = {
  mobile: "0px",
  tablet: "641px",
  desktop: "1025px",
  wide: "1440px",
};

// Reusable glass panel style — spread into any component needing the
// frosted-glass surface treatment.
export const glassPanel = {
  background: W.surface,
  backdropFilter: W.glassBlur,
  WebkitBackdropFilter: W.glassBlur,
  border: `0.5px solid ${W.surfaceBorder}`,
  boxShadow:
    "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
};
