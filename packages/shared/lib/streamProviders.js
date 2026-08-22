// lib/streamProviders.js
// Wobl — Stream Provider URL Builders
// Supports: CineSrc, VIDEASY, 111movies, vidsrc.sbs

export const STREAM_PROVIDERS = [
  {
    id: "cinesrc",
    name: "CineSrc",
    buildUrl: (tmdbId, type, season, episode) => {
      if (type === "tv") {
        return `https://cinesrc.st/embed/tv/${tmdbId}?s=${season}&e=${episode}`;
      }
      return `https://cinesrc.st/embed/movie/${tmdbId}`;
    },
    features: ["Auto-play", "Quality Select", "Skip Intro"],
  },
  {
    id: "videasy",
    name: "VIDEASY",
    buildUrl: (tmdbId, type, season, episode) => {
      if (type === "tv") {
        return `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://player.videasy.net/movie/${tmdbId}`;
    },
    features: ["Progress Tracking", "Episode Selector"],
  },
  {
    id: "111movies",
    name: "111movies",
    buildUrl: (tmdbId, type, season, episode) => {
      if (type === "tv") {
        return `https://111movies.net/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://111movies.net/movie/${tmdbId}`;
    },
    features: ["Direct Stream", "Multi-source"],
  },
  {
    id: "vidsrc",
    name: "VidSrc",
    buildUrl: (tmdbId, type, season, episode) => {
      if (type === "tv") {
        return `https://vidsrc.sbs/embed/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidsrc.sbs/embed/movie/${tmdbId}`;
    },
    features: ["Reliable", "Fallback"],
  },
];

export function getProviderUrl(
  providerId,
  tmdbId,
  type = "movie",
  season = 1,
  episode = 1,
) {
  const provider = STREAM_PROVIDERS.find((p) => p.id === providerId);
  if (!provider) return null;
  return provider.buildUrl(tmdbId, type, season, episode);
}

export function getAllProviders() {
  return STREAM_PROVIDERS;
}
