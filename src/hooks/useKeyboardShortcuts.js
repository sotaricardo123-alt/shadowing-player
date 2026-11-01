import { useEffect } from "react";

export function useKeyboardShortcuts({ videoRef, currentIndex, subtitles }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!videoRef.current) return;
      if (e.target.tagName === "INPUT") return;

      const video = videoRef.current;

      if (e.code === "Space") {
        e.preventDefault();
        video.paused ? video.play() : video.pause();
      }

      if (e.code === "ArrowDown" && currentIndex !== null) {
        e.preventDefault();
        const next = Math.min(currentIndex + 1, subtitles.length - 1);
        video.currentTime = subtitles[next].start;
        video.play();
      }

      if (e.code === "ArrowUp" && currentIndex !== null) {
        e.preventDefault();
        const prev = Math.max(currentIndex - 1, 0);
        video.currentTime = subtitles[prev].start;
        video.play();
      }

      if (e.code === "ArrowRight") {
        e.preventDefault();
        video.currentTime = Math.min(video.currentTime + 3, video.duration);
      }

      if (e.code === "ArrowLeft") {
        e.preventDefault();
        video.currentTime = Math.max(video.currentTime - 3, 0);
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [videoRef, currentIndex, subtitles]);
}
