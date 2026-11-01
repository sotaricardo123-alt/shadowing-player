import ErrorBanner from "./ErrorBanner";
import styles from "./RecordingControls.module.css";

export default function RecordingControls({
  isRecording,
  recordedAudio,
  recordingError,
  onStart,
  onStop,
  onDismissError,
}) {
  return (
    <div className={styles.section}>
      <strong>Recording:</strong>
      <ErrorBanner message={recordingError} onDismiss={onDismissError} />
      <div className={styles.recordingActions}>
        {!isRecording ? (
          <button type="button" onClick={onStart}>
            Start Recording
          </button>
        ) : (
          <button type="button" className={styles.stopBtn} onClick={onStop}>
            Stop Recording
          </button>
        )}
      </div>
      {recordedAudio && (
        <div className={styles.audio}>
          <audio src={recordedAudio} controls />
        </div>
      )}
    </div>
  );
}
