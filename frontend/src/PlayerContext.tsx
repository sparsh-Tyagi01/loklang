import { createContext, useContext, useRef, useState, useEffect, ReactNode, RefObject } from "react";
import { streamUrl } from "./api";
import { Song } from "./types";

interface PlayerContextType {
  current: Song | null;
  playSong: (song: Song) => void;
  audioRef: RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Song | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (current && audioRef.current) {
      setErrorMsg(null);
      audioRef.current.play().catch(() => {});
    }
  }, [current]);

  function playSong(song: Song) {
    setErrorMsg(null);
    setCurrent(song);
  }

  function handleAudioError() {
    setErrorMsg("Audio file could not be played or was deleted.");
  }

  return (
    <PlayerContext.Provider value={{ current, playSong, audioRef }}>
      {children}
      {current && (
        <footer className="player-bar">
          <div className="now-playing">
            <div className="song-title">{current.title}</div>
            <div className="song-artist">
              {errorMsg ? (
                <span style={{ color: "#ff6b6b" }}>{errorMsg}</span>
              ) : (
                current.artists?.map((a) => a.artist.name).join(", ") || "Unknown Artist"
              )}
            </div>
          </div>
          <audio ref={audioRef} controls src={streamUrl(current.id)} onError={handleAudioError} />
        </footer>
      )}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextType {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
