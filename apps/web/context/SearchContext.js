// context/SearchContext.js
// Wobl — Search overlay is a global UI state, not a route. Cmd/Ctrl+K and
// the nav search button both toggle this instead of navigating.

import { createContext, useContext, useState, useCallback } from "react";

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((p) => !p), []);

  return (
    <SearchContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchOverlay() {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearchOverlay must be used within SearchProvider");
  }
  return ctx;
}
