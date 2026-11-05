const OMDB_KEY = import.meta.env.VITE_OMDB_KEY;

export const hasOmdbKey = Boolean(OMDB_KEY);

// Returns { id, rating, votes } or null if IMDb has no rating
export async function getImdbRating(imdbId) {
  if (!OMDB_KEY || !imdbId) return null;

  const res = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_KEY}`);
  const d = await res.json();

  if (d.Response === "False" || !d.imdbRating || d.imdbRating === "N/A") return null;

  return {
    id: imdbId,
    rating: parseFloat(d.imdbRating),
    votes: parseInt((d.imdbVotes || "0").replace(/,/g, ""), 10) || 0,
  };
}