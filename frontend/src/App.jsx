import { Routes, Route, Link } from "react-router-dom";
import { PlayerProvider } from "./PlayerContext";
import Home from "./pages/Home";
import Albums from "./pages/Albums";
import AlbumDetail from "./pages/AlbumDetail";
import Artists from "./pages/Artists";
import ArtistDetail from "./pages/ArtistDetail";
import Favorites from "./pages/Favorites";
import Playlists from "./pages/Playlists";
import PlaylistDetail from "./pages/PlaylistDetail";

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
            <Link to="/favorites">Favorites</Link>
            <Link to="/playlists">Playlists</Link>
          </nav>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/albums" element={<Albums />} />
            <Route path="/albums/:id" element={<AlbumDetail />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/artists/:id" element={<ArtistDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/playlists/:id" element={<PlaylistDetail />} />
          </Routes>
        </main>
      </div>
    </PlayerProvider>
  );
}