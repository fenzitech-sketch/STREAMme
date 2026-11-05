import { useEffect, useState } from "react";

const KEY = "continue";

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}

function write(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
  window.dispatchEvent(new Event("continue-changed"));
}

export function getEntry(id) {
  return read().find((x) => String(x.id) === String(id));
}

// Add or update a movie, move it to the front
export function upsert(entry) {
  const list = read();
  const old = list.find((x) => x.id === entry.id);
  const merged = { ...old, ...entry, updatedAt: Date.now() };
  write([merged, ...list.filter((x) => x.id !== entry.id)].slice(0, 20));
}

export function removeEntry(id) {
  write(read().filter((x) => x.id !== id));
}

export function clearAll() {
  write([]);
}

// React hook: re-renders whenever the list changes
export default function useContinueWatching() {
  const [list, setList] = useState(read);

  useEffect(() => {
    const sync = () => setList(read());
    window.addEventListener("continue-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("continue-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return list;
}