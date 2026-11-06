
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getTV, getSeason, IMG } from "../api/cinemeta";
import {
  upsert,
  removeEntry,
  getEntry,
} from "../hooks/useContinueWatching";
import Player from "../components/Player";
import CineSrcPlayer from "../components/CineSrcPlayer";
import "./TV.css";

const TV_EMBEDS = {};

const HOSTS = {
  youtube: (id) => `https://www.youtube.com/embed/${id}`,
  archive: (id) => `https://archive.org/embed/${id}`,
  vimeo: (id) => `https://player.vimeo.com/video/${id}`,
};

const pad = (n) => String(n).padStart(2, "0");

function Episodes({ seasons, season, eps, current, onSeason, onPick }) {
  return (
    <section className="tv-eps">
      <div className="tv-eps-head">
        <h2>Episodes</h2>
        <select
          value={season}
          onChange={(e) => onSeason(Number(e.target.value))}
        >
          {seasons.map((s) => (
            <option key={s.id} value={s.season_number}>
              {s.name} ({s.episode_count})
            </option>
          ))}
        </select>
      </div>

      <div className="tv-ep-list">
        {eps.map((ep) => (
          <button
            key={ep.id}
            className={`tv-ep ${current === ep.episode_number ? "on" : ""}`}
            onClick={() => onPick(ep.episode_number)}
          >
            <div className="tv-ep-img">
              {ep.still_path ? (
                <img
                  src={ep.still_path}
                  alt=""
                  loading="lazy"
                />
              ) : (
                <span>▶</span>
              )}
              <b>{ep.episode_number}</b>
            </div>

            <div className="tv-ep-text">
              <strong>{ep.name}</strong>
              <small>
                {ep.runtime ? `${ep.runtime} min` : ""}
                {ep.air_date ? ` · ${ep.air_date}` : ""}
              </small>
              <p>{ep.overview}</p>
            </div>
          </button>
        ))}

        {eps.length === 0 && (
          <p className="tv-none">No episode information for this season.</p>
        )}
      </div>
    </section>
  );
}

export default function TV() {
  const { id } = useParams();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();

  const season = Number(params.get("s")) || 1;
  const episode = Number(params.get("e")) || 1;
  const playing = params.get("play") === "1";

  const key = `tv-${id}`;

  const [show, setShow] = useState(null);
  const [eps, setEps] = useState([]);
  const [tab, setTab] = useState("embed");
  const [libSrc, setLibSrc] = useState(undefined);
  const [custom, setCustom] = useState("");

  const go = (s, e, play = true) => {
    setParams(
      play
        ? { s: String(s), e: String(e), play: "1" }
        : { s: String(s), e: String(e) }
    );
  };

  useEffect(() => {
    let cancelled = false;
    setShow(null);

    getTV(id)
      .then((data) => {
        if (!cancelled) setShow(data);
      })
      .catch((error) => {
        console.error("TV loading error:", error);
        if (!cancelled) setShow(null);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setEps([]);

    getSeason(id, season)
      .then((data) => {
        if (!cancelled) setEps(data.episodes || []);
      })
      .catch((error) => {
        console.error("Season loading error:", error);
        if (!cancelled) setEps([]);
      });

    return () => {
      cancelled = true;
    };
  }, [id, season]);

  useEffect(() => {
    if (!show || !playing) return;

    const old = getEntry(key);
    const same =
      old && old.season === season && old.episode === episode;

    upsert({
      id: key,
      kind: "tv",
      tvId: show.id,
      title: show.name,
      poster_path: show.poster_path,
      backdrop_path: show.backdrop_path,
      season,
      episode,
      ...(same ? {} : { position: 0, duration: 0 }),
    });
  }, [show, playing, season, episode, key]);

  useEffect(() => {
    if (!playing || tab !== "library") return;

    let cancelled = false;
    setLibSrc(undefined);

    const url = `/videos/tv/${id}/s${pad(season)}e${pad(episode)}.mp4`;

    fetch(url, { method: "HEAD" })
      .then((response) => {
        const contentType = response.headers.get("content-type") || "";
        const isVideo = response.ok && contentType.startsWith("video");

        if (!cancelled) setLibSrc(isVideo ? url : null);
      })
      .catch(() => {
        if (!cancelled) setLibSrc(null);
      });

    return () => {
      cancelled = true;
    };
  }, [id, season, episode, tab, playing]);

  const seasons = (show?.seasons || []).filter(
    (s) => s.season_number > 0
  );

  const curSeason = seasons.find((s) => s.season_number === season);
  const epCount = curSeason?.episode_count || eps.length;
  const nextSeason = seasons.find((s) => s.season_number === season + 1);
  const prevSeason = seasons.find((s) => s.season_number === season - 1);

  const nextEp =
    episode < epCount
      ? [season, episode + 1]
      : nextSeason
        ? [season + 1, 1]
        : null;

  const prevEp =
    episode > 1
      ? [season, episode - 1]
      : prevSeason
        ? [season - 1, prevSeason.episode_count]
        : null;

  const cur = eps.find((item) => item.episode_number === episode);
  const saved = getEntry(key);

  const startAt =
    saved && saved.season === season && saved.episode === episode
      ? saved.position || 0
      : 0;

  const embedEntry = TV_EMBEDS[id]?.[`${season}-${episode}`];
  const hostBuilder = embedEntry ? HOSTS[embedEntry.host] : null;
  const embedSrc =
    hostBuilder && embedEntry?.id ? hostBuilder(embedEntry.id) : null;

  const trailerKey = show?.videos?.results?.find(
    (video) => video.site === "YouTube" && video.type === "Trailer"
  )?.key;

  const handleProgress = (position, duration) => {
    if (!duration) return;

    if (position / duration > 0.95) {
      removeEntry(key);
      return;
    }

    upsert({ id: key, position, duration });
  };

  if (!show) {
    return (
      <div className="tv">
        <div className="tv-wait">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  const bg = (
    <>
      <div
        className="tv-bg"
        style={{
          backgroundImage: show.backdrop_path
            ? `url("${show.background}")`
            : "none",
        }}
      />
      <div className="tv-fade" />
    </>
  );

  if (!playing) {
    return (
      <div className="tv">
        {bg}
        <div className="tv-inner">
          <button className="pill" onClick={() => nav("/")}>
            ← Home
          </button>

          <div className="tv-hero">
            <div className="tags">
              {show.genres?.map((genre) => (
                <span key={typeof genre === "string" ? genre : genre.id}>{typeof genre === "string" ? genre : genre.name}</span>
              ))}
            </div>

            <h1>{show.name}</h1>

            <p className="meta">
              <span className="match">
                {Math.round((show.vote_average || 0) * 10)}% Match
              </span>
              {" · "}
              {show.first_air_date?.slice(0, 4)}
              {" · "}
              {show.number_of_seasons} seasons
              {" · "}⭐ {show.vote_average?.toFixed(1)}
            </p>

            <p className="overview">{show.overview}</p>

            <button className="btn-play" onClick={() => go(season, episode)}>
              ▶ Play S{season} E{episode}
            </button>
          </div>

          <Episodes
            seasons={seasons}
            season={season}
            eps={eps}
            current={null}
            onSeason={(s) => go(s, 1, false)}
            onPick={(e) => go(season, e)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="tv tv-player-page">
      {bg}

      <div className="tv-inner tv-player-inner">
        {/* TOP NAVIGATION */}
        <div className="tv-bar">
          <button className="pill" onClick={() => go(season, episode, false)}>
            ← Details
          </button>

          <nav className="tv-tabs">
            {[
              ["embed", "Embed"],
              ["trailer", "Trailer"],
              ["library", "Library"],
            ].map(([tabKey, label]) => (
              <button
                key={tabKey}
                className={tab === tabKey ? "active" : ""}
                onClick={() => setTab(tabKey)}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        <h2 className="tv-now">
          {show.name} · Season {season} · Episode {episode}
          {cur ? ` · ${cur.name}` : ""}
        </h2>

        {/* LARGE PLAYER */}
        <main className="tv-screen tv-screen-large">
          {tab === "embed" && (
            embedSrc ? (
              <Player
                source={{ type: "iframe", src: embedSrc }}
                title={show.name}
              />
            ) : (
              <CineSrcPlayer
                tmdbId={show.id}
                title={show.name}
                type="tv"
                season={season}
                episode={episode}
              />
            )
          )}

          {tab === "trailer" && (
            trailerKey ? (
              <Player
                source={{
                  type: "iframe",
                  src: `https://www.youtube.com/embed/${trailerKey}`,
                }}
                title={show.name}
              />
            ) : (
              <div className="tv-msg">
                <h3>No trailer available</h3>
              </div>
            )
          )}

          {tab === "library" && (
            libSrc === undefined ? (
              <div className="tv-msg">
                <div className="spinner" />
              </div>
            ) : libSrc ? (
              <Player
                source={{ type: "video", src: libSrc }}
                title={show.name}
                startAt={startAt}
                onProgress={handleProgress}
              />
            ) : (
              <div className="tv-msg">
                <h3>Your own files</h3>
                <p>
                  Put your authorized video at:
                  <br />
                  <code>
                    public/videos/tv/{id}/s{pad(season)}e{pad(episode)}.mp4
                  </code>
                </p>

                <input
                  type="url"
                  placeholder="Paste your authorized video URL"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                />

                {custom.trim() && (
                  <div className="tv-frame">
                    <Player
                      source={{ type: "video", src: custom.trim() }}
                      title={show.name}
                      startAt={startAt}
                      onProgress={handleProgress}
                    />
                  </div>
                )}
              </div>
            )
          )}
        </main>

        {/* CONTROLS - OUTSIDE PLAYER */}
        <div className="tv-controls tv-controls-visible">
          <button
            className="pill"
            disabled={!prevEp}
            onClick={() => prevEp && go(prevEp[0], prevEp[1])}
          >
            ⏮ Previous episode
          </button>

          <span>
            S{season} · E{episode} of {epCount}
          </span>

          <button
            className="pill"
            disabled={!nextEp}
            onClick={() => nextEp && go(nextEp[0], nextEp[1])}
          >
            Next episode ⏭
          </button>
        </div>

        {cur?.overview && <p className="tv-over">{cur.overview}</p>}

        {/* EPISODE LIST */}
        <Episodes
          seasons={seasons}
          season={season}
          eps={eps}
          current={episode}
          onSeason={(s) => go(s, 1)}
          onPick={(e) => go(season, e)}
        />
      </div>
    </div>
  );
}
