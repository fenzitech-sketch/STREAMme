
import { useEffect, useState } from "react";
import "./CineSrcPlayer.css";

export default function CineSrcPlayer({
  tmdbId,
  title,
  type = "movie",
  season = 1,
  episode = 1,
}) {
  const storageKey = `cinesrc_${type}_${tmdbId || title}`;

  const [id, setId] = useState(() => {
    if (/^\d+$/.test(String(tmdbId || ""))) {
      return String(tmdbId);
    }

    try {
      return localStorage.getItem(storageKey) || "";
    } catch {
      return "";
    }
  });

  const [currentSeason, setCurrentSeason] = useState(season);
  const [currentEpisode, setCurrentEpisode] = useState(episode);

  useEffect(() => {
    if (!id) return;

    try {
      localStorage.setItem(storageKey, id);
    } catch {
      // Storage may be unavailable.
    }
  }, [id, storageKey]);

  const validId = /^\d+$/.test(id);

  const embedUrl =
    type === "tv"
      ? `https://cinesrc.st/embed/tv/${id}?s=${currentSeason}&e=${currentEpisode}`
      : `https://cinesrc.st/embed/movie/${id}`;

  return (
    <section className="nova-player">
      <header className="nova-player-top">
        <div>
          <div className="nova-brand">
            NOVA<span>STREAM</span>
          </div>
          <h2>{title || "Now Playing"}</h2>
          <small>CineSrc Embed Player</small>
        </div>
      </header>

      {!validId ? (
        <div className="nova-id-form">
          <h3>Connect CineSrc</h3>
          <p>
            Enter the numeric TMDB ID for this title.
            Cinemeta IMDb IDs cannot be used directly.
          </p>

          <input
            id="cinesrc-tmdb-id"
            name="cinesrc-tmdb-id"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Example: 603"
            value={id}
            onChange={(event) =>
              setId(event.target.value.replace(/\D/g, ""))
            }
          />

          <p className="nova-id-help">
            The ID will be remembered on this device.
          </p>
        </div>
      ) : (
        <>
          {type === "tv" && (
            <div className="nova-episode-controls">
              <label>
                Season
                <input
                  type="number"
                  min="1"
                  value={currentSeason}
                  onChange={(event) =>
                    setCurrentSeason(
                      Math.max(1, Number(event.target.value))
                    )
                  }
                />
              </label>

              <label>
                Episode
                <input
                  type="number"
                  min="1"
                  value={currentEpisode}
                  onChange={(event) =>
                    setCurrentEpisode(
                      Math.max(1, Number(event.target.value))
                    )
                  }
                />
              </label>
            </div>
          )}

          <div className="nova-screen">
            <iframe
              key={embedUrl}
              src={embedUrl}
              title={`${title || "CineSrc"} player`}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>

          <button
            className="nova-change-id"
            onClick={() => setId("")}
          >
            Change TMDB ID
          </button>
        </>
      )}

      <footer className="nova-player-footer">
        <span>CINESRC PLAYER</span>
        <span>METADATA BY CINEMETA</span>
      </footer>
    </section>
  );
}
