import { useEffect, useRef, useState } from "react";
import styles from "./PlayerToolbar.module.css";

const SPEEDS = [0.5, 0.75, 0.9, 1, 1.25, 1.5];
const BILINGUAL_MODES = ["both", "primary", "translation"];
const BILINGUAL_LABELS = { both: "双语", primary: "原文", translation: "译文" };

export default function PlayerToolbar({
  playbackRate,
  onSpeedChange,
  abModeActive,
  onToggleAbMode,
  sentenceLoopEnabled,
  onToggleSentenceLoop,
  isRecording,
  onToggleRecording,
  recordedAudio,
  hasBilingual,
  bilingualMode,
  onBilingualModeChange,
}) {
  const audioRef = useRef(null);
  const speedWrapRef = useRef(null);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

  useEffect(() => {
    if (!speedMenuOpen) return;

    const onPointerDown = (e) => {
      if (!speedWrapRef.current?.contains(e.target)) {
        setSpeedMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [speedMenuOpen]);

  const cycleBilingual = () => {
    const idx = BILINGUAL_MODES.indexOf(bilingualMode);
    onBilingualModeChange(BILINGUAL_MODES[(idx + 1) % BILINGUAL_MODES.length]);
  };

  const playRecording = (e) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  return (
    <div className={styles.toolbar}>
      <button
        type="button"
        className={`${styles.tool} ${hasBilingual ? styles.toolActive : styles.disabled}`}
        onClick={hasBilingual ? cycleBilingual : undefined}
        title={hasBilingual ? "切换字幕显示" : "字幕无译文，请使用双行 SRT"}
        disabled={!hasBilingual}
      >
        <span className={styles.icon}>{BILINGUAL_LABELS[bilingualMode]}</span>
        <span className={styles.label}>字幕</span>
      </button>

      <div className={styles.speedWrap} ref={speedWrapRef}>
        <button
          type="button"
          className={`${styles.tool} ${speedMenuOpen ? styles.toolActive : ""}`}
          onClick={() => setSpeedMenuOpen((open) => !open)}
          title="选择倍速"
        >
          <span className={styles.iconSpeed}>{playbackRate}x</span>
          <span className={styles.label}>倍速</span>
        </button>

        {speedMenuOpen && (
          <ul className={styles.speedMenu} role="listbox" aria-label="播放倍速">
            {SPEEDS.map((rate) => (
              <li key={rate} role="option" aria-selected={rate === playbackRate}>
                <button
                  type="button"
                  className={rate === playbackRate ? styles.speedOptionActive : styles.speedOption}
                  onClick={() => {
                    onSpeedChange(rate);
                    setSpeedMenuOpen(false);
                  }}
                >
                  {rate}x
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        className={`${styles.tool} ${abModeActive ? styles.toolActive : ""}`}
        onClick={onToggleAbMode}
        title="A-B 复读"
      >
        <span className={styles.icon}>AB</span>
        <span className={styles.label}>复读</span>
      </button>

      <button
        type="button"
        className={`${styles.tool} ${sentenceLoopEnabled ? styles.toolActive : ""}`}
        onClick={onToggleSentenceLoop}
        title={sentenceLoopEnabled ? "关闭单句循环" : "开启单句循环"}
      >
        <span className={styles.iconLoop}>⟳</span>
        <span className={styles.label}>循环</span>
      </button>

      <div className={styles.practiceWrap}>
        <button
          type="button"
          className={`${styles.tool} ${isRecording ? styles.recording : ""}`}
          onClick={onToggleRecording}
          title={isRecording ? "停止录音" : "跟读练习"}
        >
          <span className={styles.iconMic}>🎤</span>
          <span className={styles.label}>练习</span>
        </button>
        {recordedAudio && !isRecording && (
          <button
            type="button"
            className={styles.replayBtn}
            onClick={playRecording}
            title="回放录音"
            aria-label="回放录音"
          >
            ▶
          </button>
        )}
        {recordedAudio && (
          <audio ref={audioRef} src={recordedAudio} className={styles.hiddenAudio} />
        )}
      </div>
    </div>
  );
}
