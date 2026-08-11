import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchArtists } from "../api";
import { useLibraryEvents } from "../useLibraryEvents";
import { Artist } from "../types";

export default function Artists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const libraryVersion = useLibraryEvents();

  useEffect(() => {
    fetchArtists()
      .then(setArtists)
      .finally(() => setLoading(false));
  }, [libraryVersion]);

  if (loading) return <p className="empty-state">Loading...</p>;
  if (artists.length === 0) return <p className="empty-state">No artists found.</p>;

  return (
    <div className="song-list">
      {artists.map((artist) => (
        <Link to={`/artists/${artist.id}`} key={artist.id} className="song-item">
          <div className="cover cover-placeholder" />
          <div className="song-meta">
            <div className="song-title">{artist.name}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
