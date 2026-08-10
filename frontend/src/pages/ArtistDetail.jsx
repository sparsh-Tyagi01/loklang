import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchArtistById } from "../api";
import { usePlayer } from "../PlayerContext";
import { useLibraryEvents } from "../useLibraryEvents";

export default function ArtistDetail() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const { current, playSong } = usePlayer();
  const libraryVersion = useLibraryEvents();

  useEffect(() => {
    fetchArtistById(id).then(setArtist);
  }, [id, libraryVersion]);

  if (!artist) return <p className="empty-state">Loading...</p>;

  return (
    <div className="detail-page">
      <h2>{artist.name}</h2>
      <div className="song-list">
        {artist.songs.map(({ song }) => (
          <div
            key={song.id}
            className={`song-item ${current?.id === song.id ? "active" : ""}`}
            onClick={() => playSong({ ...song, artists: [{ artist }] })}
          >
            <div className="song-meta">
              <div className="song-title">{song.title}</div>
              <div className="song-artist">{song.album?.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}