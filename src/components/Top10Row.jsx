
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getTrending } from "../api/cinemeta";

export default function Top10Row() {
  const [movies, setMovies] = useState([]);
  const scroller = useRef(null);

  useEffect(() => {
    let active = true;

    getTrending()
      .then((data) => {
        if (active) {
          setMovies(
            (data.results || [])
              .filter((movie) => movie.title && movie.poster)
              .slice(0, 10)
          );
        }
      })
      .catch((error) => {
        console.error("Top 10 loading error:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!movies.length) return null;

  return (
    <section className="row">
      <div className="row-head">
        <h2>Top 10 Movies</h2>
        <div>
          <button
            onClick={() =>
              scroller.current?.scrollBy({
                left: -700,
                behavior: "smooth",
              })
            }
          >
            ‹
          </button>
          <button
            onClick={() =>
              scroller.current?.scrollBy({
                left: 700,
                behavior: "smooth",
              })
            }
          >
            ›
          </button>
        </div>
      </div>

      <div className="row-scroll" ref={scroller}>
        {movies.map((movie, index) => (
          <Link
            key={movie.id}
            to={`/movie/${movie.id}`}
            className="top-card"
          >
            <span className="top-num">{index + 1}</span>

            <img
              src={movie.poster}
              alt={movie.title}
              loading="lazy"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
