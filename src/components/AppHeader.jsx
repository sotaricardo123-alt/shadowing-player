import styles from "./AppHeader.module.css";

export default function AppHeader({ title, onOpenUpload }) {
  return (
    <header className={styles.header}>
      <button type="button" className={styles.iconBtn} aria-label="返回" disabled>
        ←
      </button>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.uploadBtn}
          aria-label="上传或移除素材"
          onClick={onOpenUpload}
        >
          <svg
            className={styles.uploadIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 16V4" />
            <path d="M8 8l4-4 4 4" />
            <path d="M4 20h16" />
          </svg>
          上传/移除
        </button>
      </div>
    </header>
  );
}
