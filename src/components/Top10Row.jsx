import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getTrending, IMG } from "../api/tmdb";

export default function Top10Row() {
  const [movies, setMovies] = useState([]);
  const scroller = useRef(null);

  useEffect(() => {
    getTrending().then((d) => setMovies(d.results.filter((m) => m.poster_path).slice(0, 10)));
  }, []);

  return (
    <section className="row">
      <div className="row-head">
        <h2>Top 10 this week</h2>
        <div>
          <button onClick={() => scroller.current.scrollBy({ left: -700, behavior: "smooth" })}>‹</button>
          <button onClick={() => scroller.current.scrollBy({ left: 700, behavior: "smooth" })}>›</button>
        </div>
      </div>
      <div className="row-scroll" ref={scroller}>
        {movies.map((m, n) => (
          <Link key={m.id} to={`/movie/${m.id}`} className="top-card">
            <span className="top-num">{n + 1}</span>
            <img src={`${IMG}/w342${m.poster_path}`} alt={m.title} loading="lazy" />
          </Link>
        ))}
      </div>
    </section>
  );
}