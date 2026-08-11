import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPlaylistById, removeSongFromPlaylist } from "../api";
import { usePlayer } from "../PlayerContext";
import { useLibraryEvents } from "../useLibraryEvents";
import { Playlist } from "../types";
import SongRow from "../components/SongRow";

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const { current, playSong } = usePlayer();
  const libraryVersion = useLibraryEvents();

  useEffect(() => {
    if (!id) return;
    load(id);
  }, [id, libraryVersion]);

  function load(playlistId: string) {
    fetchPlaylistById(playlistId).then(setPlaylist);
  }

  async function handleRemove(songId: string) {
    if (!id) return;
    await removeSongFromPlaylist(id, songId);
    load(id);
  }

  if (!playlist) return <p className="empty-state">Loading...</p>;

  return (
    <div className="detail-page">
      <h2>{playlist.name}</h2>

      {playlist.songs?.length === 0 && (
        <p className="empty-state">
          No songs yet. Go to any song and use "Add to playlist".
        </p>
      )}

      <div className="song-list">
        {playlist.songs?.map(({ song }) => (
          <SongRow
            key={song.id}
            song={song}
            isActive={current?.id === song.id}
            onPlay={() => playSong(song)}
            onToggleFavorite={() => {}}
            showRemove
            onRemove={() => handleRemove(song.id)}
          />
        ))}
      </div>
    </div>
  );
}
