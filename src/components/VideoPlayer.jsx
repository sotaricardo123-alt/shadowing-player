import styles from "./VideoPlayer.module.css";

export default function VideoPlayer({ videoRef, mediaSrc }) {
  return (
    <div className={styles.wrapper}>
      {mediaSrc ? (
        <video
          ref={videoRef}
          src={mediaSrc}
          playsInline
          className={styles.video}
        />
      ) : (
        <div className={styles.placeholder}>上传视频或音频后开始练习</div>
      )}
    </div>
  );
}
