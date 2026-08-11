import { parentPort } from "worker_threads";
import { parseFile } from "music-metadata";

if (parentPort) {
  parentPort.on("message", async (data: { id: string; filePath: string }) => {
    const { id, filePath } = data;
    try {
      const { common, format } = await parseFile(filePath, { duration: true });
      
      let pictureData: Buffer | null = null;
      let pictureFormat: string | null = null;

      if (common.picture?.length) {
        const pic = common.picture[0];
        pictureData = Buffer.from(pic.data);
        pictureFormat = pic.format;
      }

      parentPort?.postMessage({
        id,
        success: true,
        filePath,
        title: common.title || null,
        album: common.album || null,
        artist: common.artist || null,
        artists: common.artists || null,
        date: common.date || null,
        duration: format.duration || null,
        pictureData,
        pictureFormat,
      });
    } catch (err: any) {
      parentPort?.postMessage({
        id,
        success: false,
        filePath,
        error: err.message,
      });
    }
  });
}
