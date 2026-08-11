import React, { useState, useRef } from "react";
import { uploadFolder } from "../api";

interface FolderDropZoneProps {
  onComplete?: () => void;
  onClose?: () => void;
}

export default function FolderDropZone({ onComplete, onClose }: FolderDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function processFileList(files: File[]) {
    if (!files || files.length === 0) return;
    setError(null);
    setIsUploading(true);
    setProgress(0);
    setStatusText("Preparing audio files...");

    try {
      await uploadFolder(files, (percent) => {
        setProgress(percent);
        if (percent < 100) {
          setStatusText(`Uploading music files (${percent}%)...`);
        } else {
          setStatusText("Extracting metadata & building library index...");
        }
      });

      setStatusText("Complete!");
      setTimeout(() => {
        setIsUploading(false);
        if (onComplete) onComplete();
      }, 600);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload folder");
      setIsUploading(false);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    if (!items) return;

    const files: File[] = [];
    const entries: any[] = [];
    for (let i = 0; i < items.length; i++) {
      const entry = (items[i] as any).webkitGetAsEntry ? (items[i] as any).webkitGetAsEntry() : null;
      if (entry) entries.push(entry);
    }

    if (entries.length > 0) {
      for (const entry of entries) {
        await readEntryRecursive(entry, files);
      }
      await processFileList(files);
    } else if (e.dataTransfer.files?.length > 0) {
      await processFileList(Array.from(e.dataTransfer.files));
    }
  }

  async function readEntryRecursive(entry: any, files: File[], path = ""): Promise<void> {
    if (entry.isFile) {
      return new Promise((resolve) => {
        entry.file((file: File) => {
          Object.defineProperty(file, "webkitRelativePath", {
            value: path ? `${path}/${file.name}` : file.name,
          });
          files.push(file);
          resolve();
        });
      });
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      return new Promise((resolve) => {
        dirReader.readEntries(async (entries: any[]) => {
          for (const subEntry of entries) {
            await readEntryRecursive(subEntry, files, path ? `${path}/${entry.name}` : entry.name);
          }
          resolve();
        });
      });
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      processFileList(Array.from(e.target.files));
    }
  }

  return (
    <div className="dropzone-modal">
      <div className="dropzone-card">
        {onClose && (
          <button className="dropzone-close" onClick={onClose} title="Close">
            ✕
          </button>
        )}

        <div
          className={`dropzone-area ${isDragging ? "active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            {...({ webkitdirectory: "true", directory: "true" } as any)}
            multiple
            style={{ display: "none" }}
          />

          <div className="dropzone-icon">🎵</div>

          {isUploading ? (
            <div className="dropzone-status">
              <h3>{statusText}</h3>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="dropzone-prompt">
              <h3>Drag & Drop Your Music Folder Here</h3>
              <p>Supports .mp3, .flac, .m4a, .wav, and .ogg files</p>
              <button type="button" className="browse-btn">
                Or Browse Music Folder
              </button>
            </div>
          )}
        </div>

        {error && <div className="dropzone-error">{error}</div>}
      </div>
    </div>
  );
}
