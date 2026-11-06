
import { Link, useNavigate } from "react-router-dom";
import { IMG } from "../api/tmdb";
import "./MovieCard.css";

export default function MovieCard({ movie }) {
  const nav = useNavigate();
  const year = movie.release_date?.slice(0, 4);
  const rating = Number(movie.vote_average || 0);

  const playNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    nav(`/movie/${movie.id}?play=1`);
  };

  return (
    <Link to={`/movie/${movie.id}`} className="card">
      {movie.poster_path ? (
        <img
          src={`${IMG}/w342${movie.poster_path}`}
          alt={movie.title || "Movie"}
          loading="lazy"
        />
      ) : (
        <div
          style={{
            aspectRatio: "2 / 3",
            minHeight: 220,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            textAlign: "center",
            boxSizing: "border-box",
            background: "linear-gradient(145deg, #25164a, #111827)",
            color: "white",
            fontWeight: 700,
          }}
        >
          {movie.title}
        </div>
      )}

      <div className="card-info">
        <button className="play" onClick={playNow}>
          ▶ Play
        </button>
        <span>
          {year || "Movie"} ⭐ {rating.toFixed(1)}
        </span>
      </div>
    </Link>
  );
}

