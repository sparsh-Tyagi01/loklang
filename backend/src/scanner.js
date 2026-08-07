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

export async function scanDir(rootDir) {
  if (!fs.existsSync(rootDir)) {
    console.warn(`Root music directory does not exist: ${rootDir}`);
    return;
  }

  const files = collectAudioFiles(rootDir);
  console.log(`Found ${files.length} audio files. Extracting metadata...`);

  for (const file of files) {
    await processFile(file);
  }
}