import multer from "multer";
import path from "path";
import fs from "fs";

export class StorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve("data/music");
    fs.mkdirSync(this.uploadDir, { recursive: true });
  }

  public getUploadDirectory(): string {
    return this.uploadDir;
  }

  public getMulterUploader() {
    const storage = multer.diskStorage({
      destination: (_req, file, cb) => {
        const relPath = file.originalname;
        const dir = path.dirname(path.join(this.uploadDir, relPath));
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (_req, file, cb) => {
        cb(null, path.basename(file.originalname));
      },
    });

    return multer({
      storage,
      limits: { fileSize: 500 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const validExts = [".mp3", ".flac", ".ogg", ".wav", ".m4a"];
        if (validExts.includes(ext)) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
    });
  }
}

export const storageService = new StorageService();
