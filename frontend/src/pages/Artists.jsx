import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchArtists } from "../api";

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtists()
      .then(setArtists)
      .finally(() => setLoading(false));
  }, []);

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