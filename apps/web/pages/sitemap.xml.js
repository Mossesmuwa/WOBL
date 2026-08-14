// pages/sitemap.xml.js
// Wobl — dynamic sitemap. Queries real movie slugs from the DB (not a
// static file) so it stays current as the catalog grows via sync.
// Requires NEXT_PUBLIC_SITE_URL to be set — falls back to a relative
// structure without it, but search engines need an absolute URL to
// actually index correctly.

import { supabase } from "shared/lib/supabase";

const STATIC_PAGES = ["", "/movies", "/about", "/terms", "/privacy"];

function generateSitemap(siteUrl, movieSlugs) {
  const staticUrls = STATIC_PAGES.map(
    (path) => `
  <url>
    <loc>${siteUrl}${path}</loc>
    <changefreq>daily</changefreq>
    <priority>${path === "" ? "1.0" : "0.7"}</priority>
  </url>`,
  ).join("");

  const movieUrls = movieSlugs
    .map(
      (slug) => `
  <url>
    <loc>${siteUrl}/movies/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls}${movieUrls}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  let movieSlugs = [];
  if (supabase) {
    const { data } = await supabase
      .from("items")
      .select("slug")
      .eq("category_id", "movies")
      .eq("approved", true)
      .not("image", "is", null)
      .limit(5000); // sitemap protocol soft limit is 50,000 per file
    movieSlugs = (data || []).map((row) => row.slug);
  }

  const sitemap = generateSitemap(siteUrl, movieSlugs);

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  // This page's content is written directly to the response in
  // getServerSideProps — this component never actually renders.
  return null;
}
