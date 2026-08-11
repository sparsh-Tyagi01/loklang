import { Song } from "../types";
import { coverUrl } from "../api";
import AddToPlaylistButton from "./AddToPlaylistButton";

interface SongRowProps {
  song: Song;
  isActive: boolean;
  onPlay: () => void;
  onToggleFavorite: (id: string) => void;
  showAddToPlaylist?: boolean;
  showRemove?: boolean;
  onRemove?: () => void;
}

export default function SongRow({
  song,
  isActive,
  onPlay,
  onToggleFavorite,
  showAddToPlaylist = false,
  showRemove = false,
  onRemove,
}: SongRowProps) {
  const artistNames = song.artists?.map((a) => a.artist.name).join(", ") || "Unknown Artist";

  return (
    <div className={`song-item ${isActive ? "active" : ""}`}>
      <div className="song-clickable" onClick={onPlay}>
        {song.albumId ? (
          <img className="cover" src={coverUrl(song.albumId)} alt={song.title} />
        ) : (
          <div className="cover cover-placeholder" />
        )}

        <div className="song-meta">
          <div className="song-title">{song.title}</div>
          <div className="song-artist">{artistNames}</div>
        </div>
      </div>

      <button
        className={`favorite-btn ${song.isFavorite ? "active" : ""}`}
        onClick={() => onToggleFavorite(song.id)}
        title={song.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
      >
        ♥
      </button>

      {showAddToPlaylist && <AddToPlaylistButton songId={song.id} />}

      {showRemove && onRemove && (
        <button className="favorite-btn" onClick={onRemove} title="Remove from Playlist">
          ✕
        </button>
      )}
    </div>
  );
}
