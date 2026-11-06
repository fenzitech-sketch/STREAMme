
const KEY = import.meta.env.VITE_TMDB_KEY;
const BASE = "https://api.themoviedb.org/3";

export const IMG = "https://image.tmdb.org/t/p";

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

// Local catalog: works without a TMDB API request.
export const LOCAL_MOVIES = [
  {
    id: 27205,
    title: "Inception",
    overview: "A skilled thief enters people's dreams to steal secrets, but receives a challenging mission of his own.",
    release_date: "2010-07-16",
    vote_average: 8.4,
    vote_count: 30000,
    genre_ids: [28, 878, 12],
    runtime: 148,
    poster_path: null,
    backdrop_path: null,
  },
  {
    id: 157336,
    title: "Interstellar",
    overview: "A team of explorers travels beyond this galaxy to discover whether mankind has a future among the stars.",
    release_date: "2014-11-07",
    vote_average: 8.5,
    vote_count: 35000,
    genre_ids: [12, 18, 878],
    runtime: 169,
    poster_path: null,
    backdrop_path: null,
  },
  {
    id: 155,
    title: "The Dark Knight",
    overview: "Batman faces a criminal mastermind who brings chaos to Gotham City.",
    release_date: "2008-07-18",
    vote_average: 8.5,
    vote_count: 33000,
    genre_ids: [28, 80, 18],
    runtime: 152,
    poster_path: null,
    backdrop_path: null,
  },
  {
    id: 438631,
    title: "Dune",
    overview: "A young heir travels to a dangerous desert planet that holds the key to his family's future.",
    release_date: "2021-10-22",
    vote_average: 7.8,
    vote_count: 12000,
    genre_ids: [878, 12],
    runtime: 155,
    poster_path: null,
    backdrop_path: null,
  },
  {
    id: 872585,
    title: "Oppenheimer",
    overview: "The story of the scientist whose work helped change the course of history.",
    release_date: "2023-07-21",
    vote_average: 8.1,
    vote_count: 10000,
    genre_ids: [18, 36],
    runtime: 180,
    poster_path: null,
    backdrop_path: null,
  },
  {
    id: 324857,
    title: "Spider-Man: Into the Spider-Verse",
    overview: "A teenager discovers a world of different Spider-heroes across dimensions.",
    release_date: "2018-12-14",
    vote_average: 8.4,
    vote_count: 15000,
    genre_ids: [28, 12, 16],
    runtime: 117,
    poster_path: null,
    backdrop_path: null,
  },
  {
    id: 603,
    title: "The Matrix",
    overview: "A computer programmer discovers that reality is not what it seems.",
    release_date: "1999-03-31",
    vote_average: 8.2,
    vote_count: 25000,
    genre_ids: [28, 878],
    runtime: 136,
    poster_path: null,
    backdrop_path: null,
  },
  {
    id: 278,
    title: "The Shawshank Redemption",
    overview: "Two prisoners develop an unexpected friendship while holding on to hope.",
    release_date: "1994-09-23",
    vote_average: 8.7,
    vote_count: 25000,
    genre_ids: [18, 80],
    runtime: 142,
    poster_path: null,
    backdrop_path: null,
  },
  {
    id: 496243,
    title: "Parasite",
    overview: "Two families from very different backgrounds become unexpectedly connected.",
    release_date: "2019-05-30",
    vote_average: 8.5,
    vote_count: 18000,
    genre_ids: [35, 18, 53],
    runtime: 132,
    poster_path: null,
    backdrop_path: null,
  },
  {
    id: 299534,
    title: "Avengers: Endgame",
    overview: "The remaining heroes unite for one final attempt to restore their world.",
    release_date: "2019-04-26",
    vote_average: 8.2,
    vote_count: 25000,
    genre_ids: [28, 12, 878],
    runtime: 181,
    poster_path: null,
    backdrop_path: null,
  },
];

function response(results) {
  return {
    page: 1,
    results,
    total_pages: 1,
    total_results: results.length,
  };
}

function localGenres(movie) {
  return (movie.genre_ids || []).map((id) => GENRES[id]).filter(Boolean);
}

async function get(path, params = {}) {
  if (!KEY) {
    throw new Error("TMDB API key is unavailable");
  }

  const qs = new URLSearchParams({
    api_key: KEY,
    ...params,
  });

  const res = await fetch(`${BASE}${path}?${qs}`);

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status}`);
  }

  return res.json();
}

async function remoteOrLocal(path, params, fallback) {
  try {
    return await get(path, params);
  } catch (error) {
    console.warn("Using local movie catalog:", error.message);
    return response(fallback());
  }
}

// MOVIES
export const getTrending = () =>
  remoteOrLocal(
    "/trending/movie/week",
    {},
    () => LOCAL_MOVIES
  );

export const getTopRated = () =>
  remoteOrLocal(
    "/movie/top_rated",
    {},
    () => [...LOCAL_MOVIES].sort(
      (a, b) => b.vote_average - a.vote_average
    )
  );

export const getPopularMovies = () =>
  remoteOrLocal(
    "/movie/popular",
    {},
    () => LOCAL_MOVIES
  );

export async function getMovie(id) {
  try {
    return await get(`/movie/${id}`, {
      append_to_response: "videos,external_ids",
    });
  } catch (error) {
    const movie = LOCAL_MOVIES.find(
      (item) => String(item.id) === String(id)
    );

    if (movie) {
      return {
        ...movie,
        genres: localGenres(movie),
        original_title: movie.title,
        videos: { results: [] },
        external_ids: {},
      };
    }

    throw error;
  }
}

export const getByGenre = (id) =>
  remoteOrLocal(
    "/discover/movie",
    {
      with_genres: id,
      sort_by: "popularity.desc",
    },
    () => LOCAL_MOVIES.filter(
      (movie) => movie.genre_ids.includes(Number(id))
    )
  );

export async function search(query) {
  const q = query.trim();

  if (!q) return response([]);

  return remoteOrLocal(
    "/search/movie",
    { query: q },
    () => LOCAL_MOVIES.filter(
      (movie) => movie.title.toLowerCase().includes(q.toLowerCase())
    )
  );
}

// MOOD RECOMMENDATIONS
export async function getByMood(mood) {
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

  return remoteOrLocal(
    "/discover/movie",
    params,
    () => LOCAL_MOVIES.filter((movie) =>
      movie.genre_ids.some((id) =>
        String(mood.genres).split(",").includes(String(id))
      )
    )
  );
}

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

// COMBINED SEARCH
export async function searchAll(query) {
  const q = query.trim();

  if (!q) return [];

  try {
    const data = await get("/search/multi", {
      query: q,
      include_adult: "false",
    });

    return (data.results || [])
      .filter((item) =>
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
  } catch (error) {
    console.warn("Search using local catalog:", error.message);

    return LOCAL_MOVIES
      .filter((movie) =>
        movie.title.toLowerCase().includes(q.toLowerCase())
      )
      .map((movie) => ({
        ...movie,
        mediaType: "movie",
        displayTitle: movie.title,
        displayDate: movie.release_date,
      }));
  }
}

// RANDOM MOVIE / TV
export async function getRandomMovie() {
  try {
    const page = Math.floor(Math.random() * 20) + 1;
    const data = await get("/discover/movie", {
      sort_by: "popularity.desc",
      "vote_count.gte": "100",
      page: String(page),
    });

    const results = (data.results || []).filter(
      (item) => item.poster_path && item.genre_ids?.length
    );

    if (results.length) {
      return results[Math.floor(Math.random() * results.length)];
    }
  } catch (error) {
    console.warn("Random movie using local catalog:", error.message);
  }

  return LOCAL_MOVIES[
    Math.floor(Math.random() * LOCAL_MOVIES.length)
  ];
}

export async function getRandomTV() {
  const page = Math.floor(Math.random() * 20) + 1;

  const data = await get("/discover/tv", {
    sort_by: "popularity.desc",
    "vote_count.gte": "100",
    page: String(page),
  });

  const results = (data.results || []).filter(
    (item) => item.poster_path && item.genre_ids?.length
  );

  if (!results.length) {
    throw new Error("No random TV series found");
  }

  return results[Math.floor(Math.random() * results.length)];
}

// EXTERNAL IDS
export async function getExternalIds(mediaType, id) {
  if (typeof mediaType === "number") {
    id = mediaType;
    mediaType = "movie";
  }

  if (!["movie", "tv"].includes(mediaType)) {
    throw new Error("Invalid media type");
  }

  try {
    return await get(`/${mediaType}/${id}/external_ids`);
  } catch (error) {
    const movie = LOCAL_MOVIES.find(
      (item) => String(item.id) === String(id)
    );

    if (movie) return {};
    throw error;
  }
}

