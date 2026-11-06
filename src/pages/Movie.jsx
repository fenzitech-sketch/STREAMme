
import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { getMovie, IMG } from "../api/tmdb";
import Watch from "./Watch";
import "./Movie.css";

export default function Movie() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setMovie(null);
    setError("");

    getMovie(id)
      .then((data) => {
        if (active) setMovie(data);
      })
      .catch((err) => {
        console.error("Movie details error:", err);
        if (active) setError("Movie details are unavailable right now.");
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (params.get("play") === "1") return <Watch />;

  if (error) {
    return <p style={{ padding: 100 }}>{error}</p>;
  }

  if (!movie) {
    return <p style={{ padding: 100 }}>Loading…</p>;
  }

  const rating = Number(movie.vote_average || 0);
  const genres = movie.genres || [];

  return (
    <div
      className="detail"
      style={{
        backgroundImage: movie.backdrop_path
          ? `url(${IMG}/original${movie.backdrop_path})`
          : "linear-gradient(120deg, #25164a, #111827, #080808)",
      }}
    >
      <div className="detail-fade" />

      <div className="detail-body">
        <div className="tags">
          {genres.map((genre) => (
            <span key={genre.id}>{genre.name}</span>
          ))}
        </div>

        <h1>{movie.title || movie.name}</h1>

        <p className="meta">
          ⭐ {rating.toFixed(1)}
          {" · "}
          {movie.release_date?.slice(0, 4) || "Year unavailable"}
          {" · "}
          {movie.runtime ? `${movie.runtime} min` : "Runtime unavailable"}
        </p>

        <p className="overview">{movie.overview}</p>

        <Link to={`/movie/${movie.id}?play=1`} className="btn-play">
          ▶ Play
        </Link>
      </div>
    </div>
  );
}

