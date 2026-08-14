// pages/movies/director/[name].js
// Wobl — Director filmography page. Route uses the director's name
// (slugified), not a person ID — the schema has no people/cast table, so
// this is the honest version of what the spec called "person pages."
// Cast-based filmography (actor pages) is out of scope until cast data
// is normalized into its own table — see items.js getByDirectorName note.

import Head from "next/head";
import { getByDirectorName } from "shared/lib/movies";
import { supabase } from "shared/lib/supabase";
import Navbar from "../../../components/shared/Navbar";
import Footer from "../../../components/shared/Footer";
import MovieCard from "../../../components/movies/MovieCard";
import { W } from "../../../components/shared/wobl-theme";

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  // Reconstruct a searchable name from the URL slug. This is an
  // approximation (can't perfectly reverse a slug back to an exact name
  // with special characters) — ilike match handles minor case/spacing
  // differences, but an exact accented-name edge case could miss.
  const nameGuess = params.name.replace(/-/g, " ");

  const films = await getByDirectorName(nameGuess);

  if (!films.length) return { notFound: true };

  return {
    props: {
      directorName: films[0].director,
      films,
    },
    revalidate: 3600,
  };
}

export default function DirectorPage({ directorName, films }) {
  return (
    <>
      <Head>
        <title>{directorName} — Wobl</title>
        <meta
          name="description"
          content={`Films by ${directorName} on Wobl.`}
        />
      </Head>

      <Navbar />

      <main
        style={{
          background: W.bg,
          minHeight: "100vh",
          padding: "3rem 2rem 4rem",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div
            style={{
              fontFamily: W.monoFont,
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: W.marquee,
              marginBottom: 6,
            }}
          >
            Director
          </div>
          <h1
            style={{
              fontFamily: W.displayFont,
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
              color: W.cream,
              margin: "0 0 2rem",
            }}
          >
            {directorName}
          </h1>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {films.map((item, i) => (
              <MovieCard key={item.id} item={item} frame={i + 1} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
