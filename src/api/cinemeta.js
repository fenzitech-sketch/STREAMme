
const BASE_URL = "https://v3-cinemeta.strem.io";

const GENRE_NAMES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "History",
  "Horror",
  "Music",
  "Mystery",
  "Romance",
  "Science Fiction",
  "Thriller",
  "War",
  "Western",
];

export const GENRES = Object.fromEntries(
  GENRE_NAMES.map((name, index) => [
    index + 1,
    { id: index + 1, name },
  ])
);

const GENRE_ID_TO_NAME = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

function normalize(item) {
  if (!item) return null;

  const genres = Array.isArray(item.genres)
    ? item.genres.map((genre) =>
        typeof genre === "string" ? genre : genre.name
      ).filter(Boolean)
    : [];

  const releaseInfo = String(item.releaseInfo || item.year || "");
  const yearMatch = releaseInfo.match(/\d{4}/);

  const rating = Number(item.imdbRating || item.vote_average || 0);

  return {
    ...item,

    id: item.imdb_id || item.id,
    imdb_id: item.imdb_id || item.id,

    title: item.name || item.title || "Untitled",
    name: item.name || item.title || "Untitled",

    poster: item.poster || item.poster_path || "",
    poster_path: item.poster || item.poster_path || "",

    background: item.background || item.banner || item.poster || "",
    backdrop_path:
      item.background || item.banner || item.poster || "",

    overview: item.description || item.overview || "",
    release_date: yearMatch ? `${yearMatch[0]}-01-01` : "",
    releaseInfo,

    vote_average: Number.isFinite(rating) ? rating : 0,

    genres,
    genre_ids: genres.map((name) => {
      const entry = Object.entries(GENRE_ID_TO_NAME)
        .find(([, value]) => value.toLowerCase() === name.toLowerCase());

      return entry ? Number(entry[0]) : 0;
    }).filter(Boolean),

    mediaType: item.type === "series" ? "tv" : "movie",
    media_type: item.type === "series" ? "tv" : "movie",

    runtime: parseRuntime(item.runtime),
  };
}

function parseRuntime(runtime) {
  if (!runtime) return 0;

  const match = String(runtime).match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

async function request(path) {
  const response = await fetch(`${BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(
      `Cinemeta request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

async function getCatalog(type = "movie", extra = "") {
  const path = extra
    ? `/catalog/${type}/top/${extra}.json`
    : `/catalog/${type}/top.json`;

  const data = await request(path);

  return {
    results: (data.metas || []).map(normalize).filter(Boolean),
  };
}

// Movie catalogs

export function getTrending() {
  return getCatalog("movie");
}

export function getTopRated() {
  return getCatalog("movie");
}

export function getPopularMovies() {
  return getCatalog("movie");
}

export function getByGenre(genre) {
  const genreName =
    typeof genre === "number"
      ? GENRE_ID_TO_NAME[genre]
      : String(genre || "");

  if (!genreName) return getCatalog("movie");

  return getCatalog(
    "movie",
    `genre=${encodeURIComponent(genreName)}`
  );
}

// Series catalogs

export function getTrendingSeries() {
  return getCatalog("series");
}

export function getPopularSeries() {
  return getCatalog("series");
}

export function getTopRatedSeries() {
  return getCatalog("series");
}

// Search both movies and series

async function searchType(type, query) {
  const safeQuery = encodeURIComponent(query.trim());

  const data = await request(
    `/catalog/${type}/top/search=${safeQuery}.json`
  );

  return (data.metas || []).map(normalize).filter(Boolean);
}

export async function searchAll(query) {
  if (!query || query.trim().length < 2) return [];

  const results = await Promise.allSettled([
    searchType("movie", query),
    searchType("series", query),
  ]);

  return results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );
}

export async function search(query) {
  return {
    results: await searchType("movie", query),
  };
}

export async function searchSeries(query) {
  return {
    results: await searchType("series", query),
  };
}

// Full movie and series metadata

export async function getMovie(id) {
  const data = await request(
    `/meta/movie/${encodeURIComponent(id)}.json`
  );

  if (!data.meta) {
    throw new Error("Movie metadata not found.");
  }

  return normalize(data.meta);
}

export async function getTV(id) {
  const data = await request(
    `/meta/series/${encodeURIComponent(id)}.json`
  );

  if (!data.meta) {
    throw new Error("Series metadata not found.");
  }

  const show = normalize(data.meta);

  return {
    ...show,
    seasons: getSeasonNumbers(data.meta.videos || []).map((season) => ({
      id: season,
      season_number: season,
      name: `Season ${season}`,
      episode_count: (data.meta.videos || []).filter(
        (video) => Number(video.season) === season
      ).length,
    })),
    videos: data.meta.videos || [],
  };
}

export const getSeries = getTV;

function getSeasonNumbers(videos) {
  return [...new Set(
    videos.map((video) => Number(video.season || 0))
      .filter((season) => season > 0)
  )].sort((a, b) => a - b);
}

export async function getSeason(id, seasonNumber) {
  const show = await getTV(id);

  const episodes = (show.videos || [])
    .filter((video) => Number(video.season) === Number(seasonNumber))
    .map((video) => ({
      ...video,
      id: video.id,
      name: video.name || `Episode ${video.episode}`,
      episode_number: Number(video.episode || 0),
      season_number: Number(video.season || 0),
      overview: video.overview || "",
      still_path: video.thumbnail || "",
    }));

  return {
    id,
    season_number: Number(seasonNumber),
    episodes,
  };
}

// Random selections

export async function getRandomMovie() {
  const data = await getTrending();

  if (!data.results.length) {
    throw new Error("No movies are available.");
  }

  return data.results[
    Math.floor(Math.random() * data.results.length)
  ];
}

export async function getRandomTV() {
  const data = await getTrendingSeries();

  if (!data.results.length) {
    throw new Error("No series are available.");
  }

  return data.results[
    Math.floor(Math.random() * data.results.length)
  ];
}

export async function getExternalIds(id) {
  return {
    imdb_id: id,
    imdbId: id,
  };
}

// Mood recommendations

const MOOD_GENRES = {
  happy: "Comedy",
  funny: "Comedy",
  sad: "Drama",
  romantic: "Romance",
  romance: "Romance",
  scary: "Horror",
  horror: "Horror",
  action: "Action",
  adventurous: "Adventure",
  mystery: "Mystery",
  thriller: "Thriller",
  relaxed: "Family",
};

export function getByMood(mood) {
  const genre =
    MOOD_GENRES[String(mood || "").toLowerCase()] ||
    String(mood || "");

  return getByGenre(genre);
}

// Kept for older imports while components are being updated.
export const IMG = "";
