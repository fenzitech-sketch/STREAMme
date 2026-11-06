
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  getRandomMovie,
  getRandomTV,
  getExternalIds,
  IMG,
  GENRES,
} from "../api/cinemeta";
import { getImdbRating, hasOmdbKey } from "../api/omdb";
import DiceRoller from "./DiceRoller";
import "./DiceModal.css";

function verdict(rating, votes) {
  if (rating >= 8 && votes >= 20000) {
    return {
      cls: "must",
      label: "🔥 Must watch",
      note: "Loved by a lot of people",
    };
  }

  if (rating >= 7) {
    return {
      cls: "good",
      label: "👍 Worth watching",
      note: "Solid pick",
    };
  }

  if (rating >= 6) {
    return {
      cls: "mixed",
      label: "🤔 Hit or miss",
      note: "Watch if the genre is your thing",
    };
  }

  return {
    cls: "skip",
    label: "👎 Skip it",
    note: "Most viewers weren't impressed",
  };
}

async function pickWithImdb(kind) {
  for (let i = 0; i < 5; i++) {
    const item =
      kind === "movie" ? await getRandomMovie() : await getRandomTV();

    const ids = await getExternalIds(kind, item.id);
    const imdb = await getImdbRating(ids.imdb_id);

    if (imdb) {
      return { ...item, imdb };
    }
  }

  throw new Error("no-imdb");
}

function PickCard({ kind, item, delay, onClose }) {
  const title = item.title || item.name;
  const year = (
    item.release_date ||
    item.first_air_date ||
    ""
  ).slice(0, 4);

  const genres = (item.genre_ids || [])
    .map((g) => GENRES[g]?.name || GENRES[g])
    .filter(Boolean)
    .slice(0, 3);

  const v = verdict(item.imdb.rating, item.imdb.votes);

  const playUrl =
    kind === "movie"
      ? `/movie/${item.id}?play=1`
      : `/tv/${item.id}?s=1&e=1&play=1`;

  return (
    <article
      className="dm-card"
      style={{ animationDelay: `${delay}s` }}
    >
      <img
        src={item.poster}
        alt={title}
      />

      <div className="dm-body">
        <span className="dm-kind">
          {kind === "movie" ? "MOVIE" : "SERIES"}
        </span>

        <h3>{title}</h3>

        <p className="dm-sub">
          {year}
          {genres.length > 0 && ` · ${genres.join(", ")}`}
        </p>

        <div className="dm-rate">
          <a
            className="dm-imdb"
            href={`https://www.imdb.com/title/${item.imdb.id}/`}
            target="_blank"
            rel="noreferrer"
            title="Open on IMDb"
          >
            <span className="dm-imdb-logo">IMDb</span>
            <strong>{item.imdb.rating.toFixed(1)}</strong>
            <small>/10</small>
          </a>

          <span className="dm-votes">
            {item.imdb.votes.toLocaleString("en-US")} votes
          </span>
        </div>

        <div className={`dm-verdict ${v.cls}`}>
          <b>{v.label}</b>
          <small>{v.note}</small>
        </div>

        <p className="dm-over">{item.overview}</p>

        <Link
          className="dm-btn"
          to={playUrl}
          onClick={onClose}
        >
          ▶ Play {kind === "movie" ? "Movie" : "Series"}
        </Link>
      </div>
    </article>
  );
}

export default function DiceModal({ onClose }) {
  const [phase, setPhase] = useState("idle");
  const [pick, setPick] = useState(null);
  const [values, setValues] = useState([]);

  const settleRef = useRef(null);

  const roll = async () => {
    if (!hasOmdbKey) {
      setPhase("nokey");
      return;
    }

    setPick(null);
    setValues([]);
    setPhase("rolling");

    const diceStopped = new Promise((resolve) => {
      let settled = false;

      const finish = (vals) => {
        if (settled) return;
        settled = true;
        if (vals) setValues(vals);
        resolve();
      };

      settleRef.current = finish;
      setTimeout(() => finish(), 9000);
    });

    try {
      const [movie, tv] = await Promise.all([
        pickWithImdb("movie"),
        pickWithImdb("tv"),
        diceStopped,
      ]);

      await new Promise((resolve) => setTimeout(resolve, 900));

      setPick({ movie, tv });
      setPhase("reveal");
    } catch (error) {
      console.error("Dice recommendation error:", error);
      setPhase("error");
    }
  };

  useEffect(() => {
    roll();

    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <div className="dm-overlay" onClick={onClose}>
      <div
        className={`dm-box ${phase === "reveal" ? "scroll" : ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="dm-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        {phase !== "reveal" && (
          <div className="dm-stage">
            {phase === "rolling" && (
              <>
                <DiceRoller
                  onSettled={(vals) => settleRef.current?.(vals)}
                />

                <p className="dm-roll-text">
                  {values.length === 2
                    ? `You rolled ${values[0]} and ${values[1]}`
                    : "Rolling the dice…"}
                </p>
              </>
            )}

            {phase === "error" && (
              <>
                <p className="dm-roll-text">
                  Couldn't roll. Check your connection and keys.
                </p>
                <button className="dm-btn" onClick={roll}>
                  Try again
                </button>
              </>
            )}

            {phase === "nokey" && (
              <>
                <p className="dm-roll-text">IMDb key missing</p>
                <p className="dm-help">
                  Add <code>VITE_OMDB_KEY=your_key</code> to your{" "}
                  <code>.env</code> file and restart{" "}
                  <code>npm run dev</code>.
                </p>
              </>
            )}
          </div>
        )}

        {phase === "reveal" && pick && (
          <>
            <h2 className="dm-title">Tonight's picks 🎲</h2>

            {values.length === 2 && (
              <p className="dm-rolled">
                You rolled {values[0]} and {values[1]}
              </p>
            )}

            <div className="dm-cards">
              <PickCard
                kind="movie"
                item={pick.movie}
                delay={0}
                onClose={onClose}
              />

              <PickCard
                kind="tv"
                item={pick.tv}
                delay={0.15}
                onClose={onClose}
              />
            </div>

            <div className="dm-foot">
              <button
                className="dm-btn ghost"
                onClick={roll}
              >
                🎲 Roll again
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
