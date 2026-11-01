import MediaUpload from "./MediaUpload";
import styles from "./UploadSheet.module.css";

export default function UploadSheet({ open, onClose, ...uploadProps }) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.sheetHeader}>
          <h2>上传学习素材</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="关闭">
            ✕
          </button>
        </div>
        <MediaUpload {...uploadProps} />
      </div>
    </div>
  );
}
