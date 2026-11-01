import { formatTime } from "../utils/time";
import styles from "./ABLoopBar.module.css";

export default function ABLoopBar({
  active,
  videoRef,
  pointA,
  pointB,
  abLoopEnabled,
  onSetA,
  onSetB,
  onToggleLoop,
  onClose,
}) {
  if (!active) return null;

  const setA = () => onSetA(videoRef.current?.currentTime ?? 0);
  const setB = () => onSetB(videoRef.current?.currentTime ?? 0);

  return (
    <div className={styles.bar}>
      <div className={styles.group}>
        <span className={styles.marker}>A</span>
        <span className={styles.time}>{pointA !== null ? formatTime(pointA) : "--:--"}</span>
        <button type="button" className={styles.chip} onClick={setA}>
          设A
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.group}>
        <span className={styles.marker}>B</span>
        <span className={styles.time}>{pointB !== null ? formatTime(pointB) : "--:--"}</span>
        <button type="button" className={styles.chip} onClick={setB}>
          设B
        </button>
      </div>

      <button
        type="button"
        className={`${styles.loopBtn} ${abLoopEnabled ? styles.loopActive : ""}`}
        onClick={onToggleLoop}
        disabled={pointA === null || pointB === null}
      >
        {abLoopEnabled ? "停止" : "循环"}
      </button>

      <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="完成">
        ✕
      </button>
    </div>
  );
}
