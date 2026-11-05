import { useRef } from "react";
import { Link } from "react-router-dom";
import { IMG } from "../api/tmdb";
import useContinueWatching, { removeEntry, clearAll } from "../hooks/useContinueWatching";

function label(e) {
  if (e.duration && e.position != null) {
    const left = Math.max(0, Math.round((e.duration - e.position) / 60));
    return `${left}m left`;
  }
  return "Resume";
}

export default function ContinueRow() {
  const list = useContinueWatching();
  const scroller = useRef(null);

  if (!list.length) return null;

  return (
    <section className="row">
      <div className="row-head">
        <h2>
          Continue Watching <span className="count">{list.length}</span>
          <button className="clear" onClick={clearAll}>Clear</button>
        </h2>
        <div>
          <button onClick={() => scroller.current.scrollBy({ left: -600, behavior: "smooth" })}>‹</button>
          <button onClick={() => scroller.current.scrollBy({ left: 600, behavior: "smooth" })}>›</button>
        </div>
      </div>

      <div className="row-scroll" ref={scroller}>
        {list.map((e) => {
          const pct = e.duration ? Math.min(100, (e.position / e.duration) * 100) : 0;
          return (
            <Link key={e.id} to={`/movie/${e.id}?play=1`} className="cw-card">
              <img src={`${IMG}/w500${e.backdrop_path || e.poster_path}`} alt={e.title} loading="lazy" />
              <button
                className="cw-x"
                title="Remove"
                onClick={(ev) => { ev.preventDefault(); removeEntry(e.id); }}
              >
                ✕
              </button>
              <div className="cw-info">
                <strong>{e.title}</strong>
                <small>⏱ {label(e)}</small>
              </div>
              <div className="cw-bar"><i style={{ width: `${pct}%` }} /></div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}