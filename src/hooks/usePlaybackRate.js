import { useEffect } from "react";

export function usePlaybackRate(videoRef, playbackRate) {
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = playbackRate;
  }, [videoRef, playbackRate]);
}
