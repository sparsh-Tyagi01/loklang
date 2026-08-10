import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { scanDir } from "../scanner.js";

const router = Router();

const uploadDir = path.resolve("data/music");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const relPath = file.originalname;
    const dir = path.dirname(path.join(uploadDir, relPath));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, path.basename(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const validExts = [".mp3", ".flac", ".ogg", ".wav", ".m4a"];
    if (validExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

router.post("/folder", upload.array("files", 500), async (req, res) => {
  try {
    const count = req.files?.length || 0;
    console.log(`Received ${count} audio files via upload. Indexing metadata...`);
    await scanDir(uploadDir);
    res.json({
      success: true,
      filesUploaded: count,
      message: "Music uploaded and indexed successfully.",
    });
  } catch (err) {
    console.error("Error processing folder upload:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
