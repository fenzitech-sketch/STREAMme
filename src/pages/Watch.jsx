
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovie } from "../api/tmdb";
import CineSrcPlayer from "../components/CineSrcPlayer";
import Player from "../components/Player";
import "./Watch.css";
import { SERVERS } from "../data/servers";
import { upsert, removeEntry, getEntry } from "../hooks/useContinueWatching";

export default function Watch() {
  const { id } = useParams();
  const nav = useNavigate();

  const [movie, setMovie] = useState(null);
  const [provider, setProvider] = useState("cinesrc");
const [embedSource, setEmbedSource] = useState(undefined); // undefined = checking, null = none
  const [librarySource, setLibrarySource] = useState("");

  useEffect(() => {
    let cancelled = false;

    getMovie(id)
      .then((data) => {
        if (!cancelled) setMovie(data);
      })
      .catch(console.error);

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
          <CineSrcPlayer
            tmdbId={movie.id}
            title={movie.title}
          />
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
