// pages/movies/index.js
// Wobl — Movies landing. Decide, don't just browse. Order per the master
// plan: Hero -> Pick-for-Me -> This Week -> Because You're Into X
// (conditional, signal-based) -> Fresh Prints -> Explore Deeper.

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { getTrending, getByCategory } from "shared/lib/items";
import { getAllGenres, getByGenre } from "shared/lib/movies";
import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import Reveal from "../../components/shared/Reveal";
import MovieCard from "../../components/movies/MovieCard";
import MovieCardSkeleton from "../../components/movies/MovieCardSkeleton";
import TrailerPlayer from "../../components/movies/TrailerPlayer";
import PickForMe from "../../components/movies/PickForMe";
import { W } from "../../components/shared/wobl-theme";

export async function getStaticProps() {
  const [hero, thisWeek, freshPrints, genres] = await Promise.all([
    getTrending(1, "movies"),
    getTrending(6, "movies"),
    getByCategory("movies", { limit: 12, sortBy: "newest" }),
    getAllGenres(),
  ]);

  return {
    props: {
      hero: hero[0] || null,
      thisWeek,
      freshPrints,
      genres,
    },
    revalidate: 3600,
  };
}

export default function MoviesLanding({ hero, thisWeek, freshPrints, genres }) {
  const [signalGenre, setSignalGenre] = useState(null);
  const [signalItems, setSignalItems] = useState([]);
  const [signalLoading, setSignalLoading] = useState(true);

  // Reads the lightweight session signal PickForMe writes — no login
  // required. Section simply doesn't render without real signal.
  useEffect(() => {
    let genre = null;
    try {
      genre = localStorage.getItem("wobl_genre_signal");
    } catch {}
    if (!genre) {
      setSignalLoading(false);
      return;
    }
    setSignalGenre(genre);
    getByGenre(genre, { limit: 6 }).then((items) => {
      setSignalItems(items);
      setSignalLoading(false);
    });
  }, []);

  return (
    <>
      <Head>
        <title>Movies — Wobl</title>
        <meta
          name="description"
          content="Real ratings, real momentum — and one confident pick when you can't decide."
        />
      </Head>

      <Navbar />

      <main style={{ background: W.bg, minHeight: "100vh" }}>
        {hero && (
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              padding: "1.5rem 2rem 0",
            }}
          >
            <TrailerPlayer
              tmdbId={hero.source_id}
              slug={hero.slug}
              itemName={hero.name}
              trailers={hero.trailer_url ? [hero.trailer_url] : []}
              backdropUrl={hero.backdrop_path || hero.image}
            />
            <div style={{ marginTop: "0.75rem" }}>
              <span
                style={{
                  fontFamily: W.monoFont,
                  fontSize: 11,
                  color: W.marquee,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Playing now
              </span>
              <h1
                style={{
                  fontFamily: W.displayFont,
                  fontSize: "1.6rem",
                  color: W.cream,
                  margin: "0.3rem 0 0",
                }}
              >
                {hero.name}
              </h1>
            </div>
          </div>
        )}

        <PickForMe genres={genres} />

        {thisWeek && thisWeek.length > 0 && (
          <Reveal>
            <ThisWeekRow items={thisWeek} />
          </Reveal>
        )}

        {!signalLoading && signalItems.length > 0 && (
          <Reveal delay={0.05}>
            <SignalRow genre={signalGenre} items={signalItems} />
          </Reveal>
        )}

        <Reveal delay={0.1}>
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              padding: "2.5rem 2rem 0",
            }}
          >
            <SectionHeading eyebrow="Just Added" title="Fresh Prints" />
            {freshPrints.length === 0 ? (
              <MovieCardSkeleton count={6} />
            ) : (
              <div style={gridStyle}>
                {freshPrints.map((item, i) => (
                  <MovieCard key={item.id} item={item} frame={i + 1} />
                ))}
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <ExploreDeeper />
        </Reveal>
      </main>

      <Footer />
    </>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
  gap: "1.25rem",
  marginTop: "1.5rem",
};

function SectionHeading({ eyebrow, title }) {
  return (
    <div style={{ marginBottom: "0.25rem" }}>
      <span
        style={{
          fontFamily: W.monoFont,
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: W.marquee,
        }}
      >
        {eyebrow}
      </span>
      <h2
        style={{
          fontFamily: W.displayFont,
          fontSize: "1.6rem",
          color: W.cream,
          margin: "0.25rem 0 0",
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function ThisWeekRow({ items }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 2rem 0" }}>
      <SectionHeading eyebrow="Real Momentum" title="This week" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 14,
          marginTop: "1.25rem",
        }}
      >
        {items.map((item) => (
          <TrailerThumb key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function SignalRow({ genre, items }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 2rem 0" }}>
      <SectionHeading eyebrow="Because you're into" title={genre} />
      <div style={gridStyle}>
        {items.map((item, i) => (
          <MovieCard key={item.id} item={item} frame={i + 1} />
        ))}
      </div>
    </div>
  );
}

function TrailerThumb({ item }) {
  return (
    <a
      href={`/movies/${item.slug}`}
      style={{
        position: "relative",
        display: "block",
        aspectRatio: "16/9",
        borderRadius: 10,
        overflow: "hidden",
        textDecoration: "none",
        backgroundImage: item.backdrop_path
          ? `url(${item.backdrop_path})`
          : item.image
            ? `url(${item.image})`
            : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: W.surface,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, transparent 50%, rgba(10,9,8,0.75) 100%)",
        }}
      />
      <div style={{ position: "absolute", bottom: 8, left: 10, right: 10 }}>
        <div
          style={{
            fontFamily: W.bodyFont,
            fontSize: 13,
            fontWeight: 600,
            color: W.cream,
          }}
        >
          {item.name}
        </div>
        {item.rating != null && (
          <div
            style={{ fontFamily: W.monoFont, fontSize: 10, color: W.marquee }}
          >
            ★ {item.rating}
          </div>
        )}
      </div>
    </a>
  );
}

function ExploreDeeper() {
  // Links to pages not built yet (/movies/browse, /movies/upcoming) —
  // intentional, per the master plan's Phase 1/2. These resolve once
  // those pages are built.
  const links = [
    { href: "/movies/browse", label: "Browse everything" },
    { href: "/movies/upcoming", label: "Upcoming" },
  ];
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "3rem 2rem 4rem",
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontFamily: W.monoFont,
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: W.marquee,
        }}
      >
        Want to explore more?
      </span>
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          justifyContent: "center",
          marginTop: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={{
              fontFamily: W.bodyFont,
              fontSize: 14,
              color: W.cream,
              textDecoration: "none",
              borderBottom: `1px solid ${W.surfaceBorder}`,
            }}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
