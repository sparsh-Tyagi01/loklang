import { useEffect, useState } from "react";
import { fetchSongs, toggleFavorite } from "../api";
import { usePlayer } from "../PlayerContext";
import SongRow from "../components/SongRow";

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { current, playSong } = usePlayer();

  useEffect(() => {
    fetchSongs()
      .then(setSongs)
      .finally(() => setLoading(false));
  }, []);

  async function handleToggleFavorite(songId) {
    const updated = await toggleFavorite(songId);
    setSongs((prev) => prev.map((s) => (s.id === songId ? { ...s, isFavorite: updated.isFavorite } : s)));
  }

  if (loading) return <p className="empty-state">Loading...</p>;
  if (songs.length === 0) return <p className="empty-state">No songs found.</p>;

  return (
    <div className="song-list">
      {songs.map((song) => (
        <SongRow
          key={song.id}
          song={song}
          isActive={current?.id === song.id}
          onPlay={() => playSong(song)}
          onToggleFavorite={handleToggleFavorite}
          showAddToPlaylist
        />
      ))}
    </div>
  );
}