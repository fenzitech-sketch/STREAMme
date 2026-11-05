import { useEffect, useRef, useState } from "react";
import MovieCard from "./MovieCard";
import "./Row.css";

export default function Row({ title, fetcher }) {
  const [movies, setMovies] = useState([]);
  const scroller = useRef(null);

  useEffect(() => {
    fetcher().then((d) => setMovies(d.results.filter((m) => m.poster_path)));
  }, []);

  const scroll = (dir) =>
    scroller.current.scrollBy({ left: dir * 600, behavior: "smooth" });

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
        {movies.map((m) => <MovieCard key={m.id} movie={m} />)}
      </div>
    </section>
  );
}