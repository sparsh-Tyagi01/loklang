import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { scannerService } from "../src/services/ScannerService.js";
import { prisma } from "../src/db.js";

describe("ScannerService Unit Tests", () => {
  it("should process items with bounded concurrency via mapLimit", async () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let activeConcurrency = 0;
    let maxObservedConcurrency = 0;

    const mapLimitFn = (scannerService as any).mapLimit.bind(scannerService);

    const results = await mapLimitFn(items, 3, async (num: number) => {
      activeConcurrency++;
      if (activeConcurrency > maxObservedConcurrency) {
        maxObservedConcurrency = activeConcurrency;
      }
      await new Promise((res) => setTimeout(res, 20));
      activeConcurrency--;
      return num * 2;
    });

    expect(results).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
    expect(maxObservedConcurrency).toBeLessThanOrEqual(3);
  });

  describe("removeSongById orphan cascades", () => {
    const testSongId = "test-song-id-123";
    const testAlbumId = "test-album-id-123";
    const testArtistId = "test-artist-id-123";

    beforeEach(async () => {
      await prisma.songArtist.deleteMany({ where: { songId: testSongId } });
      await prisma.albumArtist.deleteMany({ where: { albumId: testAlbumId } });
      await prisma.song.deleteMany({ where: { id: testSongId } });
      await prisma.album.deleteMany({ where: { id: testAlbumId } });
      await prisma.artist.deleteMany({ where: { id: testArtistId } });

      await prisma.artist.create({
        data: { id: testArtistId, name: "Test Artist", sortName: "Test Artist" },
      });

      await prisma.album.create({
        data: { id: testAlbumId, title: "Test Album" },
      });

      await prisma.albumArtist.create({
        data: { albumId: testAlbumId, artistId: testArtistId },
      });

      await prisma.song.create({
        data: {
          id: testSongId,
          title: "Test Song",
          filePath: "/tmp/test-song-123.mp3",
          albumId: testAlbumId,
        },
      });

      await prisma.songArtist.create({
        data: { songId: testSongId, artistId: testArtistId },
      });
    });

    afterEach(async () => {
      await prisma.songArtist.deleteMany({ where: { songId: testSongId } });
      await prisma.albumArtist.deleteMany({ where: { albumId: testAlbumId } });
      await prisma.song.deleteMany({ where: { id: testSongId } });
      await prisma.album.deleteMany({ where: { id: testAlbumId } });
      await prisma.artist.deleteMany({ where: { id: testArtistId } });
    });

    it("should remove orphaned album and artist when last song is deleted", async () => {
      await scannerService.removeSongById(testSongId);

      const song = await prisma.song.findUnique({ where: { id: testSongId } });
      expect(song).toBeNull();

      const album = await prisma.album.findUnique({ where: { id: testAlbumId } });
      expect(album).toBeNull();

      const artist = await prisma.artist.findUnique({ where: { id: testArtistId } });
      expect(artist).toBeNull();
    });
  });
});
