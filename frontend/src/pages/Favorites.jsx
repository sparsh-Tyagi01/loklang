import { useEffect, useState } from "react";
import { fetchFavorites, toggleFavorite } from "../api";
import { usePlayer } from "../PlayerContext";
import SongRow from "../components/SongRow";

export default function Favorites() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { current, playSong } = usePlayer();

  useEffect(() => {
    fetchFavorites()
      .then(setSongs)
      .finally(() => setLoading(false));
  }, []);

  async function handleToggleFavorite(songId) {
    await toggleFavorite(songId);
    // Favorites list se turant hata do (unfavorite karne pe)
    setSongs((prev) => prev.filter((s) => s.id !== songId));
  }

  if (loading) return <p className="empty-state">Loading...</p>;
  if (songs.length === 0) return <p className="empty-state">No favorites yet. Tap the heart icon on any song.</p>;

  return (
    <div className="song-list">
      {songs.map((song) => (
        <SongRow
          key={song.id}
          song={song}
          isActive={current?.id === song.id}
          onPlay={() => playSong(song)}
          onToggleFavorite={handleToggleFavorite}
        />
      ))}
    </div>
  );
}