import { coverUrl } from "../api";
import AddToPlaylistButton from "./AddToPlaylistButton";

export default function SongRow({
  song,
  isActive,
  onPlay,
  onToggleFavorite,
  showAlbumCover = true,
  showRemove = false,
  onRemove,
  showAddToPlaylist = false,
}) {
  return (
    <div className={`song-item ${isActive ? "active" : ""}`}>
      <div className="song-clickable" onClick={onPlay}>
        {showAlbumCover && song.album?.id ? (
          <img className="cover" src={coverUrl(song.album.id)} alt="" />
        ) : (
          <div className="cover cover-placeholder" />
        )}
        <div className="song-meta">
          <div className="song-title">{song.title}</div>
          <div className="song-artist">
            {song.artists?.map((a) => a.artist.name).join(", ") || "Unknown Artist"}
          </div>
        </div>
      </div>

        {showAddToPlaylist && <AddToPlaylistButton songId={song.id} />}

      {showRemove ? (
        <button
          className="favorite-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title="Remove from playlist"
        >
          ✕
        </button>
      ) : (
        <button
          className={`favorite-btn ${song.isFavorite ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(song.id);
          }}
          title={song.isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {song.isFavorite ? "♥" : "♡"}
        </button>
      )}
    </div>
  );
}