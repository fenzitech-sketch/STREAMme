import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { getMovie, IMG } from "../api/tmdb";
import Watch from "./Watch";
import "./Movie.css";

export default function Movie() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const [m, setM] = useState(null);

  useEffect(() => { getMovie(id).then(setM); }, [id]);

  // ?play=1 shows the player instead of the details
  if (params.get("play") === "1") return <Watch />;
  if (!m) return <p style={{ padding: 100 }}>Loading…</p>;

  return (
    <div
      className="detail"
      style={{ backgroundImage: `url(${IMG}/original${m.backdrop_path})` }}
    >
      <div className="detail-fade" />
      <div className="detail-body">
        <div className="tags">
          {m.genres.map((g) => <span key={g.id}>{g.name}</span>)}
        </div>

        <h1>{m.title}</h1>

        <p className="meta">
          ⭐ {m.vote_average.toFixed(1)} · {m.release_date?.slice(0, 4)} · {m.runtime} min
        </p>

        <p className="overview">{m.overview}</p>

        {/* This replaces "Watch trailer" */}
        <Link to={`/movie/${m.id}?play=1`} className="btn-play">
          ▶ Play
        </Link>
      </div>
    </div>
  );
}