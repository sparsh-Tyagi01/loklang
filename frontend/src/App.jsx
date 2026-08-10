import { useState } from "react";
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
import Connect from "./pages/Connect";
import FolderDropZone from "./components/FolderDropZone";

export default function App() {
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <PlayerProvider>
      <div className="app">
        <header className="app-header">
          <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
            <h1>Loklang</h1>
            <button
              className="upload-btn-header"
              onClick={() => setShowUploadModal(true)}
            >
              + Upload Music Folder
            </button>
          </div>
          <nav className="nav">
            <Link to="/">Songs</Link>
            <Link to="/albums">Albums</Link>
            <Link to="/artists">Artists</Link>
            <Link to="/favorites">Favorites</Link>
            <Link to="/playlists">Playlists</Link>
            <Link to="/connect">Connect</Link>
          </nav>
        </header>

        {showUploadModal && (
          <FolderDropZone
            onClose={() => setShowUploadModal(false)}
            onComplete={() => setShowUploadModal(false)}
          />
        )}

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home onOpenUpload={() => setShowUploadModal(true)} />} />
            <Route path="/albums" element={<Albums />} />
            <Route path="/albums/:id" element={<AlbumDetail />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/artists/:id" element={<ArtistDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/playlists/:id" element={<PlaylistDetail />} />
            <Route path="/connect" element={<Connect />} />
          </Routes>
        </main>
      </div>
    </PlayerProvider>
  );
}