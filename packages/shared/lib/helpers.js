// lib/helpers.js
// Wobl — shared utility functions.

/**
 * Returns the first defined, non-empty environment variable from a list
 * of candidate names. Used by providers that may have their credential
 * under one of a few possible env var names (e.g. TMDB_BEARER_TOKEN or
 * TMDB_API_KEY, depending on which auth method was configured).
 */
export function getEnvCredential(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim().length > 0) return value;
  }
  return null;
}
