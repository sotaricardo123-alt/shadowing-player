import { useEffect } from "react";

function findActiveIndex(subtitles, time) {
  return subtitles.findIndex((s) => time >= s.start && time < s.end);
}

export function useSubtitleLoop({
  videoRef,
  subtitles,
  currentIndex,
  setCurrentIndex,
  abLoopEnabled,
  pointA,
  pointB,
  sentenceLoopEnabled = false,
}) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (abLoopEnabled && pointA !== null && pointB !== null) {
        if (video.currentTime >= pointB) {
          video.currentTime = pointA;
          video.play();
        }
        return;
      }

      // Pin loop to the highlighted sentence — do not follow playback downward.
      if (
        sentenceLoopEnabled &&
        currentIndex !== null &&
        currentIndex < subtitles.length
      ) {
        const cue = subtitles[currentIndex];
        if (
          video.currentTime >= cue.end - 0.05 ||
          video.currentTime < cue.start
        ) {
          video.currentTime = cue.start;
          video.play();
        }
        return;
      }

      const idx = findActiveIndex(subtitles, video.currentTime);
      if (idx !== -1 && idx !== currentIndex) {
        setCurrentIndex(idx);
      }
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    return () => video.removeEventListener("timeupdate", onTimeUpdate);
  }, [
    videoRef,
    subtitles,
    currentIndex,
    setCurrentIndex,
    abLoopEnabled,
    pointA,
    pointB,
    sentenceLoopEnabled,
  ]);
}
