// pages/api/movie-credits.js
// Wobl — Direct TMDB credits endpoint.
// Cast and crew are fetched live and are not stored in the database.

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

function normalizePerson(person) {
  return {
    id: person.id,
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
    return res.status(400).json({
      success: false,
      error: "Invalid TMDB ID.",
      cast: [],
      crew: [],
    });
  }

  // ==========================================================
  // AUTH
  // ==========================================================

  const accessToken = process.env.TMDB_API_READ_ACCESS_TOKEN;

  if (!accessToken) {
    console.error("[movie-credits] TMDB_API_READ_ACCESS_TOKEN is missing.");

    return res.status(500).json({
      success: false,
      error: "Credits service configuration error.",
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

    // --------------------------------------------------------
    // Authentication failure
    // --------------------------------------------------------

    if (response.status === 401) {
      console.error("[movie-credits] TMDB authentication failed.");

      return res.status(500).json({
        success: false,
        error: "Credits service authentication failed.",
        cast: [],
        crew: [],
      });
    }

    // --------------------------------------------------------
    // Movie/show doesn't exist
    // --------------------------------------------------------

    if (response.status === 404) {
      return res.status(200).json({
        success: true,
        media_type: media.mediaType,
        tmdb_id: media.id,
        cast: [],
        crew: [],
      });
    }

    // --------------------------------------------------------
    // Other TMDB errors
    // --------------------------------------------------------

    if (!response.ok) {
      let details = "";

      try {
        details = await response.text();
      } catch {
        // Ignore parsing errors.
      }

      console.error("[movie-credits] TMDB request failed:", {
        status: response.status,
        mediaType: media.mediaType,
        tmdbId: media.id,
        details,
      });

      return res.status(502).json({
        success: false,
        error: "Credits service temporarily unavailable.",
        cast: [],
        crew: [],
      });
    }

    // ========================================================
    // PARSE
    // ========================================================

    const data = await response.json();

    const rawCast = Array.isArray(data?.cast) ? data.cast : [];
    const rawCrew = Array.isArray(data?.crew) ? data.crew : [];

    // ========================================================
    // CAST
    // ========================================================

    const cast = rawCast
      .filter((person) => person?.name)
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
    // Keep the most useful departments/jobs instead of dumping
    // hundreds of TMDB crew records onto the page.
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
    ]);

    const crew = rawCrew
      .filter((person) => person?.name && person?.job)
      .filter((person) => preferredJobs.has(person.job))
      .sort((a, b) => {
        const aPreferred = preferredJobs.has(a.job) ? 1 : 0;
        const bPreferred = preferredJobs.has(b.job) ? 1 : 0;

        return bPreferred - aPreferred;
      })
      .slice(0, 30)
      .map(normalizePerson);

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      media_type: media.mediaType,
      tmdb_id: media.id,
      cast,
      crew,
    });
  } catch (error) {
    console.error("[movie-credits] Unexpected error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to load cast and crew.",
      cast: [],
      crew: [],
    });
  }
}
