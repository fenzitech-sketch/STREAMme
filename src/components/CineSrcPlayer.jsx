
import { useEffect, useState } from "react";
import "./CineSrcPlayer.css";

export default function CineSrcPlayer({
  tmdbId,
  title,
  type = "movie",
  season = 1,
  episode = 1,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Keep the existing movie URL.
  const movieUrl = `https://cinesrc.st/embed/movie/${tmdbId}`;

  // TV URL placeholder.
  // Add an authorized TV provider URL when available.
  const tvUrl = `https://cinesrc.st/embed/tv/${tmdbId}?s=${season}&e=${episode}`;

  const playerUrl = type === "tv" ? tvUrl : movieUrl;

  useEffect(() => {
    setLoading(Boolean(playerUrl));
    setError(false);

    if (!playerUrl) return;

    const handleMessage = (event) => {
      if (event.origin !== "https://cinesrc.st") return;

      const messageType = event.data?.type;

      if (
        messageType === "cinesrc:ready" ||
        messageType === "cinesrc:play"
      ) {
        setLoading(false);
      }

      if (messageType === "cinesrc:error") {
        setLoading(false);
        setError(true);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [tmdbId, season, episode, playerUrl]);

  return (
    <section className="nova-player">
      <div className="nova-player-top">
        <div>
          <div className="nova-brand">
            NOVA<span>STREAM</span>
          </div>

          <h2>{title}</h2>

          <small>
            {type === "tv"
              ? `Season ${season} · Episode ${episode}`
              : "CineSrc playback"}
          </small>
        </div>

        <span className="nova-live">● PLAYER</span>
      </div>

      <div className="nova-screen">
        {!playerUrl ? (
          <div className="nova-loading">
            <strong>NOVA STREAM</strong>
            <span>
              TV embed placeholder — source not configured.
            </span>
            <small>
              TMDB ID: {tmdbId} · S{season} E{episode}
            </small>
          </div>
        ) : (
          <>
            {loading && !error && (
              <div className="nova-loading">
                <div className="nova-spinner" />
                <strong>NOVA STREAM</strong>
                <span>Loading player...</span>
              </div>
            )}

            {error ? (
              <div className="nova-loading">
                Player reported an error.
                <button onClick={() => window.location.reload()}>
                  Retry
                </button>
              </div>
            ) : (
              <iframe
                key={`${tmdbId}-${season}-${episode}-${type}`}
                src={playerUrl}
                title={title}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            )}
          </>
        )}
      </div>

      <div className="nova-player-footer">
        <span>CINESRC</span>
        <span>POWERED BY NOVASTREAM</span>
      </div>
    </section>
  );
}
