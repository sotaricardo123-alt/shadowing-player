import ErrorBanner from "./ErrorBanner";
import { MEDIA_ACCEPT, MEDIA_EXTENSIONS, SUBTITLE_EXTENSIONS } from "../utils/media";
import styles from "./MediaUpload.module.css";

export default function MediaUpload({
  onMediaUpload,
  onSubtitleUpload,
  mediaError,
  subtitleError,
  onDismissMediaError,
  onDismissSubtitleError,
  mediaFileName,
  subtitleFileName,
  onRemoveMedia,
  onRemoveSubtitles,
}) {
  return (
    <div className={styles.section}>
      <ErrorBanner message={mediaError} onDismiss={onDismissMediaError} />
      <ErrorBanner message={subtitleError} onDismiss={onDismissSubtitleError} />

      <div className={styles.block}>
        <span className={styles.label}>
          <strong>上传视频 / 音频</strong>
        </span>
        {mediaFileName && (
          <div className={styles.currentFile}>
            <span className={styles.fileName} title={mediaFileName}>
              当前：{mediaFileName}
            </span>
            {onRemoveMedia && (
              <button type="button" className={styles.removeBtn} onClick={onRemoveMedia}>
                移除
              </button>
            )}
          </div>
        )}
        <input
          className={styles.fileInput}
          type="file"
          accept={MEDIA_ACCEPT}
          onChange={onMediaUpload}
        />
        <p className={styles.hint}>
          支持格式：{MEDIA_EXTENSIONS.join("、")}（建议优先用 .mp4，兼容性更好）
        </p>
      </div>

      <div className={styles.block}>
        <span className={styles.label}>
          <strong>上传字幕</strong>
        </span>
        {subtitleFileName && (
          <div className={styles.currentFile}>
            <span className={styles.fileName} title={subtitleFileName}>
              当前：{subtitleFileName}
            </span>
            {onRemoveSubtitles && (
              <button type="button" className={styles.removeBtn} onClick={onRemoveSubtitles}>
                移除
              </button>
            )}
          </div>
        )}
        <input
          className={styles.fileInput}
          type="file"
          accept=".srt,.vtt"
          onChange={onSubtitleUpload}
        />
        <p className={styles.hint}>
          支持格式：{SUBTITLE_EXTENSIONS.join("、")}
        </p>
        <p className={styles.hint}>
          双语字幕：每条写两行，第一行原文、第二行译文
        </p>
      </div>
    </div>
  );
}
