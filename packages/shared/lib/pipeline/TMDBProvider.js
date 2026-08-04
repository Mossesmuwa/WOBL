// lib/pipeline/TMDBProvider.js
// Wobl — Movie & TV Content Pipeline
// Fetches movies + TV from multiple TMDB endpoints with pagination,
// retry logic, and real trending/featured classification.

import slugify from "slugify";
import { BaseProvider } from "../pipeline/BaseProvider.js";
import { getEnvCredential } from "../helpers.js";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

const RETRY_ATTEMPTS = 2;
const RETRY_DELAY_MS = 500;

// Endpoints tagged with their real signal meaning —
// this replaces the old hardcoded `trending: false`
const MOVIE_ENDPOINTS = [
  { path: "/trending/movie/week", signal: "trending" },
  { path: "/trending/movie/day", signal: "trending" },
  { path: "/movie/now_playing", signal: "new" },
  { path: "/movie/popular", signal: "popular" },
  { path: "/movie/top_rated", signal: "top_rated" },
  { path: "/movie/upcoming", signal: "upcoming" },
];

const TV_ENDPOINTS = [
  { path: "/trending/tv/week", signal: "trending" },
  { path: "/trending/tv/day", signal: "trending" },
  { path: "/tv/popular", signal: "popular" },
  { path: "/tv/top_rated", signal: "top_rated" },
  { path: "/tv/on_the_air", signal: "new" },
  { path: "/tv/airing_today", signal: "new" },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class TMDBProvider extends BaseProvider {
  /**
   * @param {Object} [options]
   * @param {number} [options.pages=3] — pages per endpoint (20 items/page)
   */
  constructor(options = {}) {
    super("TMDB");
    this.pages = options.pages || 3;
  }

  _isBearer(token) {
    return token.startsWith("eyJ") || token.length > 40;
  }

  _getHeaders(token) {
    return this._isBearer(token) ? { Authorization: `Bearer ${token}` } : {};
  }

  _buildUrl(path, token, page = 1) {
    const base = `${TMDB_BASE}${path}?language=en-US&page=${page}`;
    return this._isBearer(token)
      ? base
      : `${base}&api_key=${encodeURIComponent(token)}`;
  }

  async _fetchPage(path, token, page, attempt = 0) {
    try {
      const res = await fetch(this._buildUrl(path, token, page), {
        headers: this._getHeaders(token),
      });

      if (res.status === 429 && attempt < RETRY_ATTEMPTS) {
        // Rate limited — back off and retry
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        return this._fetchPage(path, token, page, attempt + 1);
      }

      if (!res.ok) {
        console.warn(`[TMDB] ${path} p${page} -> ${res.status}`);
        return [];
      }

      const data = await res.json();
      return data.results || [];
    } catch (err) {
      if (attempt < RETRY_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        return this._fetchPage(path, token, page, attempt + 1);
      }
      console.warn(`[TMDB] ${path} p${page} failed:`, err.message);
      return [];
    }
  }

  async _fetchEndpoint(path, token) {
    const all = [];
    for (let page = 1; page <= this.pages; page++) {
      const results = await this._fetchPage(path, token, page);
      all.push(...results);
      if (results.length < 20) break; // reached last page
    }
    return all;
  }

  /**
   * Fetch from all movie and TV endpoints.
   * Returns { movies: [...], tv: [...] } where each raw item
   * is tagged with which endpoint(s) it came from (_signals).
   */
  async fetch() {
    const token = getEnvCredential(
      "TMDB_BEARER_TOKEN",
      "TMDB_API_KEY",
      "TMDB_ACCESS_TOKEN",
    );
    if (!token) {
      throw new Error(
        "TMDB API credential not set (TMDB_BEARER_TOKEN or TMDB_API_KEY).",
      );
    }

    const movieMap = new Map(); // id -> { item, signals: Set }
    const tvMap = new Map();

    for (const { path, signal } of MOVIE_ENDPOINTS) {
      const results = await this._fetchEndpoint(path, token);
      for (const item of results) {
        if (!item.id) continue;
        if (!movieMap.has(item.id)) {
          movieMap.set(item.id, { item, signals: new Set() });
        }
        movieMap.get(item.id).signals.add(signal);
      }
    }

    for (const { path, signal } of TV_ENDPOINTS) {
      const results = await this._fetchEndpoint(path, token);
      for (const item of results) {
        if (!item.id) continue;
        if (!tvMap.has(item.id)) {
          tvMap.set(item.id, { item, signals: new Set() });
        }
        tvMap.get(item.id).signals.add(signal);
      }
    }

    console.log(
      `[TMDB] Raw fetched — movies: ${movieMap.size}, tv: ${tvMap.size}`,
    );

    return {
      movies: Array.from(movieMap.values()),
      tv: Array.from(tvMap.values()),
    };
  }

  /**
   * Decide trending/featured flags from the real signals
   * an item was found under, instead of hardcoding false.
   */
  _classify(signals, voteAverage, voteCount) {
    const isTrending = signals.has("trending");
    const isFeatured = (voteAverage || 0) >= 7.5 && (voteCount || 0) >= 500;
    return { trending: isTrending, featured: isFeatured };
  }

  transform({ movies = [], tv = [] }) {
    const items = [];

    for (const { item: m, signals } of movies) {
      const name = m.title || m.original_title || "Untitled";
      const slug = slugify(`${name} ${m.id}`, { lower: true, strict: true });
      const { trending, featured } = this._classify(
        signals,
        m.vote_average,
        m.vote_count,
      );

      items.push({
        slug,
        name,
        short_desc: (m.overview || "").slice(0, 200),
        long_desc: m.overview || "",
        category_id: "movies",
        type: "movie",
        image: m.poster_path ? `${TMDB_IMG}${m.poster_path}` : null,
        backdrop_path: m.backdrop_path ? `${TMDB_IMG}${m.backdrop_path}` : null,
        year: m.release_date ? parseInt(m.release_date.slice(0, 4), 10) : null,
        release_date: m.release_date || null,
        rating: m.vote_average ? parseFloat(m.vote_average.toFixed(1)) : null,
        vote_average: m.vote_average || null,
        rating_count: m.vote_count || 0,
        popularity: m.popularity || null,
        genre: (m.genre_ids || []).join(", "),
        tags: ["tmdb", "movie", ...Array.from(signals)],
        vibe_tags: [],
        source_url: `https://www.themoviedb.org/movie/${m.id}`,
        source_id: String(m.id),
        source_name: "tmdb",
        trending,
        featured,
        approved: true,
      });
    }

    for (const { item: t, signals } of tv) {
      const name = t.name || t.original_name || "Untitled";
      const slug = slugify(`${name} tv ${t.id}`, {
        lower: true,
        strict: true,
      });
      const { trending, featured } = this._classify(
        signals,
        t.vote_average,
        t.vote_count,
      );

      items.push({
        slug,
        name,
        short_desc: (t.overview || "").slice(0, 200),
        long_desc: t.overview || "",
        category_id: "movies",
        type: "tv",
        image: t.poster_path ? `${TMDB_IMG}${t.poster_path}` : null,
        backdrop_path: t.backdrop_path ? `${TMDB_IMG}${t.backdrop_path}` : null,
        year: t.first_air_date
          ? parseInt(t.first_air_date.slice(0, 4), 10)
          : null,
        release_date: t.first_air_date || null,
        rating: t.vote_average ? parseFloat(t.vote_average.toFixed(1)) : null,
        vote_average: t.vote_average || null,
        rating_count: t.vote_count || 0,
        popularity: t.popularity || null,
        tags: ["tmdb", "tv-show", ...Array.from(signals)],
        vibe_tags: [],
        source_url: `https://www.themoviedb.org/tv/${t.id}`,
        source_id: `tv-${t.id}`,
        source_name: "tmdb",
        trending,
        featured,
        approved: true,
      });
    }

    console.log(`[TMDB] Transformed: ${items.length} total items`);
    return items;
  }
}
