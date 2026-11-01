import { formatTime } from "../utils/time";
import styles from "./SubtitlePanel.module.css";

/**
 * Subtitle cue shape (extensible for bilingual + vocabulary):
 * { start, end, text, translation?, keywords?: [{ word, color?, translation? }] }
 */
function renderText(cue) {
  if (!cue.keywords?.length) {
    return <p className={styles.primaryText}>{cue.text}</p>;
  }

  const parts = [];
  let remaining = cue.text;

  for (const kw of cue.keywords) {
    const idx = remaining.toLowerCase().indexOf(kw.word.toLowerCase());
    if (idx === -1) continue;
    if (idx > 0) parts.push({ type: "plain", text: remaining.slice(0, idx) });
    parts.push({ type: "keyword", text: remaining.slice(idx, idx + kw.word.length), color: kw.color });
    remaining = remaining.slice(idx + kw.word.length);
  }
  if (remaining) parts.push({ type: "plain", text: remaining });

  return (
    <p className={styles.primaryText}>
      {parts.map((part, i) =>
        part.type === "keyword" ? (
          <span key={i} className={styles.keyword} style={part.color ? { color: part.color } : undefined}>
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </p>
  );
}

export default function SubtitlePanel({
  subtitles,
  currentIndex,
  videoRef,
  onLineClick,
  hidden = false,
  bilingualMode = "both",
}) {
  const showPrimary = bilingualMode !== "translation";
  const showTranslation = bilingualMode !== "primary";
  if (subtitles.length === 0) {
    return (
      <div className={styles.panel} data-subtitle-scroll>
        <div className={styles.empty}>上传 SRT 或 VTT 字幕后，每句将显示为独立卡片</div>
      </div>
    );
  }

  return (
    <div className={styles.panel} data-subtitle-scroll>
      {subtitles.map((cue, i) => {
        const isActive = i === currentIndex;
        return (
          <article
            id={`line-${i}`}
            key={i}
            onClick={() => {
              onLineClick(i);
              videoRef.current.currentTime = cue.start;
              videoRef.current.play();
            }}
            className={`${styles.card} ${isActive ? styles.active : ""} ${hidden && !isActive ? styles.dimmed : ""}`}
          >
            <header className={styles.cardHeader}>
              <time className={styles.timestamp}>{formatTime(cue.start)}</time>
              {/* Reserved: per-sentence practice count */}
              <span className={styles.practiceCount} data-feature="practice-count" />
              {/* Reserved: favorite sentence */}
              <button
                type="button"
                className={styles.starBtn}
                data-feature="favorite"
                aria-label="收藏此句"
                onClick={(e) => e.stopPropagation()}
                disabled
              />
            </header>

            {!hidden && (
              <div className={styles.cardBody}>
                {showPrimary && renderText(cue)}
                {showTranslation && cue.translation && (
                  <p
                    className={`${styles.translation} ${!showPrimary ? styles.translationOnly : ""}`}
                    data-feature="bilingual"
                  >
                    {cue.translation}
                  </p>
                )}
                {showTranslation && !showPrimary && !cue.translation && renderText(cue)}
              </div>
            )}

            {hidden && isActive && (
              <div className={styles.hiddenHint}>字幕已隐藏 · 点击播放</div>
            )}
          </article>
        );
      })}
    </div>
  );
}
