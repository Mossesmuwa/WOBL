const TMDB_BASE_URL = "https://api.themoviedb.org/3";

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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

    return res.status(405).json({
      success: false,
      error: "Method not allowed.",
    });
  }

  const rawId = Array.isArray(req.query.tmdb_id)
    ? req.query.tmdb_id[0]
    : req.query.tmdb_id;

  const media = parseMediaId(rawId);

  if (!media) {
    return res.status(400).json({
      success: false,
      error: "Invalid TMDB ID.",
    });
  }

  const token = process.env.TMDB_API_READ_ACCESS_TOKEN;

  if (!token) {
    console.error("[credits] TMDB_API_READ_ACCESS_TOKEN is missing.");

    return res.status(500).json({
      success: false,
      error: "Credits service is not configured.",
    });
  }

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400",
  );

  const endpoint = `${TMDB_BASE_URL}/${media.mediaType}/${media.id}/credits`;

  const url = new URL(endpoint);

  url.searchParams.set("language", "en-US");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      return res.status(200).json({
        success: true,
        media_type: media.mediaType,
        tmdb_id: media.id,
        cast: [],
        crew: [],
        director: null,
      });
    }

    if (!response.ok) {
      const details = await response.text().catch(() => "");

      console.error("[credits] TMDB request failed:", {
        status: response.status,
        mediaType: media.mediaType,
        tmdbId: media.id,
        details,
      });

      return res.status(502).json({
        success: false,
        error: "Unable to load cast and crew.",
      });
    }

    const data = await response.json();

    const cast = Array.isArray(data?.cast)
      ? data.cast
          .filter((person) => person?.name)
          .slice(0, 12)
          .map((person) => ({
            id: person.id,
            name: person.name,
            character: person.character || null,
            profile_path: person.profile_path || null,
          }))
      : [];

    const crew = Array.isArray(data?.crew)
      ? data.crew
          .filter((person) => person?.name)
          .map((person) => ({
            id: person.id,
            name: person.name,
            job: person.job || null,
            department: person.department || null,
            profile_path: person.profile_path || null,
          }))
      : [];

    const director =
      crew.find((person) => person.job === "Director") ||
      crew.find((person) => person.job === "Series Director") ||
      null;

    return res.status(200).json({
      success: true,
      media_type: media.mediaType,
      tmdb_id: media.id,
      cast,
      crew,
      director: director?.name || null,
    });
  } catch (error) {
    console.error("[credits] Unexpected error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to load cast and crew.",
    });
  }
}
