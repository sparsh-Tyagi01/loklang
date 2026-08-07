const API_BASE = "/api";

export async function fetchSongs() {
  const res = await fetch(`${API_BASE}/songs`);
  return res.json();
}

export async function fetchAlbums() {
  const res = await fetch(`${API_BASE}/albums`);
  return res.json();
}

export async function fetchArtists() {
  const res = await fetch(`${API_BASE}/artists`);
  return res.json();
}

export function streamUrl(songId) {
  return `${API_BASE}/stream/${songId}`;
}

export function coverUrl(albumId) {
  return `${API_BASE}/pictures/${albumId}`;
}

export async function fetchAlbumById(id) {
  const res = await fetch(`${API_BASE}/albums/${id}`);
  return res.json();
}

export async function fetchArtistById(id) {
  const res = await fetch(`${API_BASE}/artists/${id}`);
  return res.json();
}

export async function fetchFavorites() {
  const res = await fetch(`${API_BASE}/songs/favorites/all`);
  return res.json();
}

export async function toggleFavorite(songId) {
  const res = await fetch(`${API_BASE}/songs/${songId}/favorite`, { method: "PATCH" });
  return res.json();
}