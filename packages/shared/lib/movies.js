import { supabase } from "./supabase";

// ── Categories ────────────────────────────────────────
export async function getCategories() {
  if (!supabase) return [];
  try {
    const { data } = await supabase.from("categories").select("*").order("name");
    return data || [];
  } catch {
    return [];
  }
}

// ── Core query builder (internal) ──────────────────────
function applySort(query, sortBy) {
  switch (sortBy) {
    case "rating":
      return query.order("rating", { ascending: false, nullsFirst: false });
    case "popularity":
      return query.order("popularity", { ascending: false, nullsFirst: false });
    case "newest":
      return query.order("release_date", { ascending: false, nullsFirst: false });
    case "name":
      return query.order("name", { ascending: true });
    case "trending":
    default:
      return query
        .order("trending", { ascending: false })
        .order("popularity", { ascending: false, nullsFirst: false })
        .order("save_count", { ascending: false });
  }
}

// ── Items by category (single source of truth) ─────────
export async function getByCategory(catId, opts = {}) {
  if (!supabase) return [];
  const { limit = 24, offset = 0, sortBy = "trending", freeOnly = false } = opts;

  try {
    let q = supabase
      .from("items")
      .select("*")
      .eq("category_id", catId)
      .eq("approved", true)
      .not("image", "is", null);

    if (freeOnly) q = q.ilike("pricing", "%free%");
    q = applySort(q, sortBy);
    q = q.range(offset, offset + limit - 1);

    const { data, error } = await q;
    if (error) console.error("[getByCategory]", error.message);
    return data || [];
  } catch (err) {
    console.error("[getByCategory] failed:", err.message);
    return [];
  }
}

// ── Trending ────────────────────────────────────────────
export async function getTrending(limit = 12, category = null) {
  if (!supabase) return [];
  try {
    let q = supabase
      .from("items")
      .select("*")
      .eq("approved", true)
      .eq("trending", true)
      .not("image", "is", null);

    if (category) q = q.eq("category_id", category);

    q = q
      .order("popularity", { ascending: false, nullsFirst: false })
      .order("save_count", { ascending: false })
      .limit(limit);

    const { data } = await q;

    if (!data || data.length === 0) {
      return getByCategory(category || "movies", { limit, sortBy: "rating" });
    }
    return data;
  } catch (err) {
    console.error("[getTrending] failed:", err.message);
    return [];
  }
}

// ── Featured ────────────────────────────────────────────
export async function getFeatured(limit = 5, category = null) {
  if (!supabase) return [];
  try {
    let q = supabase
      .from("items")
      .select("*")
      .eq("approved", true)
      .eq("featured", true)
      .not("image", "is", null);

    if (category) q = q.eq("category_id", category);

    q = q.order("rating", { ascending: false, nullsFirst: false }).limit(limit);

    const { data } = await q;

    if (!data || data.length === 0) {
      let fallback = supabase
        .from("items")
        .select("*")
        .eq("approved", true)
        .not("image", "is", null)
        .gte("rating_count", 100);
      if (category) fallback = fallback.eq("category_id", category);
      const { data: fbData } = await fallback
        .order("rating", { ascending: false, nullsFirst: false })
        .limit(limit);
      return fbData || [];
    }
    return data;
  } catch (err) {
    console.error("[getFeatured] failed:", err.message);
    return [];
  }
}

// ── Single item by slug ─────────────────────────────────
export async function getBySlug(slug) {
  if (!supabase || !slug) return null;
  try {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("slug", slug)
      .eq("approved", true)
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

// ── Search ──────────────────────────────────────────────
export async function search(query, opts = {}) {
  if (!supabase) return [];
  const { categoryId = null, limit = 24 } = opts;
  if (!query || query.trim().length < 2) return getTrending(limit, categoryId);

  const q = query.trim().toLowerCase();
  try {
    let dbQ = supabase
      .from("items")
      .select("*")
      .eq("approved", true)
      .not("image", "is", null)
      .or(
        `name.ilike.%${q}%,short_desc.ilike.%${q}%,genre.ilike.%${q}%,author.ilike.%${q}%`,
      );

    if (categoryId) dbQ = dbQ.eq("category_id", categoryId);

    dbQ = dbQ
      .order("popularity", { ascending: false, nullsFirst: false })
      .order("save_count", { ascending: false })
      .limit(limit);

    const { data } = await dbQ;
    return data || [];
  } catch (err) {
    console.error("[search] failed:", err.message);
    return [];
  }
}

// ── Related items ───────────────────────────────────────
export async function getRelated(item, limit = 4) {
  if (!supabase || !item) return [];
  try {
    const { data } = await supabase
      .from("items")
      .select("*")
      .eq("category_id", item.category_id)
      .eq("approved", true)
      .not("image", "is", null)
      .neq("id", item.id)
      .order("popularity", { ascending: false, nullsFirst: false })
      .limit(limit);
    return data || [];
  } catch {
    return [];
  }
}

// ── Newest ──────────────────────────────────────────────
export async function getNewest(limit = 12, category = null) {
  if (!supabase) return [];
  try {
    let q = supabase
      .from("items")
      .select("*")
      .eq("approved", true)
      .not("image", "is", null);
    if (category) q = q.eq("category_id", category);
    q = q.order("release_date", { ascending: false, nullsFirst: false }).limit(limit);
    const { data } = await q;
    return data || [];
  } catch {
    return [];
  }
}

// ── Recommendations (requires logged-in user) ───────────
export async function getRecommendations(limit = 6) {
  if (!supabase) return [];
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return getTrending(limit);

    const { data: favs } = await supabase
      .from("favorites")
      .select("item_id, items(category_id)")
      .eq("user_id", user.id)
      .limit(20);

    if (!favs || !favs.length) return getTrending(limit);

    const counts = {};
    favs.forEach((f) => {
      const cat = f.items?.category_id;
      if (cat) counts[cat] = (counts[cat] || 0) + 1;
    });

    const topCat = Object.keys(counts).reduce(
      (a, b) => (counts[a] > counts[b] ? a : b),
      Object.keys(counts)[0],
    );

    const excludeIds = favs.map((f) => f.item_id).filter(Boolean);

    const { data } = await supabase
      .from("items")
      .select("*")
      .eq("approved", true)
      .eq("category_id", topCat)
      .not("image", "is", null)
      .order("popularity", { ascending: false, nullsFirst: false })
      .limit(limit + excludeIds.length);

    const result = (data || [])
      .filter((i) => !excludeIds.includes(i.id))
      .slice(0, limit);

    return result.length ? result : getTrending(limit);
  } catch (err) {
    console.error("[getRecommendations] failed:", err.message);
    return getTrending(limit);
  }
}

// ── Favorites ────────────────────────────────────────────
export async function getFavorites(userId, opts = {}) {
  if (!supabase || !userId) return [];
  const { limit = 48 } = opts;
  try {
    const { data, error } = await supabase
      .from("favorites")
      .select("item_id, created_at, items(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      console.error("[getFavorites]", error.message);
      return [];
    }
    return (data || []).map((f) => f.items).filter(Boolean);
  } catch (err) {
    console.error("[getFavorites] failed:", err.message);
    return [];
  }
}

export async function addFavorite(userId, itemId) {
  if (!supabase || !userId || !itemId) return { success: false };
  try {
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: userId, item_id: itemId });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function removeFavorite(userId, itemId) {
  if (!supabase || !userId || !itemId) return { success: false };
  try {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("item_id", itemId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── Generic getter (kept as thin wrapper, not duplicate logic) ──
export async function getItems(opts = {}) {
  const { category, limit = 12, orderBy = "trending" } = opts;
  return getByCategory(category, { limit, sortBy: orderBy });
}

// ── Compatibility aliases ───────────────────────────────
export { getBySlug as getItemBySlug };
export { search as searchItems };