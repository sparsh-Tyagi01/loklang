import { useState, useEffect } from "react";
import { fetchPlaylists, addSongToPlaylist } from "../api";
import { Playlist } from "../types";

interface AddToPlaylistButtonProps {
  songId: string;
}

export default function AddToPlaylistButton({ songId }: AddToPlaylistButtonProps) {
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchPlaylists().then(setPlaylists);
    }
  }, [open]);

  async function handleAdd(playlistId: string, name: string) {
    await addSongToPlaylist(playlistId, songId);
    setOpen(false);
    setAddedMessage(`Added to ${name}!`);
    setTimeout(() => setAddedMessage(null), 2000);
  }

  return (
    <div className="add-to-playlist">
      <button
        className="favorite-btn"
        onClick={() => setOpen(!open)}
        title="Add to playlist"
      >
        +
      </button>

      {addedMessage && (
        <span style={{ fontSize: "0.75rem", color: "#2ecc71", marginLeft: "0.4rem" }}>
          {addedMessage}
        </span>
      )}

      {open && (
        <div className="playlist-dropdown">
          {playlists.length === 0 ? (
            <div className="dropdown-empty">No playlists. Create one first.</div>
          ) : (
            playlists.map((pl) => (
              <div
                key={pl.id}
                className="dropdown-item"
                onClick={() => handleAdd(pl.id, pl.name)}
              >
                {pl.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
