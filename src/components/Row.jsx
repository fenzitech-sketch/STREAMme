
import { useEffect, useRef, useState } from "react";
import MovieCard from "./MovieCard";
import "./Row.css";

export default function Row({ title, fetcher }) {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(false);
  const scroller = useRef(null);

  useEffect(() => {
    let active = true;

    fetcher()
      .then((data) => {
        if (active) {
          setMovies((data.results || []).filter((movie) => movie.title));
          setError(false);
        }
      })
      .catch((err) => {
        console.error(`${title} loading error:`, err);
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const scroll = (direction) => {
    scroller.current?.scrollBy({
      left: direction * 600,
      behavior: "smooth",
    });
  };

  if (error || !movies.length) return null;

  return (
    <section className="row">
      <div className="row-head">
        <h2>{title}</h2>
        <div>
          <button onClick={() => scroll(-1)}>‹</button>
          <button onClick={() => scroll(1)}>›</button>
        </div>
      </div>

      <div className="row-scroll" ref={scroller}>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}
