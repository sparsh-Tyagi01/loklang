import { describe, it, expect } from "vitest";
import path from "path";

describe("Path Traversal Guard Security Unit Tests", () => {
  function isPathSafe(requestedFilePath: string, allowedBaseDir: string): boolean {
    const resolvedPath = path.resolve(requestedFilePath);
    const resolvedBase = path.resolve(allowedBaseDir);
    return resolvedPath.startsWith(resolvedBase);
  }

  it("should allow valid file paths within allowed directory", () => {
    const allowedDir = "data/music";
    const validFile = "data/music/album/song.mp3";
    expect(isPathSafe(validFile, allowedDir)).toBe(true);
  });

  it("should block relative path traversal attempts outside allowed directory", () => {
    const allowedDir = "data/music";
    const maliciousPaths = [
      "data/music/../../etc/passwd",
      "data/music/../secret.env",
      "../../../../System/Library/Kernels/kernel",
      "data/music/subfolder/../../../index.ts",
    ];

    for (const p of maliciousPaths) {
      expect(isPathSafe(p, allowedDir)).toBe(false);
    }
  });
});
