const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const CACHE_SECONDS = 60 * 60; // 1 hour
const STALE_SECONDS = 60 * 60 * 24; // 24 hours

function getQueryValue(value) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return typeof value === "string" ? value : "";
}

function parseMediaId(rawId) {
  const value = String(rawId || "").trim();

  // TV IDs in WOBL use the format: tv-94997
  if (/^tv-\d+$/i.test(value)) {
    return {
      mediaType: "tv",
      id: value.slice(3),
    };
  }

  // Normal numeric IDs are movies
  if (/^\d+$/.test(value)) {
    return {
      mediaType: "movie",
      id: value,
    };
  }

  return null;
}

function scoreTrailer(video) {
  let score = 0;

  const name = String(video.name || "").toLowerCase();

  // ----------------------------------------------------------
  // Platform
  // ----------------------------------------------------------

  if (video.site === "YouTube") {
    score += 100;
  }

  // ----------------------------------------------------------
  // Video type
  // ----------------------------------------------------------

  if (video.type === "Trailer") {
    score += 60;
  }

  if (video.type === "Teaser") {
    score += 25;
  }

  // ----------------------------------------------------------
  // Official status
  // ----------------------------------------------------------

  if (video.official === true) {
    score += 50;
  }

  // ----------------------------------------------------------
  // Language
  // ----------------------------------------------------------

  if (video.iso_639_1 === "en") {
    score += 15;
  }

  // ----------------------------------------------------------
  // Preferred trailer naming
  // ----------------------------------------------------------

  if (name.includes("official")) {
    score += 25;
  }

  if (name.includes("final")) {
    score += 15;
  }

  if (name.includes("main")) {
    score += 10;
  }

  if (name.includes("season")) {
    score += 5;
  }

  // ----------------------------------------------------------
  // Avoid low-value videos
  // ----------------------------------------------------------

  if (name.includes("clip")) {
    score -= 40;
  }

  if (name.includes("scene")) {
    score -= 40;
  }

  if (name.includes("featurette")) {
    score -= 25;
  }

  if (name.includes("interview")) {
    score -= 60;
  }

  if (name.includes("behind the scenes")) {
    score -= 60;
  }

  if (name.includes("reaction")) {
    score -= 100;
  }

  if (name.includes("review")) {
    score -= 100;
  }

  // ----------------------------------------------------------
  // Video quality
  // ----------------------------------------------------------

  if (typeof video.size === "number") {
    if (video.size >= 2160) {
      score += 20;
    } else if (video.size >= 1080) {
      score += 15;
    } else if (video.size >= 720) {
      score += 8;
    }
  }

  return score;
}

function sortTrailers(videos) {
  return [...videos].sort((a, b) => {
    const scoreDifference = scoreTrailer(b) - scoreTrailer(a);

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    const dateA = new Date(a.published_at || 0).getTime();

    const dateB = new Date(b.published_at || 0).getTime();

    return dateB - dateA;
  });
}

function normalizeTrailer(video) {
  return {
    key: video.key,
    name: video.name || "Trailer",
    type: video.type || "Trailer",
    site: "YouTube",
    published_at: video.published_at || null,
    official: Boolean(video.official),
    size: typeof video.size === "number" ? video.size : null,
    language: video.iso_639_1 || null,
    country: video.iso_3166_1 || null,
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
      trailers: [],
    });
  }

  // ==========================================================
  // INPUT
  // ==========================================================

  const rawTmdbId = getQueryValue(req.query.tmdb_id);
  const slug = getQueryValue(req.query.slug);

  if (!rawTmdbId) {
    return res.status(400).json({
      success: false,
      error: "TMDB ID is required.",
      trailers: [],
    });
  }

  const media = parseMediaId(rawTmdbId);

  if (!media) {
    return res.status(400).json({
      success: false,
      error: "Invalid TMDB ID.",
      trailers: [],
    });
  }

  // ==========================================================
  // AUTHENTICATION
  // ==========================================================

  const accessToken = process.env.TMDB_API_READ_ACCESS_TOKEN;

  if (!accessToken) {
    console.error("[trailers] TMDB_API_READ_ACCESS_TOKEN is missing.");

    return res.status(500).json({
      success: false,
      error: "Trailer service configuration error.",
      trailers: [],
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

  const endpoint = `${TMDB_BASE_URL}/${media.mediaType}/${media.id}/videos`;

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

    // --------------------------------------------------------
    // Authentication failure
    // --------------------------------------------------------

    if (response.status === 401) {
      console.error("[trailers] TMDB authentication failed.");

      return res.status(500).json({
        success: false,
        error: "Trailer service authentication failed.",
        trailers: [],
      });
    }

    // --------------------------------------------------------
    // Movie/show not found
    // --------------------------------------------------------

    if (response.status === 404) {
      return res.status(200).json({
        success: true,
        media_type: media.mediaType,
        tmdb_id: media.id,
        trailers: [],
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
        // Ignore response parsing errors.
      }

      console.error("[trailers] TMDB request failed:", {
        status: response.status,
        mediaType: media.mediaType,
        tmdbId: media.id,
        slug,
        details,
      });

      return res.status(502).json({
        success: false,
        error: "Trailer service temporarily unavailable.",
        trailers: [],
      });
    }

    // ========================================================
    // PARSE TMDB RESPONSE
    // ========================================================

    const data = await response.json();

    const videos = Array.isArray(data?.results) ? data.results : [];

    // ========================================================
    // YOUTUBE ONLY
    // ========================================================

    const youtubeTrailers = videos.filter((video) => {
      if (!video || !video.key) {
        return false;
      }

      if (video.site !== "YouTube") {
        return false;
      }

      return video.type === "Trailer" || video.type === "Teaser";
    });

    // ========================================================
    // PREMIUM TRAILER SELECTION
    // ========================================================

    const sortedTrailers = sortTrailers(youtubeTrailers);

    const trailers = sortedTrailers.map(normalizeTrailer);

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      media_type: media.mediaType,
      tmdb_id: media.id,
      trailers,
    });
  } catch (error) {
    console.error("[trailers] Unexpected error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to load trailers.",
      trailers: [],
    });
  }
}
