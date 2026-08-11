import { Router, Request, Response } from "express";
import { storageService } from "../services/StorageService.js";
import { scannerService } from "../services/ScannerService.js";
import { logger } from "../logger.js";

const router = Router();
const uploader = storageService.getMulterUploader();

router.post("/folder", uploader.array("files", 500), async (req: Request, res: Response) => {
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
