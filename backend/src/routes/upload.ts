import { Router, Request, Response } from "express";
import { storageService } from "../services/StorageService.js";
import { scannerService } from "../services/ScannerService.js";

const router = Router();
const uploader = storageService.getMulterUploader();

router.post("/folder", uploader.array("files", 500), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const count = files?.length || 0;
    console.log(`Received ${count} audio files via upload. Indexing metadata...`);
    
    await scannerService.scanDir(storageService.getUploadDirectory());
    res.json({
      success: true,
      filesUploaded: count,
      message: "Music uploaded and indexed successfully.",
    });
  } catch (err: any) {
    console.error("Error processing folder upload:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
