
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { searchAll, IMG } from "../api/tmdb";
import DiceModal from "./DiceModal";
import "./TopBar.css";
import FunSidebar from "./FunSidebar";

export default function TopBar() {
  const nav = useNavigate();

  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [diceOpen, setDiceOpen] = useState(false);
  const [funOpen, setFunOpen] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const data = await searchAll(q);

        if (!cancelled) {
          setResults(
            data
              .filter((item) => item.poster_path)
              .slice(0, 8)
          );
        }
      } catch (error) {
        console.error("Search error:", error);

        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q]);

  const go = (item) => {
    setOpen(false);
    setQ("");
    setResults([]);

    if (item.mediaType === "tv") {
      nav(`/tv/${item.id}`);
    } else {
      nav(`/movie/${item.id}`);
    }
  };

  return (
    <>
      <header className="topbar">
        <Link to="/" className="brand">
          NOVA<span>STREAM</span>
        </Link>

        <div className="search-wrap">
          <div className="search">
            <input
              value={q}
              placeholder="Search movies & TV series..."
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
            />

            {open && q.trim().length >= 2 && (
              <div className="search-drop">

                {loading && (
                  <div className="search-message">
                    Searching...
                  </div>
                )}

                {!loading && results.length === 0 && (
                  <div className="search-message">
                    No movies or series found.
                  </div>
                )}

                {results.map((item) => (
                  <button
                    key={`${item.mediaType}-${item.id}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go(item)}
                  >
                    <img
                      src={`${IMG}/w92${item.poster_path}`}
                      alt={item.displayTitle}
                    />

                    <div className="search-result-info">
                      <strong>{item.displayTitle}</strong>

                      <small>
                        {item.displayDate?.slice(0, 4) || "Unknown year"}
                        {" · "}
                        ⭐ {item.vote_average?.toFixed(1) || "N/A"}
                      </small>

                      <span
                        className={`search-type ${
                          item.mediaType === "tv" ? "tv-type" : "movie-type"
                        }`}
                      >
                        {item.mediaType === "tv" ? "TV SERIES" : "MOVIE"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="dice"
            onClick={() => setDiceOpen(true)}
            title="Surprise me"
            aria-label="Random pick"
          >
            🎲
          </button>

          <button
            className="dice"
            onClick={() => setFunOpen(true)}
            title="Fun zone"
            aria-label="Open fun zone"
          >
            ✨
          </button>
        </div>
      </header>

      {diceOpen && (
        <DiceModal onClose={() => setDiceOpen(false)} />
      )}

      {funOpen && (
        <FunSidebar onClose={() => setFunOpen(false)} />
      )}
    </>
  );
}
