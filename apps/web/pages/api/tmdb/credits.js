// pages/api/tmdb/credits.js
// WOBL — Direct TMDB Credits API
//
// This endpoint fetches cast + crew directly from TMDB.
// The TMDB access token NEVER reaches the browser.
//
// IMPORTANT:
// Credits are optional. Any TMDB failure returns a safe response
// and must never break the movie page.

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const CACHE_SECONDS = 60 * 60; // 1 hour
const STALE_SECONDS = 60 * 60 * 24; // 24 hours

function getQueryValue(value) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return typeof value === "string" ? value : "";
}

/**
 * WOBL source IDs:
 *
 * Movie:
 *   27205
 *
 * TV:
 *   tv-94997
 */
function parseMediaId(rawId) {
  const value = String(rawId || "").trim();

  if (/^tv-\d+$/i.test(value)) {
    return {
      mediaType: "tv",
      id: value.slice(3),
    };
  }

  if (/^\d+$/.test(value)) {
    return {
      mediaType: "movie",
      id: value,
    };
  }

  return null;
}

function normalizeCast(cast) {
  if (!Array.isArray(cast)) {
    return [];
  }

  return cast
    .filter((person) => person && person.id && person.name)
    .slice(0, 20)
    .map((person) => ({
      id: person.id,
      name: person.name,
      character: person.character || "",
      order: typeof person.order === "number" ? person.order : null,
      profile_path: person.profile_path
        ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
        : null,
    }));
}

function normalizeCrew(crew) {
  if (!Array.isArray(crew)) {
    return [];
  }

  /*
   * We don't dump every TMDB crew member into the page.
   * Keep the useful movie/series credits.
   */
  const usefulJobs = new Set([
    "Director",
    "Series Director",
    "Executive Producer",
    "Producer",
    "Writer",
    "Screenplay",
    "Story",
    "Creator",
    "Original Music Composer",
    "Music Supervisor",
    "Director of Photography",
    "Cinematography",
    "Editor",
    "Production Designer",
    "Costume Design",
  ]);

  const filtered = crew.filter(
    (person) =>
      person && person.id && person.name && usefulJobs.has(person.job),
  );

  /*
   * Prevent duplicate people/job combinations.
   */
  const seen = new Set();

  return filtered
    .filter((person) => {
      const key = `${person.id}:${person.job}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, 40)
    .map((person) => ({
      id: person.id,
      name: person.name,
      department: person.department || "",
      job: person.job || "",
      profile_path: person.profile_path
        ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
        : null,
    }));
}

export default async function handler(req, res) {
  // ==========================================================
  // METHOD
  // ==========================================================

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

    return res.status(405).json({
      success: false,
      cast: [],
      crew: [],
    });
  }

  // ==========================================================
  // INPUT
  // ==========================================================

  const rawTmdbId = getQueryValue(req.query.tmdb_id);

  if (!rawTmdbId) {
    return res.status(200).json({
      success: false,
      cast: [],
      crew: [],
    });
  }

  const media = parseMediaId(rawTmdbId);

  /*
   * Invalid credits data is NOT a movie-page error.
   * Return safely.
   */
  if (!media) {
    return res.status(200).json({
      success: false,
      cast: [],
      crew: [],
    });
  }

  // ==========================================================
  // AUTH
  // ==========================================================

  const accessToken =
    process.env.TMDB_API_READ_ACCESS_TOKEN || process.env.TMDB_BEARER_TOKEN;

  /*
   * Never expose the credential.
   *
   * If the environment variable is missing, simply return
   * empty credits. The movie page can still render.
   */
  if (!accessToken) {
    console.error("[TMDB Credits] TMDB access token is missing.");

    return res.status(200).json({
      success: false,
      cast: [],
      crew: [],
    });
  }

  // ==========================================================
  // CACHE
  // ==========================================================

  res.setHeader(
    "Cache-Control",
    `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${STALE_SECONDS}`,
  );

  // ==========================================================
  // TMDB REQUEST
  // ==========================================================

  const endpoint = `${TMDB_BASE_URL}/${media.mediaType}/${media.id}/credits`;

  const url = new URL(endpoint);

  url.searchParams.set("language", "en-US");

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // ========================================================
    // ANY TMDB FAILURE IS NON-FATAL
    // ========================================================

    if (!response.ok) {
      let details = "";

      try {
        details = await response.text();
      } catch {
        // Ignore parsing failure.
      }

      console.warn("[TMDB Credits] Request failed:", {
        status: response.status,
        mediaType: media.mediaType,
        tmdbId: media.id,
        details,
      });

      return res.status(200).json({
        success: false,
        media_type: media.mediaType,
        tmdb_id: media.id,
        cast: [],
        crew: [],
      });
    }

    // ========================================================
    // PARSE
    // ========================================================

    let data;

    try {
      data = await response.json();
    } catch (error) {
      console.warn("[TMDB Credits] Invalid JSON response:", error.message);

      return res.status(200).json({
        success: false,
        media_type: media.mediaType,
        tmdb_id: media.id,
        cast: [],
        crew: [],
      });
    }

    // ========================================================
    // NORMALIZE
    // ========================================================

    const cast = normalizeCast(data?.cast);
    const crew = normalizeCrew(data?.crew);

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(200).json({
      success: true,
      media_type: media.mediaType,
      tmdb_id: media.id,
      cast,
      crew,
    });
  } catch (error) {
    /*
     * Network error, timeout, DNS failure, etc.
     *
     * DO NOT allow this to break the movie page.
     */
    console.warn(
      "[TMDB Credits] Network/request error:",
      error?.message || error,
    );

    return res.status(200).json({
      success: false,
      media_type: media.mediaType,
      tmdb_id: media.id,
      cast: [],
      crew: [],
    });
  }
}
