import { useEffect, useState } from "react";
import { fetchSongs, coverUrl } from "../api";
import { usePlayer } from "../PlayerContext";

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { current, playSong } = usePlayer();

  useEffect(() => {
    fetchSongs()
      .then(setSongs)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="empty-state">Loading...</p>;
  if (songs.length === 0) return <p className="empty-state">No songs found.</p>;

  return (
    <div className="song-list">
      {songs.map((song) => (
        <div
          key={song.id}
          className={`song-item ${current?.id === song.id ? "active" : ""}`}
          onClick={() => playSong(song)}
        >
          {song.album?.id ? (
            <img className="cover" src={coverUrl(song.album.id)} alt="" />
          ) : (
            <div className="cover cover-placeholder" />
          )}
          <div className="song-meta">
            <div className="song-title">{song.title}</div>
            <div className="song-artist">
              {song.artists.map((a) => a.artist.name).join(", ") || "Unknown Artist"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}