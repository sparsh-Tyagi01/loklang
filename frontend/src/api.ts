import { Song, Album, Artist, Playlist, QrResponse } from "./types";

const API_BASE = "/api";

export async function fetchSongs(): Promise<Song[]> {
  const res = await fetch(`${API_BASE}/songs`);
  return res.json();
}

export async function fetchAlbums(): Promise<Album[]> {
  const res = await fetch(`${API_BASE}/albums`);
  return res.json();
}

export async function fetchArtists(): Promise<Artist[]> {
  const res = await fetch(`${API_BASE}/artists`);
  return res.json();
}

export function streamUrl(songId: string): string {
  return `${API_BASE}/stream/${songId}`;
}

export function coverUrl(albumId: string): string {
  return `${API_BASE}/pictures/${albumId}`;
}

export async function fetchAlbumById(id: string): Promise<Album> {
  const res = await fetch(`${API_BASE}/albums/${id}`);
  return res.json();
}

export async function fetchArtistById(id: string): Promise<Artist & { songs: { song: Song }[]; albums: { album: Album }[] }> {
  const res = await fetch(`${API_BASE}/artists/${id}`);
  return res.json();
}

export async function fetchFavorites(): Promise<Song[]> {
  const res = await fetch(`${API_BASE}/songs/favorites/all`);
  return res.json();
}

export async function toggleFavorite(songId: string): Promise<Song> {
  const res = await fetch(`${API_BASE}/songs/${songId}/favorite`, { method: "PATCH" });
  return res.json();
}

export async function fetchPlaylists(): Promise<Playlist[]> {
  const res = await fetch(`${API_BASE}/playlists`);
  return res.json();
}

export async function fetchPlaylistById(id: string): Promise<Playlist> {
  const res = await fetch(`${API_BASE}/playlists/${id}`);
  return res.json();
}

export async function createPlaylist(name: string): Promise<Playlist> {
  const res = await fetch(`${API_BASE}/playlists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function deletePlaylist(id: string): Promise<void> {
  await fetch(`${API_BASE}/playlists/${id}`, { method: "DELETE" });
}

export async function addSongToPlaylist(playlistId: string, songId: string): Promise<void> {
  await fetch(`${API_BASE}/playlists/${playlistId}/songs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ songId }),
  });
}

export async function removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
  await fetch(`${API_BASE}/playlists/${playlistId}/songs/${songId}`, { method: "DELETE" });
}

export async function uploadFolder(files: File[], onProgress?: (percent: number) => void): Promise<{ success: boolean; filesUploaded: number; message: string }> {
  const formData = new FormData();
  const validExts = [".mp3", ".flac", ".ogg", ".wav", ".m4a"];

  let count = 0;
  for (const file of files) {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (validExts.includes(ext)) {
      formData.append("files", file, (file as any).webkitRelativePath || file.name);
      count++;
    }
  }

  if (count === 0) {
    throw new Error("No supported audio files (.mp3, .flac, .wav, .m4a, .ogg) found in folder.");
  }

  const xhr = new XMLHttpRequest();
  return new Promise((resolve, reject) => {
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (e) {
          resolve({ success: true, filesUploaded: count, message: "Uploaded" });
        }
      } else {
        reject(new Error(xhr.responseText || "Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.open("POST", `${API_BASE}/upload/folder`);
    xhr.send(formData);
  });
}
