import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Movie from "./pages/Movie";
import Watch from "./pages/Watch";
import TV from "./pages/TV";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/movie/:id" element={<Movie />} />
      <Route path="/watch/:id" element={<Watch />} />
      <Route path="/tv/:id" element={<TV />} />
    </Routes>
  );
}