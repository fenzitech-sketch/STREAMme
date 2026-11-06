
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  getMovie,
  getTMDBMovieIdFromIMDb,
} from "../api/cinemeta";

import CineSrcPlayer from "../components/CineSrcPlayer";
import Player from "../components/Player";
import "./Watch.css";

export default function Watch() {
  const { id } = useParams();
  const nav = useNavigate();

  const [movie, setMovie] = useState(null);
  const [tmdbId, setTmdbId] = useState("");
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [tmdbError, setTmdbError] = useState("");

  const [provider, setProvider] = useState("cinesrc");
  const [librarySource, setLibrarySource] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMovie() {
      setMovie(null);
      setTmdbId("");
      setTmdbError("");
      setTmdbLoading(true);

      try {
        const movieData = await getMovie(id);

        if (cancelled) return;

        setMovie(movieData);

        const imdbId = movieData.imdb_id || movieData.id;

        const numericId = await getTMDBMovieIdFromIMDb(imdbId);

        if (cancelled) return;

        setTmdbId(numericId);
      } catch (error) {
        if (!cancelled) {
          console.error("Movie loading error:", error);
          setTmdbError(error.message || "Could not load movie.");
        }
      } finally {
        if (!cancelled) {
          setTmdbLoading(false);
        }
      }
    }

    loadMovie();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!movie) {
    return <div className="watch-page">Loading movie...</div>;
  }

  return (
    <div className="watch-page">
      <header className="watch-header">
        <button className="close-button" onClick={() => nav(-1)}>
          ← Back
        </button>

        <div>
          <h2>{movie.title}</h2>
          <p>
            {movie.release_date?.slice(0, 4) || "Movie"} ·
            {" "}⭐ {movie.vote_average?.toFixed(1) || "N/A"}
          </p>
        </div>

        <span>NovaStream Player</span>
      </header>

      <nav className="provider-selector">
        <button
          className={provider === "cinesrc" ? "active" : ""}
          onClick={() => setProvider("cinesrc")}
        >
          <strong>CineSrc</strong>
          <small>Player</small>
        </button>

        <button
          className={provider === "library" ? "active" : ""}
          onClick={() => setProvider("library")}
        >
          <strong>Nova Library</strong>
          <small>Your videos</small>
        </button>
      </nav>

      <main className="main-player">
        {provider === "cinesrc" && (
          <section>
            {tmdbLoading && (
              <div className="player-message">
                Finding movie ID...
              </div>
            )}

            {!tmdbLoading && tmdbError && (
              <div className="player-message">
                <h3>Movie ID lookup failed</h3>
                <p>{tmdbError}</p>
                <button onClick={() => window.location.reload()}>
                  Try again
                </button>
              </div>
            )}

            {!tmdbLoading && !tmdbError && tmdbId && (
              <CineSrcPlayer
                key={tmdbId}
                tmdbId={tmdbId}
                title={movie.title}
                type="movie"
              />
            )}
          </section>
        )}

        {provider === "library" && (
          <section className="library-player">
            <h3>Nova Library</h3>
            <p>Play a video file you own or are authorized to use.</p>

            <input
              type="url"
              placeholder="Paste your authorized video URL"
              value={librarySource}
              onChange={(event) =>
                setLibrarySource(event.target.value)
              }
            />

            {librarySource.trim() && (
              <Player
                source={{
                  type: "video",
                  src: librarySource.trim(),
                }}
                title={movie.title}
              />
            )}
          </section>
        )}
      </main>
    </div>
  );
}
