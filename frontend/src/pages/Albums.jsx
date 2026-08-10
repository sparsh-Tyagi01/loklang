import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAlbums, coverUrl } from "../api";
import { useLibraryEvents } from "../useLibraryEvents";

export default function Albums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const libraryVersion = useLibraryEvents();

  useEffect(() => {
    fetchAlbums()
      .then(setAlbums)
      .finally(() => setLoading(false));
  }, [libraryVersion]);

  if (loading) return <p className="empty-state">Loading...</p>;
  if (albums.length === 0) return <p className="empty-state">No albums found.</p>;

  return (
    <div className="grid">
      {albums.map((album) => (
        <Link to={`/albums/${album.id}`} key={album.id} className="grid-item">
          <img className="grid-cover" src={coverUrl(album.id)} alt="" />
          <div className="grid-title">{album.title}</div>
          <div className="grid-subtitle">
            {album.artists.map((a) => a.artist.name).join(", ") || "Unknown Artist"}
          </div>
        </Link>
      ))}
    </div>
  );
}