import { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import Hero from "../components/Hero";
import ContinueRow from "../components/ContinueRow";
import Top10Row from "../components/Top10Row";
import Row from "../components/Row";
import MovieCard from "../components/MovieCard";
import { getTrending, getTopRated, getByGenre } from "../api/tmdb";
import "./Home.css";

const CHIPS = [
  { label: "All Movies", id: null },
  { label: "Action", id: 28 },
  { label: "Sci-Fi", id: 878 },
  { label: "Adventure", id: 12 },
  { label: "Fantasy", id: 14 },
  { label: "Thriller", id: 53 },
  { label: "Comedy", id: 35 },
  { label: "Horror", id: 27 },
  { label: "Mystery", id: 9648 },
  { label: "Crime", id: 80 },
  { label: "Romance", id: 10749 },
];

function GenreGrid({ genreId }) {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    setMovies([]);
    getByGenre(genreId).then((d) => setMovies(d.results.filter((m) => m.poster_path)));
  }, [genreId]);

  return (
    <div className="grid">
      {movies.map((m) => <MovieCard key={m.id} movie={m} />)}
    </div>
  );
}

export default function Home() {
  const [genre, setGenre] = useState(null);

  return (
    <>
      <TopBar />

      {genre === null && <Hero />}

      <div className={`chips ${genre !== null ? "solo" : ""}`}>
        {CHIPS.map((c) => (
          <button
            key={c.label}
            className={genre === c.id ? "on" : ""}
            onClick={() => setGenre(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {genre === null ? (
        <>
          <ContinueRow />
          <Top10Row />
          <Row title="Trending Movies" fetcher={getTrending} />
          <Row title="Action Blockbusters" fetcher={() => getByGenre(28)} />
          <Row title="Sci-Fi & Cyberpunk" fetcher={() => getByGenre(878)} />
          <Row title="Comedy & Fun" fetcher={() => getByGenre(35)} />
          <Row title="Horror & Thrillers" fetcher={() => getByGenre(27)} />
          <Row title="Crime & Heist" fetcher={() => getByGenre(80)} />
          <Row title="Top Rated" fetcher={getTopRated} />
        </>
      ) : (
        <GenreGrid genreId={genre} />
      )}

      <footer className="foot">NOVASTREAM · Movie data from TMDB</footer>
    </>
  );
}