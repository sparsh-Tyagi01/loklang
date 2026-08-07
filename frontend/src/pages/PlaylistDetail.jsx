import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPlaylistById, removeSongFromPlaylist } from "../api";
import { usePlayer } from "../PlayerContext";
import SongRow from "../components/SongRow";

export default function PlaylistDetail() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const { current, playSong } = usePlayer();

  useEffect(() => {
    load();
  }, [id]);

  function load() {
    fetchPlaylistById(id).then(setPlaylist);
  }

  async function handleRemove(songId) {
    await removeSongFromPlaylist(id, songId);
    load();
  }

  if (!playlist) return <p className="empty-state">Loading...</p>;

  return (
    <div className="detail-page">
      <h2>{playlist.name}</h2>

      {playlist.songs.length === 0 && (
        <p className="empty-state">
          No songs yet. Go to any song and use "Add to playlist".
        </p>
      )}

      <div className="song-list">
        {playlist.songs.map(({ song }) => (
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