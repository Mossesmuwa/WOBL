// pages/api/track-view.js
// Wobl — increments view_count for a movie on real page visits. Called
// client-side on mount from the detail page, since getStaticProps/ISR
// only re-runs on revalidation (hourly), not per visitor — an API route
// hit from the client is what actually captures real traffic.

import { createClient } from "@supabase/supabase-js";

// Uses the anon client — view_count increments are low-stakes and don't
// need service-role privileges. RLS on the items table should allow
// this specific column update for anon users (a targeted policy, not a
// blanket write-open table).
const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      )
    : null;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!supabase) {
    return res.status(503).json({ error: "Database not configured" });
  }

  const { slug } = req.body || {};
  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "Missing slug" });
  }

  try {
    const { error } = await supabase.rpc("increment_view_count", {
      item_slug: slug,
    });

    if (error) {
      // Fall back to a plain read-then-write if the RPC function doesn't
      // exist yet (see the SQL note below) — less atomic, but functional.
      const { data: item } = await supabase
        .from("items")
        .select("id, view_count")
        .eq("slug", slug)
        .single();

      if (item) {
        await supabase
          .from("items")
          .update({ view_count: (item.view_count || 0) + 1 })
          .eq("id", item.id);
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[track-view] failed:", err.message);
    return res.status(500).json({ error: "Failed to track view" });
  }
}

/*
 * OPTIONAL — for atomic increments (avoids a race condition where two
 * simultaneous visitors both read view_count=5 and both write 6 instead
 * of one reaching 7), run this once in Supabase's SQL editor:
 *
 * create or replace function increment_view_count(item_slug text)
 * returns void as $$
 *   update items set view_count = coalesce(view_count, 0) + 1
 *   where slug = item_slug;
 * $$ language sql;
 *
 * Without this, the fallback read-then-write above still works, just
 * isn't perfectly race-safe under heavy concurrent traffic — a real but
 * minor gap, not worth blocking on at hobby scale.
 */
