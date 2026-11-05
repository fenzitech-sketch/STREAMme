import { Link, useNavigate } from "react-router-dom";
import { IMG } from "../api/tmdb";
import "./MovieCard.css";

export default function MovieCard({ movie }) {
  const nav = useNavigate();
  const year = movie.release_date?.slice(0, 4);

  const playNow = (e) => {
    e.preventDefault();      // stop the card link from firing
    e.stopPropagation();
    nav(`/movie/${movie.id}?play=1`);
  };

  return (
    <Link to={`/movie/${movie.id}`} className="card">
      <img src={`${IMG}/w342${movie.poster_path}`} alt={movie.title} loading="lazy" />
      <div className="card-info">
        <button className="play" onClick={playNow}>▶ Play</button>
        <span>{year} ⭐ {movie.vote_average.toFixed(1)}</span>
      </div>
    </Link>
  );
}