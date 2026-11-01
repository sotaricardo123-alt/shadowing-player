import styles from "./ErrorBanner.module.css";

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className={styles.banner} role="alert">
      <span>{message}</span>
      {onDismiss && (
        <button type="button" className={styles.dismiss} onClick={onDismiss}>
          ×
        </button>
      )}
    </div>
  );
}
