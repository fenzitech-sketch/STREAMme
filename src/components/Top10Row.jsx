
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getTrending, IMG } from "../api/tmdb";

export default function Top10Row() {
  const [movies, setMovies] = useState([]);
  const scroller = useRef(null);

  useEffect(() => {
    let active = true;

    getTrending()
      .then((data) => {
        if (active) {
          setMovies(
            (data.results || []).filter((movie) => movie.title).slice(0, 10)
          );
        }
      })
      .catch((err) => console.error("Top 10 loading error:", err));

    return () => {
      active = false;
    };
  }, []);

  if (!movies.length) return null;

  return (
    <section className="row">
      <div className="row-head">
        <h2>Top 10 this week</h2>
        <div>
          <button onClick={() => scroller.current?.scrollBy({ left: -700, behavior: "smooth" })}>‹</button>
          <button onClick={() => scroller.current?.scrollBy({ left: 700, behavior: "smooth" })}>›</button>
        </div>
      </div>

      <div className="row-scroll" ref={scroller}>
        {movies.map((movie, index) => (
          <Link key={movie.id} to={`/movie/${movie.id}`} className="top-card">
            <span className="top-num">{index + 1}</span>

            {movie.poster_path ? (
              <img
                src={`${IMG}/w342${movie.poster_path}`}
                alt={movie.title}
                loading="lazy"
              />
            ) : (
              <div
                style={{
                  width: 150,
                  minHeight: 210,
                  display: "grid",
                  placeItems: "center",
                  padding: 12,
                  boxSizing: "border-box",
                  textAlign: "center",
                  background: "linear-gradient(145deg, #25164a, #111827)",
                  color: "white",
                  fontWeight: 700,
                }}
              >
                {movie.title}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

