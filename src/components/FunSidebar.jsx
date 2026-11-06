import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { getByMood, IMG } from "../api/cinemeta";
import { MOODS, GAMES, THINGS, THING_CATS, CAT_EMOJI, PLAYER_LABELS } from "../data/fun";
import "./FunSidebar.css";

const pickOne = (list) => list[Math.floor(Math.random() * list.length)];

/* ---------------- MOOD TAB ---------------- */
function MoodTab({ onClose }) {
  const [mood, setMood] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = async (m) => {
    setMood(m);
    setLoading(true);
    setError(false);
    try {
      setMovies(await getByMood(m));
    } catch (e) {
      console.error(e);
      setMovies([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p className="fs-hint">How are you feeling right now?</p>
      <div className="fs-moods">
        {MOODS.map((m) => (
          <button
            key={m.id}
            className={`fs-mood ${mood?.id === m.id ? "on" : ""}`}
            onClick={() => load(m)}
          >
            <span>{m.emoji}</span>
            {m.label}
          </button>
        ))}
      </div>

      {loading && <div className="fs-center"><div className="spinner" /></div>}
      {error && <p className="fs-hint">Couldn't load movies. Check your connection.</p>}

      {!loading && movies.length > 0 && (
        <>
          <h3 className="fs-sub">{mood.emoji} Picks for “{mood.label}”</h3>
          <div className="fs-posters">
            {movies.map((m, i) => (
              <Link
                key={m.id}
                to={`/movie/${m.id}`}
                onClick={onClose}
                className="fs-poster"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <img src={m.poster} alt={m.title} loading="lazy" />
                <strong>{m.title}</strong>
                <small>{m.release_date?.slice(0, 4)}</small>
              </Link>
            ))}
          </div>
          <button className="fs-btn" onClick={() => load(mood)}>🔀 Show different ones</button>
        </>
      )}
    </>
  );
}

/* ---------------- GAMES TAB ---------------- */
const FILTERS = [["all", "All"], ["solo", "Solo"], ["duo", "2 players"], ["group", "Group"], ["movie", "Movie night"]];

function GamesTab() {
  const [f, setF] = useState("all");
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState(null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return GAMES.filter(
      (g) => (f === "all" || g.p === f) && (!s || `${g.n} ${g.d}`.toLowerCase().includes(s))
    );
  }, [f, q]);

  const surprise = () => {
    if (list.length) setPicked({ ...pickOne(list), k: Date.now() });
  };

  return (
    <>
      <input
        className="fs-search"
        placeholder={`Search ${GAMES.length} games…`}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="fs-filters">
        {FILTERS.map(([k, l]) => (
          <button key={k} className={f === k ? "on" : ""} onClick={() => setF(k)}>{l}</button>
        ))}
      </div>

      <button className="fs-btn" onClick={surprise}>🎲 Pick one for me</button>

      {picked && (
        <div className="fs-featured" key={picked.k}>
          <span className="fs-tag">{PLAYER_LABELS[picked.p]}</span>
          <h3>{picked.n}</h3>
          <p>{picked.d}</p>
        </div>
      )}

      <p className="fs-count">{list.length} games</p>
      <div className="fs-list">
        {list.map((g) => (
          <article key={g.n} className="fs-item">
            <div className="fs-item-top">
              <strong>{g.n}</strong>
              <span className="fs-tag">{PLAYER_LABELS[g.p]}</span>
            </div>
            <p>{g.d}</p>
          </article>
        ))}
        {list.length === 0 && <p className="fs-hint">No games match that search.</p>}
      </div>
    </>
  );
}

/* ---------------- DO TAB ---------------- */
function DoTab() {
  const [cat, setCat] = useState("all");
  const [picked, setPicked] = useState(null);

  const list = THINGS.filter((t) => cat === "all" || t.c === cat);

  const surprise = () => setPicked({ ...pickOne(list), k: Date.now() });

  return (
    <>
      <div className="fs-filters">
        <button className={cat === "all" ? "on" : ""} onClick={() => setCat("all")}>All</button>
        {THING_CATS.map((c) => (
          <button key={c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>
            {CAT_EMOJI[c]} {c}
          </button>
        ))}
      </div>

      <button className="fs-btn" onClick={surprise}>✨ Surprise me</button>

      {picked && (
        <div className="fs-featured" key={picked.k}>
          <span className="fs-tag">{CAT_EMOJI[picked.c]} {picked.c}</span>
          <h3>{picked.t}</h3>
        </div>
      )}

      <p className="fs-count">{list.length} ideas</p>
      <div className="fs-list">
        {list.map((t) => (
          <article key={t.t} className="fs-item">
            <div className="fs-item-top">
              <span className="fs-emoji">{CAT_EMOJI[t.c]}</span>
              <p>{t.t}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

/* ---------------- SIDEBAR SHELL ---------------- */
const TABS = [
  ["mood", "🎭 Mood"],
  ["games", `🎮 Games ${GAMES.length}`],
  ["do", "💡 Do"],
];

export default function FunSidebar({ onClose }) {
  const [tab, setTab] = useState("mood");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, []);

  return createPortal(
    <>
      <div className="fs-scrim" onClick={onClose} />
      <aside className="fs-panel">
        <header className="fs-head">
          <h2>Fun Zone ✨</h2>
          <button className="fs-x" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <nav className="fs-tabs">
          {TABS.map(([k, l]) => (
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
              {l}
            </button>
          ))}
        </nav>

        <div className="fs-body">
          {tab === "mood" && <MoodTab onClose={onClose} />}
          {tab === "games" && <GamesTab />}
          {tab === "do" && <DoTab />}
        </div>
      </aside>
    </>,
    document.body
  );
}