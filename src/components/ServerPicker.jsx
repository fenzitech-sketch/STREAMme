import { useState } from "react";
import "./ServerPicker.css";

export default function ServerPicker({
  servers,
  sources,
  activeId,
  onSelect,
  onReload,
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("direct");

  const active = servers.find((s) => s.id === activeId);
  const list = servers.filter((s) => s.group === tab);

  const count = (group) =>
    servers.filter((s) => s.group === group).length;

  const status = (server) => {
    const source = sources[server.id];

    if (source === undefined) return "Checking...";
    if (source === null) return "Unavailable";
    if (server.id === activeId) return "Selected";

    return "Available";
  };

  return (
    <div className="sp">
      <button
        className="sp-btn"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="dot" />
        {active?.name || "Choose provider"}
        <span>{open ? "⌃" : "⌄"}</span>
      </button>

      {open && (
        <div className="sp-panel">
          <h3>Playback providers</h3>

          <div className="sp-tabs">
            {["direct", "embedded"].map((group) => (
              <button
                key={group}
                className={tab === group ? "on" : ""}
                onClick={() => setTab(group)}
              >
                {group === "direct" ? "Direct" : "Embedded"}
                <span className="count">{count(group)}</span>
              </button>
            ))}
          </div>

          {list.map((server) => {
            const source = sources[server.id];
            const unavailable = source === null;
            const checking = source === undefined;

            return (
              <button
                key={server.id}
                className={`sp-item ${
                  server.id === activeId ? "active" : ""
                }`}
                disabled={checking}
                onClick={() => {
                  if (unavailable) {
                    onReload(server);
                    return;
                  }

                  onSelect(server.id);
                  setOpen(false);
                }}
              >
                <div>
                  <strong>{server.name}</strong>
                  <small>
                    {unavailable
                      ? "Not available for this title"
                      : server.desc}
                  </small>
                </div>

                <span className="st">{status(server)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}