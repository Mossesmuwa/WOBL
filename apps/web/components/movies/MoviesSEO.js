// components/movies/MovieSEO.js
// Wobl — Per-movie SEO. Real Open Graph/Twitter tags, canonical URL, and
// Schema.org structured data (what makes Google show a rich result with
// poster/rating instead of a plain link).
//
// FIX: previously used window.location.origin as a prop passed in from
// the page, which is undefined during server rendering — exactly when
// crawlers see the page. Now reads NEXT_PUBLIC_SITE_URL directly, which
// is available both server- and client-side.

import Head from "next/head";

export default function MovieSEO({ item }) {
  if (!item) return null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const title = `${item.name} — Wobl`;
  const description = item.short_desc || `${item.name} on Wobl.`;
  const image = item.backdrop_path || item.image || "";
  const url = siteUrl ? `${siteUrl}/movies/${item.slug}` : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": item.type === "tv" ? "TVSeries" : "Movie",
    name: item.name,
    description,
    ...(image && { image }),
    ...(item.year && { datePublished: String(item.year) }),
    ...(item.director &&
      item.type !== "tv" && {
        director: { "@type": "Person", name: item.director },
      }),
    ...(item.rating != null && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: item.rating,
        bestRating: "10",
        ratingCount: item.rating_count || 1,
      },
    }),
  };

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {url && <link rel="canonical" href={url} />}

      {/* Open Graph */}
      <meta property="og:type" content="video.movie" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:site_name" content="Wobl" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* Schema.org structured data — enables rich search results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </Head>
  );
}
