import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPlaylists, createPlaylist, deletePlaylist } from "../api";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaylists();
  }, []);

  function loadPlaylists() {
    setLoading(true);
    fetchPlaylists()
      .then(setPlaylists)
      .finally(() => setLoading(false));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await createPlaylist(name.trim());
    setName("");
    loadPlaylists();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this playlist?")) return;
    await deletePlaylist(id);
    loadPlaylists();
  }

  return (
    <div className="detail-page">
      <form className="playlist-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="New playlist name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Create</button>
      </form>

      {loading && <p className="empty-state">Loading...</p>}
      {!loading && playlists.length === 0 && (
        <p className="empty-state">No playlists yet. Create one above.</p>
      )}

      <div className="song-list">
        {playlists.map((pl) => (
          <div key={pl.id} className="song-item">
            <Link to={`/playlists/${pl.id}`} className="song-clickable">
              <div className="cover cover-placeholder" />
              <div className="song-meta">
                <div className="song-title">{pl.name}</div>
                <div className="song-artist">{pl.songs.length} songs</div>
              </div>
            </Link>
            <button className="favorite-btn" onClick={() => handleDelete(pl.id)} title="Delete">
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}