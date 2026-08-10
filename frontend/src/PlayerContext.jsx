import { createContext, useContext, useRef, useState, useEffect } from "react";
import { streamUrl } from "./api";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [current, setCurrent] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (current && audioRef.current) {
      setErrorMsg(null);
      audioRef.current.play().catch(() => {});
    }
  }, [current]);

  function playSong(song) {
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

export function usePlayer() {
  return useContext(PlayerContext);
}