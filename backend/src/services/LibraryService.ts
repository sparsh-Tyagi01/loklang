import { prisma } from "../db.js";

export class LibraryService {
  async getAllSongs() {
    return prisma.song.findMany({
      include: {
        album: true,
        artists: { include: { artist: true } },
      },
      orderBy: { title: "asc" },
    });
  }

  async getFavoriteSongs() {
    return prisma.song.findMany({
      where: { isFavorite: true },
      include: {
        album: true,
        artists: { include: { artist: true } },
      },
      orderBy: { title: "asc" },
    });
  }

  async getSongById(id: string) {
    return prisma.song.findUnique({
      where: { id },
      include: {
        album: true,
        artists: { include: { artist: true } },
      },
    });
  }

  async toggleFavorite(id: string) {
    const song = await prisma.song.findUnique({ where: { id } });
    if (!song) return null;

    return prisma.song.update({
      where: { id },
      data: { isFavorite: !song.isFavorite },
    });
  }

  async getAllAlbums() {
    return prisma.album.findMany({
      include: { artists: { include: { artist: true } } },
      orderBy: { title: "asc" },
    });
  }

  async getAlbumById(id: string) {
    return prisma.album.findUnique({
      where: { id },
      include: {
        songs: {
          orderBy: { title: "asc" },
          include: { artists: { include: { artist: true } }, album: true },
        },
        artists: { include: { artist: true } },
      },
    });
  }

  async getAllArtists() {
    return prisma.artist.findMany({
      orderBy: { name: "asc" },
    });
  }

  async getArtistById(id: string) {
    return prisma.artist.findUnique({
      where: { id },
      include: {
        songs: {
          include: {
            song: {
              include: { album: true },
            },
          },
        },
        albums: {
          include: { album: true },
        },
      },
    });
  }

  async getAllPlaylists() {
    return prisma.playlist.findMany({
      include: { songs: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async getPlaylistById(id: string) {
    return prisma.playlist.findUnique({
      where: { id },
      include: {
        songs: {
          orderBy: { position: "asc" },
          include: {
            song: {
              include: {
                album: true,
                artists: { include: { artist: true } },
              },
            },
          },
        },
      },
    });
  }

  async createPlaylist(name: string, id: string) {
    return prisma.playlist.create({
      data: { id, name },
    });
  }

  async deletePlaylist(id: string) {
    await prisma.playlistSong.deleteMany({ where: { playlistId: id } });
    await prisma.playlist.delete({ where: { id } });
  }

  async addSongToPlaylist(playlistId: string, songId: string) {
    const lastEntry = await prisma.playlistSong.findFirst({
      where: { playlistId },
      orderBy: { position: "desc" },
    });
    const nextPosition = lastEntry ? lastEntry.position + 1 : 0;

    return prisma.playlistSong.upsert({
      where: { playlistId_songId: { playlistId, songId } },
      update: {},
      create: { playlistId, songId, position: nextPosition },
    });
  }

  async removeSongFromPlaylist(playlistId: string, songId: string) {
    return prisma.playlistSong.delete({
      where: { playlistId_songId: { playlistId, songId } },
    });
  }
}

export const libraryService = new LibraryService();
