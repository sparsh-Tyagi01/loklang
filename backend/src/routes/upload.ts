import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { storageService } from "../services/StorageService.js";
import { scannerService } from "../services/ScannerService.js";
import { logger } from "../logger.js";

const router = Router();
const uploader = storageService.getMulterUploader();

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP to 30 folder upload requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Upload limit exceeded. Please try again in an hour." },
});

router.post("/folder", uploadLimiter, uploader.array("files", 500), async (req: Request, res: Response) => {
  const reqId = (req.headers["x-request-id"] as string) || "unknown";
  try {
    const files = req.files as Express.Multer.File[];
    const count = files?.length || 0;
    logger.info({ reqId, fileCount: count }, "Received audio files via folder upload. Indexing metadata...");

    await scannerService.scanDir(storageService.getUploadDirectory());
    res.json({
      success: true,
      filesUploaded: count,
      message: "Music uploaded and indexed successfully.",
    });
  } catch (err: any) {
    logger.error({ reqId, err }, "Error processing folder upload");
    res.status(500).json({ error: err.message });
  }
});

export default router;
