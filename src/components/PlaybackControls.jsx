import { formatTime } from "../utils/time";
import { useHoldSeek } from "../hooks/useHoldSeek";
import styles from "./PlaybackControls.module.css";

const SHORT_SEEK_SEC = 2;

export default function PlaybackControls({
  currentTime,
  duration,
  isPlaying,
  onSeek,
  onTogglePlay,
  onPrevSentence,
  onNextSentence,
  onSeekBy,
  hasSubtitles,
  subtitlesHidden,
  onToggleSubtitlesHidden,
  canNavigate,
}) {
  const seekMode = !hasSubtitles;

  const { getHandlers: getBackHandlers } = useHoldSeek({
    enabled: seekMode,
    onShortSeek: () => onSeekBy(-SHORT_SEEK_SEC),
    onHoldStep: (delta) => onSeekBy(delta),
  });

  const { getHandlers: getForwardHandlers } = useHoldSeek({
    enabled: seekMode,
    onShortSeek: () => onSeekBy(SHORT_SEEK_SEC),
    onHoldStep: (delta) => onSeekBy(delta),
  });

  const backHandlers = seekMode
    ? getBackHandlers(-1)
    : { onClick: onPrevSentence, disabled: !canNavigate };

  const forwardHandlers = seekMode
    ? getForwardHandlers(1)
    : { onClick: onNextSentence, disabled: !canNavigate };

  return (
    <div className={styles.controls}>
      <div className={styles.progressRow}>
        <span className={styles.time}>{formatTime(currentTime)}</span>
        <input
          type="range"
          className={styles.progress}
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={(e) => onSeek(Number(e.target.value))}
          aria-label="播放进度"
        />
        <span className={styles.time}>{formatTime(duration)}</span>
      </div>

      <div className={styles.buttonRow}>
        <button
          type="button"
          className={styles.sideBtn}
          onClick={onToggleSubtitlesHidden}
          title={subtitlesHidden ? "显示字幕" : "隐藏字幕"}
          aria-label={subtitlesHidden ? "显示字幕" : "隐藏字幕"}
        >
          {subtitlesHidden ? "👁‍🗨" : "👁"}
        </button>

        <button
          type="button"
          className={styles.navBtn}
          {...backHandlers}
          title={seekMode ? "快退 2 秒（长按连续快退）" : "上一句"}
          aria-label={seekMode ? "快退 2 秒" : "上一句"}
        >
          {seekMode ? "↺" : "⏮"}
        </button>

        <button
          type="button"
          className={styles.playBtn}
          onClick={onTogglePlay}
          aria-label={isPlaying ? "暂停" : "播放"}
        >
          {isPlaying ? (
            <span className={styles.pauseIcon} aria-hidden>
              <span />
              <span />
            </span>
          ) : (
            <span className={styles.playIcon} aria-hidden />
          )}
        </button>

        <button
          type="button"
          className={styles.navBtn}
          {...forwardHandlers}
          title={seekMode ? "快进 2 秒（长按连续快进）" : "下一句"}
          aria-label={seekMode ? "快进 2 秒" : "下一句"}
        >
          {seekMode ? "↻" : "⏭"}
        </button>

        <span className={styles.spacer} />
      </div>
    </div>
  );
}
