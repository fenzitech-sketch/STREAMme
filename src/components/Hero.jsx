
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTrending, IMG, GENRES } from "../api/tmdb";

export default function Hero() {
  const [items, setItems] = useState([]);
  const [i, setI] = useState(0);

  useEffect(() => {
    let active = true;

    getTrending()
      .then((data) => {
        if (active) {
          setItems((data.results || []).filter((m) => m.title).slice(0, 5));
        }
      })
      .catch((err) => console.error("Hero loading error:", err));

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!items.length) return;

    const timer = setInterval(() => {
      setI((current) => (current + 1) % items.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [items]);

  if (!items.length) return <div className="hero" />;

  const movie = items[i] || items[0];

  return (
    <header className="hero">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`hero-bg ${index === i ? "on" : ""}`}
          style={{
            backgroundImage: item.backdrop_path
              ? `url(${IMG}/original${item.backdrop_path})`
              : "linear-gradient(120deg, #25164a, #111827, #080808)",
            backgroundColor: "#111",
          }}
        />
      ))}

      <div className="hero-fade" />

      <div className="hero-content" key={movie.id}>
        <div className="tags">
          {(movie.genre_ids || []).slice(0, 3).map((genreId) =>
            GENRES[genreId] ? (
              <span key={genreId}>{GENRES[genreId].name}</span>
            ) : null
          )}
        </div>

        <h1>{movie.title}</h1>

        <p className="meta">
          <span className="match">
            {Math.round(Number(movie.vote_average || 0) * 10)}% Match
          </span>
          {" · "}
          {movie.release_date?.slice(0, 4)}
          {" · "}⭐ {Number(movie.vote_average || 0).toFixed(1)}
        </p>

        <p className="overview">{movie.overview}</p>

        <div className="hero-actions">
          <Link to={`/movie/${movie.id}?play=1`} className="btn-play">
            ▶ Play now
          </Link>

          <Link to={`/movie/${movie.id}`} className="btn-info">
            ⓘ More info
          </Link>
        </div>
      </div>

      <div className="hero-dots">
        {items.map((_, index) => (
          <button
            key={index}
            className={index === i ? "on" : ""}
            onClick={() => setI(index)}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </header>
  );
}

