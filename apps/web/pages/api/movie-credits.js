const TMDB_BASE_URL = "https://api.themoviedb.org/3";

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

function normalizeCast(cast) {
  return cast.slice(0, 12).map((person) => ({
    id: person.id,
    name: person.name || "Unknown",
    character: person.character || null,
    profile_path: person.profile_path
      ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
      : null,
    order: typeof person.order === "number" ? person.order : null,
  }));
}

function normalizeCrew(crew) {
  const preferredJobs = [
    "Director",
    "Writer",
    "Screenplay",
    "Story",
    "Producer",
    "Executive Producer",
    "Director of Photography",
    "Original Music Composer",
    "Editor",
  ];

  const seen = new Set();

  return crew
    .filter((person) => {
      if (!person?.id || !person?.name || !person?.job) {
        return false;
      }

      if (!preferredJobs.includes(person.job)) {
        return false;
      }

      const key = `${person.id}-${person.job}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, 18)
    .map((person) => ({
      id: person.id,
      name: person.name,
      job: person.job,
      department: person.department || null,
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
  // AUTHENTICATION
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
  // TMDB ENDPOINT
  // ==========================================================

  const endpoint = `${TMDB_BASE_URL}/${media.mediaType}/${media.id}/credits`;

  const url = new URL(endpoint);

  url.searchParams.set("language", "en-US");

  // ==========================================================
  // REQUEST TMDB
  // ==========================================================

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      console.error("[movie-credits] TMDB authentication failed.");

      return res.status(500).json({
        success: false,
        error: "Credits service authentication failed.",
        cast: [],
        crew: [],
      });
    }

    if (response.status === 404) {
      return res.status(200).json({
        success: true,
        media_type: media.mediaType,
        tmdb_id: media.id,
        cast: [],
        crew: [],
      });
    }

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

    const cast = Array.isArray(data?.cast) ? data.cast : [];
    const crew = Array.isArray(data?.crew) ? data.crew : [];

    // ========================================================
    // NORMALIZE
    // ========================================================

    return res.status(200).json({
      success: true,
      media_type: media.mediaType,
      tmdb_id: media.id,
      cast: normalizeCast(cast),
      crew: normalizeCrew(crew),
    });
  } catch (error) {
    console.error("[movie-credits] Unexpected error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to load credits.",
      cast: [],
      crew: [],
    });
  }
}
