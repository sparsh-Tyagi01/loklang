import { useEffect, useState } from "react";
import { fetchSongs, toggleFavorite } from "../api";
import { usePlayer } from "../PlayerContext";
import { useLibraryEvents } from "../useLibraryEvents";
import { Song } from "../types";
import SongRow from "../components/SongRow";
import FolderDropZone from "../components/FolderDropZone";

interface HomeProps {
  onOpenUpload?: () => void;
}

export default function Home({ onOpenUpload }: HomeProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { current, playSong } = usePlayer();
  const libraryVersion = useLibraryEvents();

  useEffect(() => {
    fetchSongs()
      .then(setSongs)
      .finally(() => setLoading(false));
  }, [libraryVersion]);

  async function handleToggleFavorite(songId: string) {
    const updated = await toggleFavorite(songId);
    setSongs((prev) =>
      prev.map((s) => (s.id === songId ? { ...s, isFavorite: updated.isFavorite } : s))
    );
  }

  if (loading) return <p className="empty-state">Loading...</p>;
  if (songs.length === 0) return <FolderDropZone />;

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
