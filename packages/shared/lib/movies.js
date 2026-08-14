// lib/movies.js
// Wobl — Movies-specific queries. Generic, cross-category queries
// (getByCategory, getTrending, search, favorites, etc.) live in items.js.
// Category-specific logic lives here. Games/Books will each get their own
// equivalent file (games.js, books.js) rather than growing items.js
// indefinitely.

import { supabase } from "./supabase";

// ── Filmography by director name ────────────────────────
// NOTE: there is no person-ID system in the schema — no `people` table,
// no TMDB person ID stored anywhere. This matches on the `director` text
// column (populated by TMDBProvider's credits fetch). Cast-based
// filmography (an actor's filmography) is NOT implemented — cast data is
// stored as an unindexed array inside the `metadata` jsonb column, and
// querying "every item where this person appears in metadata.cast" would
// need either a jsonb containment query or a proper normalized people
// table to do reliably. Flagging this rather than faking it.
export async function getByDirectorName(name, opts = {}) {
  if (!supabase || !name) return [];
  const { limit = 24, excludeSlug = null } = opts;
  try {
    let q = supabase
      .from("items")
      .select("*")
      .eq("approved", true)
      .eq("category_id", "movies")
      .ilike("director", name)
      .not("image", "is", null)
      .order("release_date", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (excludeSlug) q = q.neq("slug", excludeSlug);

    const { data } = await q;
    return data || [];
  } catch (err) {
    console.error("[getByDirectorName] failed:", err.message);
    return [];
  }
}

// ── Filter by genre ──────────────────────────────────────
// Genre is stored as a comma-joined text field of real names (e.g.
// "Action, Adventure") — TMDBProvider now resolves TMDB's raw genre_ids
// via the /genre/movie/list and /genre/tv/list endpoints before storing.
export async function getAllGenres(limit = 500) {
  if (!supabase) return [];
  try {
    const { data } = await supabase
      .from("items")
      .select("genre")
      .eq("category_id", "movies")
      .eq("approved", true)
      .not("genre", "is", null)
      .limit(limit);

    const set = new Set();
    (data || []).forEach((row) => {
      (row.genre || "").split(",").forEach((g) => {
        const trimmed = g.trim();
        if (trimmed) set.add(trimmed);
      });
    });
    return Array.from(set).sort();
  } catch (err) {
    console.error("[getAllGenres] failed:", err.message);
    return [];
  }
}

export async function getByGenre(genreName, opts = {}) {
  if (!supabase || !genreName) return [];
  const { limit = 24 } = opts;
  try {
    const { data } = await supabase
      .from("items")
      .select("*")
      .eq("approved", true)
      .eq("category_id", "movies")
      .ilike("genre", `%${genreName}%`)
      .not("image", "is", null)
      .order("popularity", { ascending: false, nullsFirst: false })
      .limit(limit);
    return data || [];
  } catch (err) {
    console.error("[getByGenre] failed:", err.message);
    return [];
  }
}
