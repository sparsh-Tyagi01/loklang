export interface Artist {
  id: string;
  name: string;
  sortName?: string | null;
  createdAt?: string;
}

export interface Album {
  id: string;
  title: string;
  releaseDate?: string | null;
  coverImage?: string | null;
  createdAt?: string;
  artists?: { artist: Artist }[];
  songs?: Song[];
}

export interface SongArtist {
  songId: string;
  artistId: string;
  role?: string | null;
  artist: Artist;
}

export interface Song {
  id: string;
  title: string;
  filePath: string;
  duration?: number | null;
  albumId?: string | null;
  coverImage?: string | null;
  isFavorite: boolean;
  createdAt?: string;
  album?: Album | null;
  artists?: SongArtist[];
}

export interface PlaylistSong {
  playlistId: string;
  songId: string;
  position: number;
  song: Song;
}

export interface Playlist {
  id: string;
  name: string;
  createdAt?: string;
  songs: PlaylistSong[];
}

export interface QrResponse {
  url: string;
  qrDataUrl: string;
}
