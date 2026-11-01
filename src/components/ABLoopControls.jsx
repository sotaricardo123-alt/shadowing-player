import styles from "./ABLoopControls.module.css";

export default function ABLoopControls({
  videoRef,
  pointA,
  pointB,
  abLoopEnabled,
  onSetA,
  onSetB,
  onToggleLoop,
}) {
  return (
    <div className={styles.section}>
      <strong>A–B Loop:</strong>
      <div className={styles.buttons}>
        <button type="button" onClick={() => onSetA(videoRef.current?.currentTime ?? 0)}>
          Set A
        </button>
        <button type="button" onClick={() => onSetB(videoRef.current?.currentTime ?? 0)}>
          Set B
        </button>
        <button
          type="button"
          onClick={onToggleLoop}
          disabled={pointA === null || pointB === null}
        >
          {abLoopEnabled ? "Stop Loop" : "Start Loop"}
        </button>
      </div>
      <div className={styles.hint}>
        A: {pointA?.toFixed(2) ?? "--"}s | B: {pointB?.toFixed(2) ?? "--"}s
      </div>
    </div>
  );
}
