import { useEffect, useState } from "react";
import { fetchPlaylists, addSongToPlaylist } from "../api";

export default function AddToPlaylistButton({ songId }) {
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    if (open) fetchPlaylists().then(setPlaylists);
  }, [open]);

  async function handleAdd(playlistId) {
    await addSongToPlaylist(playlistId, songId);
    setOpen(false);
  }

  return (
    <div className="add-to-playlist">
      <button
        className="favorite-btn"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        title="Add to playlist"
      >
        +
      </button>

      {open && (
        <div className="playlist-dropdown" onClick={(e) => e.stopPropagation()}>
          {playlists.length === 0 && <div className="dropdown-empty">No playlists yet</div>}
          {playlists.map((pl) => (
            <div key={pl.id} className="dropdown-item" onClick={() => handleAdd(pl.id)}>
              {pl.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}