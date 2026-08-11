import { Response } from "express";

export interface SseClient extends Response {}

export interface SongFilter {
  isFavorite?: boolean;
  albumId?: string;
  artistId?: string;
}

export interface ProcessedAudioMetadata {
  title: string;
  artistNames: string[];
  albumName: string | null;
  releaseDate: string | null;
  duration: number | null;
  pictureData: Buffer | null;
  pictureFormat: string | null;
}
