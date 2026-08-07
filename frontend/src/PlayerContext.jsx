import { createContext, useContext, useRef, useState, useEffect } from "react";
import { streamUrl } from "./api";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [current, setCurrent] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (current && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [current]);

  function playSong(song) {
    setCurrent(song);
  }

  return (
    <PlayerContext.Provider value={{ current, playSong, audioRef }}>
      {children}
      {current && (
        <footer className="player-bar">
          <div className="now-playing">
            <div className="song-title">{current.title}</div>
            <div className="song-artist">
              {current.artists?.map((a) => a.artist.name).join(", ") || "Unknown Artist"}
            </div>
          </div>
          <audio ref={audioRef} controls src={streamUrl(current.id)} />
        </footer>
      )}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}