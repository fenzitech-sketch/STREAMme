
import "./CineSrcPlayer.css";

export default function CineSrcPlayer({ title }) {
  return (
    <section className="nova-player">
      <div className="nova-player-top">
        <div>
          <div className="nova-brand">
            NOVA<span>STREAM</span>
          </div>
          <h2>{title}</h2>
          <small>External playback is not configured</small>
        </div>
      </div>

      <div className="nova-screen">
        <div className="nova-loading">
          <strong>NOVA STREAM</strong>
          <span>
            Choose an authorized video source in Nova Library.
          </span>
        </div>
      </div>

      <div className="nova-player-footer">
        <span>NOVA LIBRARY</span>
        <span>POWERED BY NOVASTREAM</span>
      </div>
    </section>
  );
}
