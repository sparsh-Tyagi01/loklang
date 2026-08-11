import { Worker } from "worker_threads";
import path from "path";
import os from "os";
import fs from "fs";
import crypto from "crypto";
import { logger } from "../logger.js";

export interface ParsedMetadataResult {
  id: string;
  success: boolean;
  filePath: string;
  title?: string | null;
  album?: string | null;
  artist?: string | null;
  artists?: string[] | null;
  date?: string | null;
  duration?: number | null;
  pictureData?: Buffer | null;
  pictureFormat?: string | null;
  error?: string;
}

export class WorkerPoolService {
  private poolSize: number;
  private workers: Worker[] = [];
  private freeWorkers: Worker[] = [];
  private pendingTasks: Map<string, { resolve: (val: ParsedMetadataResult) => void; reject: (err: any) => void }> = new Map();
  private taskQueue: { id: string; filePath: string; resolve: (val: ParsedMetadataResult) => void; reject: (err: any) => void }[] = [];

  constructor(poolSize: number = Math.max(2, Math.min(4, os.cpus().length))) {
    this.poolSize = poolSize;
    this.initPool();
  }

  private initPool() {
    let workerScript = path.resolve("src/workers/metadataWorker.ts");
    if (!fs.existsSync(workerScript)) {
      workerScript = path.resolve("dist/workers/metadataWorker.js");
    }

    logger.info({ poolSize: this.poolSize, workerScript }, "Initializing metadata worker thread pool");

    for (let i = 0; i < this.poolSize; i++) {
      const isTs = workerScript.endsWith(".ts");
      const worker = new Worker(workerScript, {
        execArgv: isTs ? ["--import", "tsx"] : [],
      });

      worker.on("message", (result: ParsedMetadataResult) => {
        const task = this.pendingTasks.get(result.id);
        if (task) {
          this.pendingTasks.delete(result.id);
          task.resolve(result);
        }
        this.releaseWorker(worker);
      });

      worker.on("error", (err) => {
        logger.error({ err }, "Worker thread encountered an error");
        this.releaseWorker(worker);
      });

      this.workers.push(worker);
      this.freeWorkers.push(worker);
    }
  }

  private releaseWorker(worker: Worker) {
    if (this.taskQueue.length > 0) {
      const nextTask = this.taskQueue.shift()!;
      this.pendingTasks.set(nextTask.id, { resolve: nextTask.resolve, reject: nextTask.reject });
      worker.postMessage({ id: nextTask.id, filePath: nextTask.filePath });
    } else {
      this.freeWorkers.push(worker);
    }
  }

  public parseFileAsync(filePath: string): Promise<ParsedMetadataResult> {
    const id = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      if (this.freeWorkers.length > 0) {
        const worker = this.freeWorkers.pop()!;
        this.pendingTasks.set(id, { resolve, reject });
        worker.postMessage({ id, filePath });
      } else {
        this.taskQueue.push({ id, filePath, resolve, reject });
      }
    });
  }

  public terminate() {
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];
    this.freeWorkers = [];
  }
}

export const workerPoolService = new WorkerPoolService();
