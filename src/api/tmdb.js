
const KEY = import.meta.env.VITE_TMDB_KEY;
const BASE = "https://api.themoviedb.org/3";

export const IMG = "https://image.tmdb.org/t/p";

async function get(path, params = {}) {
  if (!KEY) {
    throw new Error("VITE_TMDB_KEY is missing from .env");
  }

  const qs = new URLSearchParams({
    api_key: KEY,
    ...params,
  });

  const response = await fetch(`${BASE}${path}?${qs}`);

  if (!response.ok) {
    throw new Error(`TMDB error: ${response.status}`);
  }

  return response.json();
}

// GENRES
export const GENRES = {
  28: { id: 28, name: "Action" },
  12: { id: 12, name: "Adventure" },
  16: { id: 16, name: "Animation" },
  35: { id: 35, name: "Comedy" },
  80: { id: 80, name: "Crime" },
  99: { id: 99, name: "Documentary" },
  18: { id: 18, name: "Drama" },
  10751: { id: 10751, name: "Family" },
  14: { id: 14, name: "Fantasy" },
  36: { id: 36, name: "History" },
  27: { id: 27, name: "Horror" },
  10402: { id: 10402, name: "Music" },
  9648: { id: 9648, name: "Mystery" },
  10749: { id: 10749, name: "Romance" },
  878: { id: 878, name: "Sci-Fi" },
  53: { id: 53, name: "Thriller" },
  10752: { id: 10752, name: "War" },
  37: { id: 37, name: "Western" },
};

// MOVIES
export const getTrending = () => get("/trending/movie/week");

export const getTopRated = () => get("/movie/top_rated");

export const getPopularMovies = () => get("/movie/popular");

export const getMovie = (id) =>
  get(`/movie/${id}`, {
    append_to_response: "videos,external_ids",
  });

export const getByGenre = (id) =>
  get("/discover/movie", {
    with_genres: id,
    sort_by: "popularity.desc",
  });

export const search = (query) =>
  get("/search/movie", { query });

// MOOD RECOMMENDATIONS
export const getByMood = async (mood) => {
  if (!mood || !mood.genres) {
    throw new Error("Invalid mood selection");
  }

  const params = {
    with_genres: mood.genres,
    sort_by: "popularity.desc",
    include_adult: "false",
    page: String(Math.floor(Math.random() * 5) + 1),
    "vote_count.gte": "30",
  };

  if (mood.minRating) {
    params["vote_average.gte"] = String(mood.minRating);
  }

  if (mood.extra) {
    Object.assign(params, mood.extra);
  }

  const data = await get("/discover/movie", params);

  return (data.results || []).filter(
    (movie) => movie.poster_path && movie.title
  );
};

// TV SERIES
export const getTrendingSeries = () =>
  get("/trending/tv/week");

export const getPopularSeries = () =>
  get("/tv/popular");

export const getTopRatedSeries = () =>
  get("/tv/top_rated");

export const getTV = (id) =>
  get(`/tv/${id}`, {
    append_to_response: "videos,external_ids",
  });

export const getSeries = getTV;

export const getSeason = (seriesId, seasonNumber) =>
  get(`/tv/${seriesId}/season/${seasonNumber}`);

export const searchSeries = (query) =>
  get("/search/tv", { query });

// COMBINED MOVIE + TV SEARCH
export const searchAll = async (query) => {
  const q = query.trim();

  if (!q) return [];

  const data = await get("/search/multi", {
    query: q,
    include_adult: "false",
  });

  return (data.results || [])
    .filter(
      (item) =>
        item.media_type === "movie" ||
        item.media_type === "tv"
    )
    .map((item) => ({
      ...item,
      mediaType: item.media_type,
      displayTitle:
        item.media_type === "movie" ? item.title : item.name,
      displayDate:
        item.media_type === "movie"
          ? item.release_date
          : item.first_air_date,
    }));
};

// RANDOM MOVIE / TV PICK
async function getRandomTitle(type) {
  const page = Math.floor(Math.random() * 20) + 1;

  const data = await get(`/discover/${type}`, {
    sort_by: "popularity.desc",
    "vote_count.gte": "100",
    page: String(page),
  });

  const results = (data.results || []).filter(
    (item) => item.poster_path && item.genre_ids?.length
  );

  if (!results.length) {
    throw new Error(`No random ${type} found`);
  }

  return results[
    Math.floor(Math.random() * results.length)
  ];
}

export const getRandomMovie = () =>
  getRandomTitle("movie");

export const getRandomTV = () =>
  getRandomTitle("tv");

// EXTERNAL IDS
export const getExternalIds = (mediaType, id) => {
  // Backward compatibility for getExternalIds(id)
  if (typeof mediaType === "number") {
    id = mediaType;
    mediaType = "movie";
  }

  if (!["movie", "tv"].includes(mediaType)) {
    throw new Error("Invalid media type");
  }

  return get(`/${mediaType}/${id}/external_ids`);
};
