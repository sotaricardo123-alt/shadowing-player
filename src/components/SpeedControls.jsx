import styles from "./SpeedControls.module.css";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5];

export default function SpeedControls({ playbackRate, onSpeedChange }) {
  return (
    <div className={styles.section}>
      <strong>Speed:</strong>{" "}
      <span className={styles.buttons}>
        {SPEEDS.map((r) => (
          <button
            key={r}
            type="button"
            className={r === playbackRate ? styles.active : undefined}
            onClick={() => onSpeedChange(r)}
          >
            {r}x
          </button>
        ))}
      </span>
    </div>
  );
}
