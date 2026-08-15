// pages/api/movie-credits.js
// Wobl — Direct TMDB Cast & Crew API
//
// Fetches credits directly from TMDB.
// Nothing is required to be stored in the Wobl database.
//
// Supported IDs:
//   Movie: 27205
//   TV:    tv-94997

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w185";

const CACHE_SECONDS = 60 * 60;
const STALE_SECONDS = 60 * 60 * 24;

function getQueryValue(value) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return typeof value === "string" ? value : "";
}

function parseMediaId(rawId) {
  const value = String(rawId || "").trim();

  // ----------------------------------------------------------
  // TV
  // Example: tv-94997
  // ----------------------------------------------------------

  if (/^tv-\d+$/i.test(value)) {
    return {
      mediaType: "tv",
      id: value.slice(3),
    };
  }

  // ----------------------------------------------------------
  // Movie
  // Example: 27205
  // ----------------------------------------------------------

  if (/^\d+$/.test(value)) {
    return {
      mediaType: "movie",
      id: value,
    };
  }

  return null;
}

function normalizePerson(person) {
  return {
    id: person.id || null,

    credit_id: person.credit_id || null,

    name: person.name || "Unknown",

    character: person.character || null,

    job: person.job || null,

    department: person.department || null,

    profile_path: person.profile_path
      ? `${TMDB_IMAGE_URL}${person.profile_path}`
      : null,

    order: typeof person.order === "number" ? person.order : null,
  };
}

function buildHeaders(accessToken) {
  const headers = {
    Accept: "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

export default async function handler(req, res) {
  // ==========================================================
  // METHOD
  // ==========================================================

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

    return res.status(405).json({
      success: false,
      error: "Method not allowed.",
      cast: [],
      crew: [],
    });
  }

  // ==========================================================
  // INPUT
  // ==========================================================

  const rawTmdbId = getQueryValue(req.query.tmdb_id);

  if (!rawTmdbId) {
    return res.status(400).json({
      success: false,
      error: "TMDB ID is required.",
      cast: [],
      crew: [],
    });
  }

  const media = parseMediaId(rawTmdbId);

  if (!media) {
    console.error("[movie-credits] Invalid TMDB ID:", rawTmdbId);

    return res.status(400).json({
      success: false,
      error: "Invalid TMDB ID.",
      tmdb_id: rawTmdbId,
      cast: [],
      crew: [],
    });
  }

  console.log("[movie-credits] Request:", {
    rawTmdbId,
    mediaType: media.mediaType,
    id: media.id,
  });

  // ==========================================================
  // AUTHENTICATION
  // ==========================================================

  const accessToken = process.env.TMDB_API_READ_ACCESS_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;

  if (!accessToken && !apiKey) {
    console.error("[movie-credits] No TMDB authentication configured.");

    return res.status(500).json({
      success: false,
      error: "TMDB authentication is not configured.",
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
  // BUILD TMDB URL
  // ==========================================================

  const endpoint = `${TMDB_BASE_URL}/${media.mediaType}/${media.id}/credits`;

  const url = new URL(endpoint);

  url.searchParams.set("language", "en-US");

  // If Bearer token exists, use it.
  // Otherwise fall back to API key.

  if (!accessToken && apiKey) {
    url.searchParams.set("api_key", apiKey);
  }

  const headers = buildHeaders(accessToken);

  console.log("[movie-credits] TMDB request:", {
    endpoint,
    mediaType: media.mediaType,
    id: media.id,
    authentication: accessToken ? "Bearer token" : "API key",
  });

  // ==========================================================
  // REQUEST TMDB
  // ==========================================================

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    // ========================================================
    // AUTHENTICATION ERROR
    // ========================================================

    if (response.status === 401) {
      console.error("[movie-credits] TMDB authentication failed.");

      return res.status(500).json({
        success: false,
        error: "TMDB authentication failed.",
        cast: [],
        crew: [],
      });
    }

    // ========================================================
    // FORBIDDEN
    // ========================================================

    if (response.status === 403) {
      console.error("[movie-credits] TMDB rejected the request.");

      return res.status(502).json({
        success: false,
        error: "TMDB rejected the credits request.",
        cast: [],
        crew: [],
      });
    }

    // ========================================================
    // NOT FOUND
    // ========================================================

    if (response.status === 404) {
      console.warn(
        "[movie-credits] TMDB title not found:",
        media.mediaType,
        media.id,
      );

      return res.status(200).json({
        success: true,
        media_type: media.mediaType,
        tmdb_id: media.id,
        cast: [],
        crew: [],
      });
    }

    // ========================================================
    // RATE LIMIT
    // ========================================================

    if (response.status === 429) {
      console.warn("[movie-credits] TMDB rate limit reached.");

      return res.status(503).json({
        success: false,
        error: "TMDB is temporarily rate limiting requests.",
        cast: [],
        crew: [],
      });
    }

    // ========================================================
    // OTHER TMDB ERRORS
    // ========================================================

    if (!response.ok) {
      let details = "";

      try {
        details = await response.text();
      } catch {
        // Ignore response parsing errors.
      }

      console.error("[movie-credits] TMDB request failed:", {
        status: response.status,
        mediaType: media.mediaType,
        tmdbId: media.id,
        details,
      });

      return res.status(502).json({
        success: false,
        error: "TMDB credits service is temporarily unavailable.",
        cast: [],
        crew: [],
      });
    }

    // ========================================================
    // PARSE RESPONSE
    // ========================================================

    const data = await response.json();

    const rawCast = Array.isArray(data?.cast) ? data.cast : [];

    const rawCrew = Array.isArray(data?.crew) ? data.crew : [];

    // ========================================================
    // CAST
    // ========================================================

    const cast = rawCast
      .filter((person) => person && person.name)
      .sort((a, b) => {
        const orderA =
          typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER;

        const orderB =
          typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER;

        return orderA - orderB;
      })
      .slice(0, 20)
      .map(normalizePerson);

    // ========================================================
    // CREW
    //
    // We don't want to dump hundreds of crew members onto
    // the page. These are the most useful roles for users.
    // ========================================================

    const preferredJobs = new Set([
      "Director",
      "Series Director",

      "Executive Producer",
      "Producer",

      "Writer",
      "Screenplay",
      "Story",

      "Director of Photography",

      "Original Music Composer",

      "Editor",

      "Production Designer",

      "Costume Design",

      "Casting",
    ]);

    const crew = rawCrew
      .filter((person) => person && person.name && person.job)
      .filter((person) => preferredJobs.has(person.job))
      .map(normalizePerson);

    // ========================================================
    // REMOVE DUPLICATE CREW RECORDS
    // ========================================================

    const uniqueCrew = [];

    const crewKeys = new Set();

    for (const person of crew) {
      const key = `${person.name}-${person.job}`;

      if (crewKeys.has(key)) {
        continue;
      }

      crewKeys.add(key);
      uniqueCrew.push(person);
    }

    // ========================================================
    // FINAL RESPONSE
    // ========================================================

    console.log("[movie-credits] Success:", {
      mediaType: media.mediaType,
      tmdbId: media.id,
      cast: cast.length,
      crew: uniqueCrew.length,
    });

    return res.status(200).json({
      success: true,

      media_type: media.mediaType,

      tmdb_id: media.id,

      cast,

      crew: uniqueCrew.slice(0, 30),
    });
  } catch (error) {
    // ========================================================
    // NETWORK / UNEXPECTED ERROR
    // ========================================================

    console.error("[movie-credits] Unexpected error:", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Unable to load cast and crew.",
      cast: [],
      crew: [],
    });
  }
}
