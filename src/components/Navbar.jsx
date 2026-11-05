import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="nav">
      <Link to="/" className="nav-logo">🎬</Link>
      <Link to="/">Movies</Link>
      <Link to="/">Trending</Link>
    </nav>
  );
}