
import { Link, useNavigate } from "react-router-dom";
import "./MovieCard.css";

export default function MovieCard({ movie }) {
  const nav = useNavigate();

  const year =
    movie.releaseInfo?.match(/\d{4}/)?.[0] ||
    movie.release_date?.slice(0, 4);

  const rating = Number(movie.vote_average || 0);
  const poster = movie.poster || movie.poster_path;

  const playNow = (event) => {
    event.preventDefault();
    event.stopPropagation();
    nav(`/movie/${movie.id}?play=1`);
  };

  return (
    <Link to={`/movie/${movie.id}`} className="card">
      {poster ? (
        <img
          src={poster}
          alt={movie.title || "Movie"}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
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
          {year || "Movie"} ⭐ {rating ? rating.toFixed(1) : "N/A"}
        </span>
      </div>
    </Link>
  );
}
