import fs from "fs";
import path from "path";
import crypto from "crypto";
import { prisma } from "../db.js";
import { logger } from "../logger.js";
import { workerPoolService } from "./WorkerPoolService.js";

const SUPPORTED_EXT = new Set([".mp3", ".flac", ".ogg", ".wav", ".m4a"]);

export class ScannerService {
  private updateListener: (() => void) | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;

  public setOnLibraryUpdate(listener: () => void) {
    this.updateListener = listener;
  }

  public notifyLibraryUpdate() {
    if (this.updateListener) {
      try {
        this.updateListener();
      } catch (e) {}
    }
  }

  private hashId(input: string): string {
    return crypto.createHash("md5").update(input).digest("hex");
  }

  public collectAudioFiles(dirPath: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dirPath)) return results;

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(this.collectAudioFiles(fullPath));
      } else if (SUPPORTED_EXT.has(path.extname(entry.name).toLowerCase())) {
        results.push(fullPath);
      }
    }
    return results;
  }

  public async processFile(filePath: string): Promise<void> {
    try {
      const result = await workerPoolService.parseFileAsync(filePath);
      if (!result.success) {
        logger.error({ filePath, error: result.error }, "Worker thread metadata parsing failed");
        return;
      }

      const songId = this.hashId(filePath);

      let albumId: string | null = null;
      if (result.album) {
        albumId = this.hashId(result.album);
        let coverImagePath: string | null = null;

        if (result.pictureData) {
          const coverDir = path.resolve("data/covers");
          fs.mkdirSync(coverDir, { recursive: true });
          const ext = result.pictureFormat ? result.pictureFormat.split("/")[1] || "jpg" : "jpg";
          coverImagePath = path.join(coverDir, `${albumId}.${ext}`);
          if (!fs.existsSync(coverImagePath)) {
            fs.writeFileSync(coverImagePath, Buffer.from(result.pictureData));
          }
        }

        await prisma.album.upsert({
          where: { id: albumId },
          update: { coverImage: coverImagePath ?? undefined },
          create: {
            id: albumId,
            title: result.album,
            releaseDate: result.date ?? null,
            coverImage: coverImagePath,
          },
        });
      }

      await prisma.song.upsert({
        where: { filePath },
        update: {
          title: result.title || path.basename(filePath),
          duration: result.duration ? Math.round(result.duration) : null,
          albumId,
        },
        create: {
          id: songId,
          title: result.title || path.basename(filePath),
          filePath,
          duration: result.duration ? Math.round(result.duration) : null,
          albumId,
        },
      });

      const artistNames = result.artists?.length
        ? result.artists
        : result.artist
        ? [result.artist]
        : [];

      for (const name of artistNames) {
        const artistId = this.hashId(name);

        await prisma.artist.upsert({
          where: { id: artistId },
          update: {},
          create: { id: artistId, name, sortName: name },
        });

        await prisma.songArtist.upsert({
          where: { songId_artistId: { songId, artistId } },
          update: {},
          create: { songId, artistId },
        });

        if (albumId) {
          await prisma.albumArtist.upsert({
            where: { albumId_artistId: { albumId, artistId } },
            update: {},
            create: { albumId, artistId },
          });
        }
      }
    } catch (err: any) {
      logger.error({ err, filePath }, `Could not process file metadata`);
    }
  }

  public async removeSongById(songId: string): Promise<void> {
    try {
      const song = await prisma.song.findUnique({
        where: { id: songId },
        include: { artists: true },
      });
      if (!song) return;

      const albumId = song.albumId;
      const artistIds = song.artists.map((sa) => sa.artistId);

      await prisma.song.delete({ where: { id: songId } });

      if (albumId) {
        const remainingSongs = await prisma.song.count({ where: { albumId } });
        if (remainingSongs === 0) {
          const album = await prisma.album.findUnique({ where: { id: albumId } });
          if (album?.coverImage && fs.existsSync(album.coverImage)) {
            try {
              fs.unlinkSync(album.coverImage);
            } catch (e) {}
          }
          await prisma.album.delete({ where: { id: albumId } });
        }
      }

      for (const artistId of artistIds) {
        const songCount = await prisma.songArtist.count({ where: { artistId } });
        const albumCount = await prisma.albumArtist.count({ where: { artistId } });
        if (songCount === 0 && albumCount === 0) {
          await prisma.artist.delete({ where: { id: artistId } });
        }
      }
    } catch (err: any) {
      logger.error({ err, songId }, `Error deleting song ID`);
    }
  }

  private async mapLimit<T, R>(
    items: T[],
    limit: number,
    fn: (item: T) => Promise<R>
  ): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let index = 0;
    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (index < items.length) {
        const currentIndex = index++;
        results[currentIndex] = await fn(items[currentIndex]);
      }
    });
    await Promise.all(workers);
    return results;
  }

  public async scanDir(rootDir: string): Promise<void> {
    const resolvedRoot = path.resolve(rootDir);
    if (!fs.existsSync(resolvedRoot)) {
      logger.warn({ rootDir: resolvedRoot }, `Root music directory does not exist`);
      return;
    }

    const files = this.collectAudioFiles(resolvedRoot);
    const existingFilesSet = new Set(files.map((f) => path.resolve(f)));
    logger.info({ fileCount: files.length }, `Found audio files. Offloading metadata parsing to Worker Threads...`);

    await this.mapLimit(files, 8, (file) => this.processFile(file));

    const dbSongs = await prisma.song.findMany();
    for (const song of dbSongs) {
      const resolvedPath = path.resolve(song.filePath);
      if (!fs.existsSync(resolvedPath) || !existingFilesSet.has(resolvedPath)) {
        logger.info({ songId: song.id, title: song.title, filePath: song.filePath }, `File deleted on disk. Removing from DB`);
        await this.removeSongById(song.id);
      }
    }

    this.notifyLibraryUpdate();
  }

  public watchMusicDir(rootDir: string): void {
    const resolvedRoot = path.resolve(rootDir);
    if (!fs.existsSync(resolvedRoot)) return;

    logger.info({ rootDir: resolvedRoot }, `Watching music folder for changes`);
    try {
      fs.watch(resolvedRoot, { recursive: true }, (eventType, filename) => {
        if (filename && (filename.startsWith(".") || filename.includes(".tmp"))) return;
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          logger.info({ eventType, filename }, `Change detected in music folder. Rescanning...`);
          this.scanDir(resolvedRoot).catch((err) =>
            logger.error({ err }, "Error during watch rescan")
          );
        }, 500);
      });
    } catch (err: any) {
      logger.error({ err }, "Could not set up filesystem watcher");
    }
  }
}

export const scannerService = new ScannerService();
