const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const CACHE_SECONDS = 60 * 60; // 1 hour

function normalizeTrailer(video) {
  return {
    key: video.key,
    name: video.name || "Trailer",
    type: video.type || "Trailer",
    site: "YouTube",
    published_at: video.published_at || null,
    official: Boolean(video.official),
    size: video.size || null,
    iso_639_1: video.iso_639_1 || null,
    iso_3166_1: video.iso_3166_1 || null,
  };
}

function scoreTrailer(video) {
  let score = 0;

  // YouTube only
  if (video.site === "YouTube") score += 100;

  // Actual trailers are preferred
  if (video.type === "Trailer") score += 50;
  if (video.type === "Teaser") score += 20;

  // Official videos are strongly preferred
  if (video.official) score += 40;

  const name = String(video.name || "").toLowerCase();

  // Prefer higher-quality trailer naming
  if (name.includes("official")) score += 20;
  if (name.includes("final")) score += 10;
  if (name.includes("main")) score += 5;

  // Avoid obvious low-value clips
  if (name.includes("clip")) score -= 30;
  if (name.includes("scene")) score -= 30;
  if (name.includes("featurette")) score -= 15;
  if (name.includes("interview")) score -= 50;
  if (name.includes("behind the scenes")) score -= 50;

  // Prefer English
  if (video.iso_639_1 === "en") score += 10;

  // Prefer recent uploads
  if (video.published_at) {
    const age = Date.now() - new Date(video.published_at).getTime();

    const days = age / (1000 * 60 * 60 * 24);

    if (days >= 0 && days < 365) score += 5;
  }

  // Prefer 1080p+
  if (typeof video.size === "number") {
    if (video.size >= 1080) score += 10;
    else if (video.size >= 720) score += 5;
  }

  return score;
}

function sortTrailers(videos) {
  return [...videos].sort((a, b) => {
    const scoreDifference = scoreTrailer(b) - scoreTrailer(a);

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return (
      new Date(b.published_at || 0).getTime() -
      new Date(a.published_at || 0).getTime()
    );
  });
}

export default async function handler(req, res) {
  // ----------------------------------------------------------
  // Method
  // ----------------------------------------------------------

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);

    return res.status(405).json({
      success: false,
      error: "Method not allowed",
      trailers: [],
    });
  }

  // ----------------------------------------------------------
  // Input
  // ----------------------------------------------------------

  const tmdbId = Array.isArray(req.query.tmdb_id)
    ? req.query.tmdb_id[0]
    : req.query.tmdb_id;

  if (!tmdbId) {
    return res.status(400).json({
      success: false,
      error: "A TMDB movie ID is required.",
      trailers: [],
    });
  }

  // Only allow numeric TMDB IDs.
  if (!/^\d+$/.test(String(tmdbId))) {
    return res.status(400).json({
      success: false,
      error: "Invalid TMDB movie ID.",
      trailers: [],
    });
  }

  // ----------------------------------------------------------
  // Environment
  // ----------------------------------------------------------

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    console.error("[trailers] TMDB_API_KEY is missing.");

    return res.status(500).json({
      success: false,
      error: "Trailer service is temporarily unavailable.",
      trailers: [],
    });
  }

  // ----------------------------------------------------------
  // Cache
  // ----------------------------------------------------------

  res.setHeader(
    "Cache-Control",
    `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=86400`,
  );

  // ----------------------------------------------------------
  // TMDB request
  // ----------------------------------------------------------

  try {
    const endpoint = `${TMDB_BASE_URL}/movie/${encodeURIComponent(tmdbId)}/videos`;

    const url = new URL(endpoint);

    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("language", "en-US");

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      let details = "";

      try {
        details = await response.text();
      } catch {
        // Ignore response parsing failures.
      }

      console.error("[trailers] TMDB request failed:", {
        status: response.status,
        tmdbId,
        details,
      });

      if (response.status === 404) {
        return res.status(200).json({
          success: true,
          trailers: [],
        });
      }

      if (response.status === 401) {
        return res.status(500).json({
          success: false,
          error: "Trailer service configuration error.",
          trailers: [],
        });
      }

      return res.status(502).json({
        success: false,
        error: "Trailer service temporarily unavailable.",
        trailers: [],
      });
    }

    const data = await response.json();

    const videos = Array.isArray(data?.results) ? data.results : [];

    // ----------------------------------------------------------
    // YouTube filtering
    // ----------------------------------------------------------

    const youtubeVideos = videos.filter((video) => {
      if (!video || !video.key) return false;

      if (video.site !== "YouTube") return false;

      return video.type === "Trailer" || video.type === "Teaser";
    });

    // ----------------------------------------------------------
    // Sort intelligently
    // ----------------------------------------------------------

    const sorted = sortTrailers(youtubeVideos);

    // ----------------------------------------------------------
    // Normalize response
    // ----------------------------------------------------------

    const trailers = sorted.map(normalizeTrailer);

    return res.status(200).json({
      success: true,
      trailers,
    });
  } catch (error) {
    console.error("[trailers] Unexpected error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to load trailers right now.",
      trailers: [],
    });
  }
}
