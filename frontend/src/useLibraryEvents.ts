import { useEffect, useState } from "react";

export function useLibraryEvents(): number {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = (e) => {
      if (e.data === "library-updated") {
        setVersion((v) => v + 1);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return version;
}
