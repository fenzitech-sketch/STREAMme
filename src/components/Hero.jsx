
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTrending } from "../api/cinemeta";

export default function Hero() {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let active = true;

    getTrending()
      .then((data) => {
        if (active) {
          setItems(
            (data.results || [])
              .filter((movie) => movie.title)
              .slice(0, 5)
          );
        }
      })
      .catch((error) => {
        console.error("Hero loading error:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!items.length) return;

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [items]);

  if (!items.length) return <div className="hero" />;

  const movie = items[index] || items[0];

  return (
    <header className="hero">
      {items.map((item, i) => (
        <div
          key={item.id}
          className={`hero-bg ${i === index ? "on" : ""}`}
          style={{
            backgroundImage: item.background
              ? `url("${item.background}")`
              : "linear-gradient(120deg, #25164a, #111827, #080808)",
            backgroundColor: "#111",
          }}
        />
      ))}

      <div className="hero-fade" />

      <div className="hero-content" key={movie.id}>
        <div className="tags">
          {(movie.genres || []).slice(0, 3).map((genre) => (
            <span key={genre}>{genre}</span>
          ))}
        </div>

        <h1>{movie.title}</h1>

        <p className="meta">
          <span className="match">
            {Math.round(Number(movie.vote_average || 0) * 10)}% Match
          </span>
          {" · "}
          {movie.releaseInfo || movie.release_date?.slice(0, 4) || "Movie"}
          {" · "}
          ⭐ {Number(movie.vote_average || 0).toFixed(1)}
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
        {items.map((item, i) => (
          <button
            key={item.id}
            className={i === index ? "on" : ""}
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </header>
  );
}
