import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchAlbumById, coverUrl, toggleFavorite } from "../api";
import { usePlayer } from "../PlayerContext";
import { useLibraryEvents } from "../useLibraryEvents";
import SongRow from "../components/SongRow";

export default function AlbumDetail() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const { current, playSong } = usePlayer();
  const libraryVersion = useLibraryEvents();

  useEffect(() => {
    fetchAlbumById(id)
      .then(setAlbum)
      .finally(() => setLoading(false));
  }, [id, libraryVersion]);

  async function handleToggleFavorite(songId) {
    const updated = await toggleFavorite(songId);
    setAlbum((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        songs: prev.songs.map((s) =>
          s.id === songId ? { ...s, isFavorite: updated.isFavorite } : s
        ),
      };
    });
  }

  if (loading) return <p className="empty-state">Loading...</p>;
  if (!album) return <p className="empty-state">Album not found.</p>;

  return (
    <div className="detail-page">
      <div className="album-header" style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem", alignItems: "center" }}>
        <img className="cover" src={coverUrl(album.id)} alt={album.title} style={{ width: "120px", height: "120px", borderRadius: "8px", objectFit: "cover" }} />
        <div>
          <h2 style={{ margin: "0 0 0.5rem 0" }}>{album.title}</h2>
          <p className="song-artist" style={{ margin: 0 }}>
            {album.artists?.map((a) => a.artist.name).join(", ") || "Unknown Artist"}
          </p>
        </div>
      </div>

      {(!album.songs || album.songs.length === 0) ? (
        <p className="empty-state">No songs found in this album.</p>
      ) : (
        <div className="song-list">
          {album.songs.map((song) => (
            <SongRow
              key={song.id}
              song={{ ...song, album: song.album || album }}
              isActive={current?.id === song.id}
              onPlay={() => playSong({ ...song, album: song.album || album })}
              onToggleFavorite={handleToggleFavorite}
              showAddToPlaylist
            />
          ))}
        </div>
      )}
    </div>
  );
}