import { Routes, Route, Link } from "react-router-dom";
import { PlayerProvider } from "./PlayerContext";
import Home from "./pages/Home";
import Albums from "./pages/Albums";
import AlbumDetail from "./pages/AlbumDetail";
import Artists from "./pages/Artists";
import ArtistDetail from "./pages/ArtistDetail";

export default function App() {
  return (
    <PlayerProvider>
      <div className="app">
        <header className="app-header">
          <h1>Loklang</h1>
          <nav className="nav">
            <Link to="/">Songs</Link>
            <Link to="/albums">Albums</Link>
            <Link to="/artists">Artists</Link>
          </nav>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/albums" element={<Albums />} />
            <Route path="/albums/:id" element={<AlbumDetail />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/artists/:id" element={<ArtistDetail />} />
          </Routes>
        </main>
      </div>
    </PlayerProvider>
  );
}