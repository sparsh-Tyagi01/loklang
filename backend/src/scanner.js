import fs from "fs";
import path from "path";
import crypto from "crypto";
import { parseFile } from "music-metadata";
import { prisma } from "./db.js";

const SUPPORTED_EXT = new Set([".mp3", ".flac", ".ogg", ".wav", ".m4a"]);

function hashId(input) {
  return crypto.createHash("md5").update(input).digest("hex");
}

function collectAudioFiles(dirPath) {
  let results = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(collectAudioFiles(fullPath));
    } else if (SUPPORTED_EXT.has(path.extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }

  return results;
}

async function processFile(filePath) {
  try {
    const { common, format } = await parseFile(filePath, { duration: true });

    const songId = hashId(filePath);

    // Album
    let albumId = null;
    if (common.album) {
      albumId = hashId(common.album);

      let coverImagePath = null;
      if (common.picture?.length) {
        const pic = common.picture[0];
        const coverDir = path.resolve("data/covers");
        fs.mkdirSync(coverDir, { recursive: true });
        const ext = pic.format.split("/")[1] || "jpg";
        coverImagePath = path.join(coverDir, `${albumId}.${ext}`);
        if (!fs.existsSync(coverImagePath)) {
          fs.writeFileSync(coverImagePath, pic.data);
        }
      }

      await prisma.album.upsert({
        where: { id: albumId },
        update: { coverImage: coverImagePath ?? undefined },
        create: {
          id: albumId,
          title: common.album,
          releaseDate: common.date ?? null,
          coverImage: coverImagePath,
        },
      });
    }

    // Song
    await prisma.song.upsert({
      where: { filePath },
      update: {
        title: common.title || path.basename(filePath),
        duration: format.duration ? Math.round(format.duration) : null,
        albumId,
      },
      create: {
        id: songId,
        title: common.title || path.basename(filePath),
        filePath,
        duration: format.duration ? Math.round(format.duration) : null,
        albumId,
      },
    });

    // Artists
    const artistNames = common.artists?.length
      ? common.artists
      : common.artist
      ? [common.artist]
      : [];

    for (const name of artistNames) {
      const artistId = hashId(name);

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
  } catch (err) {
    console.error(`Could not parse metadata for ${filePath}:`, err.message);
  }
}

export async function removeSongById(songId) {
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
  } catch (err) {
    console.error(`Error deleting song ID ${songId}:`, err.message);
  }
}

let libraryUpdateListener = null;

export function setOnLibraryUpdate(listener) {
  libraryUpdateListener = listener;
}

export function notifyLibraryUpdate() {
  if (libraryUpdateListener) {
    try {
      libraryUpdateListener();
    } catch (e) {}
  }
}

export async function scanDir(rootDir) {
  const resolvedRoot = path.resolve(rootDir);
  if (!fs.existsSync(resolvedRoot)) {
    console.warn(`Root music directory does not exist: ${resolvedRoot}`);
    return;
  }

  const files = collectAudioFiles(resolvedRoot);
  const existingFilesSet = new Set(files.map((f) => path.resolve(f)));
  console.log(`Found ${files.length} audio files. Extracting metadata...`);

  for (const file of files) {
    await processFile(file);
  }

  // Clean up songs in DB that no longer exist on disk
  const dbSongs = await prisma.song.findMany();
  let deletedCount = 0;
  for (const song of dbSongs) {
    const resolvedPath = path.resolve(song.filePath);
    if (!fs.existsSync(resolvedPath) || !existingFilesSet.has(resolvedPath)) {
      console.log(`File deleted on disk. Removing from DB: ${song.title} (${song.filePath})`);
      await removeSongById(song.id);
      deletedCount++;
    }
  }

  notifyLibraryUpdate();
}

let debounceTimer = null;

export function watchMusicDir(rootDir) {
  const resolvedRoot = path.resolve(rootDir);
  if (!fs.existsSync(resolvedRoot)) return;

  console.log(`Watching "${resolvedRoot}" for music folder changes...`);
  try {
    fs.watch(resolvedRoot, { recursive: true }, (eventType, filename) => {
      if (filename && (filename.startsWith(".") || filename.includes(".tmp"))) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        console.log(`Change detected in music folder (${eventType}: ${filename}). Rescanning...`);
        scanDir(resolvedRoot).catch((err) => console.error("Error during watch rescan:", err));
      }, 500);
    });
  } catch (err) {
    console.error("Could not set up filesystem watcher:", err.message);
  }
}