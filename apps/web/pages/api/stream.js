// pages/api/stream.js
// Wobl — Stream API Endpoint
// Returns embed URLs for selected streaming provider

import { getProviderUrl } from "shared/lib/streamProviders";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    tmdb_id,
    provider,
    type = "movie",
    season = 1,
    episode = 1,
  } = req.query;

  // Validate required parameters
  if (!tmdb_id || !provider) {
    return res.status(400).json({
      error: "Missing required parameters: tmdb_id, provider",
    });
  }

  try {
    const url = getProviderUrl(
      provider,
      String(tmdb_id),
      type,
      parseInt(season),
      parseInt(episode),
    );

    if (!url) {
      return res.status(400).json({ error: "Invalid provider" });
    }

    return res.status(200).json({
      success: true,
      provider,
      tmdb_id,
      type,
      url,
      season: type === "tv" ? parseInt(season) : null,
      episode: type === "tv" ? parseInt(episode) : null,
    });
  } catch (error) {
    console.error("Stream API error:", error);
    return res.status(500).json({ error: "Failed to generate stream URL" });
  }
}
