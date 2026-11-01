import { useEffect, useState } from "react";

export function useVideoProgress(videoRef, mediaSrc) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!mediaSrc) {
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const syncPlaying = () => setIsPlaying(!video.paused && !video.ended);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    syncPlaying();
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("loadedmetadata", onDurationChange);
    video.addEventListener("play", onPlay);
    video.addEventListener("playing", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("loadedmetadata", onDurationChange);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("playing", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, [videoRef, mediaSrc]);

  const seek = (time) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(time)) return;
    video.currentTime = Math.max(0, Math.min(time, video.duration || time));
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return { currentTime, duration, isPlaying, seek, togglePlay };
}
