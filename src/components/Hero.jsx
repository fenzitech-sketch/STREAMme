
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTrending, IMG, GENRES } from "../api/tmdb";

export default function Hero() {
  const [items, setItems] = useState([]);
  const [i, setI] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    getTrending()
      .then((d) => {
        setItems(
          (d.results || [])
            .filter((m) => m.backdrop_path)
            .slice(0, 5)
        );
      })
      .catch((err) => {
        console.error("Hero loading error:", err);
        setError(true);
      });
  }, []);

  useEffect(() => {
    if (!items.length) return;

    const t = setInterval(() => {
      setI((x) => (x + 1) % items.length);
    }, 8000);

    return () => clearInterval(t);
  }, [items]);

  if (error) return <div className="hero" />;
  if (!items.length) return <div className="hero" />;

  const m = items[i];

  return (
    <header className="hero">
      {items.map((it, n) => (
        <div
          key={it.id}
          className={`hero-bg ${n === i ? "on" : ""}`}
          style={{
            backgroundImage: `url(${IMG}/original${it.backdrop_path})`,
          }}
        />
      ))}

      <div className="hero-fade" />

      <div className="hero-content" key={m.id}>
        <div className="tags">
          {(m.genre_ids || []).slice(0, 3).map((g) =>
            GENRES[g] ? (
              <span key={g}>{GENRES[g].name}</span>
            ) : null
          )}
        </div>

        <h1>{m.title}</h1>

        <p className="meta">
          <span className="match">
            {Math.round(m.vote_average * 10)}% Match
          </span>
          {" · "}
          {m.release_date?.slice(0, 4)}
          {" · "}⭐ {m.vote_average?.toFixed(1)}
        </p>

        <p className="overview">{m.overview}</p>

        <div className="hero-actions">
          <Link to={`/movie/${m.id}?play=1`} className="btn-play">
            ▶ Play now
          </Link>

          <Link to={`/movie/${m.id}`} className="btn-info">
            ⓘ More info
          </Link>
        </div>
      </div>

      <div className="hero-dots">
        {items.map((_, n) => (
          <button
            key={n}
            className={n === i ? "on" : ""}
            onClick={() => setI(n)}
            aria-label={`Slide ${n + 1}`}
          />
        ))}
      </div>
    </header>
  );
}
