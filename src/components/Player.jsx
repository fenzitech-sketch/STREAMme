const ALLOWED_HOSTS = ["www.youtube.com", "archive.org", "player.vimeo.com"];

export function isAllowed(src) {
  try {
    const url = new URL(src, window.location.origin);
    if (url.origin === window.location.origin) return true;
    if (url.hostname === "localhost") return true;
    return ALLOWED_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

export default function Player({ source, title, startAt = 0, onProgress }) {
  if (!source) return <div className="player-el" />;

  if (!isAllowed(source.src)) {
    return (
      <div className="watch-msg">
        <p>This source isn't on the allowed list.</p>
      </div>
    );
  }

  if (source.type === "video") {
    let last = 0;
    return (
      <video
        key={source.src}
        className="player-el"
        src={source.src}
        controls
        autoPlay
        onLoadedMetadata={(e) => {
          if (startAt > 0 && startAt < e.target.duration - 5) {
            e.target.currentTime = startAt;
          }
        }}
        onTimeUpdate={(e) => {
          const t = e.target.currentTime;
          // report every ~5 seconds, not on every frame
          if (onProgress && Math.abs(t - last) >= 5) {
            last = t;
            onProgress(t, e.target.duration);
          }
        }}
        onPause={(e) => onProgress?.(e.target.currentTime, e.target.duration)}
      />
    );
  }

  return (
    <iframe
      key={source.src}
      className="player-el"
      src={source.src}
      title={title}
      sandbox="allow-scripts allow-same-origin allow-presentation"
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}