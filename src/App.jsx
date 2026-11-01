import { useEffect, useRef, useState } from "react";
import { validateMediaFile, validateSubtitleFile } from "./utils/media";
import { parseSubtitle } from "./utils/subtitle";
import { usePlaybackRate } from "./hooks/usePlaybackRate";
import { useSubtitleLoop } from "./hooks/useSubtitleLoop";
import { useAutoScroll } from "./hooks/useAutoScroll";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useMediaRecorder } from "./hooks/useMediaRecorder";
import { useVideoProgress } from "./hooks/useVideoProgress";
import AppHeader from "./components/AppHeader";
import MediaUpload from "./components/MediaUpload";
import UploadSheet from "./components/UploadSheet";
import VideoPlayer from "./components/VideoPlayer";
import SubtitlePanel from "./components/SubtitlePanel";
import PlayerToolbar from "./components/PlayerToolbar";
import PlaybackControls from "./components/PlaybackControls";
import ABLoopBar from "./components/ABLoopBar";
import styles from "./App.module.css";

function App() {
  const videoRef = useRef(null);
  const mediaUrlRef = useRef(null);

  const [mediaSrc, setMediaSrc] = useState(null);
  const [mediaFileName, setMediaFileName] = useState(null);
  const [subtitleFileName, setSubtitleFileName] = useState(null);
  const [lessonTitle, setLessonTitle] = useState("跟读练习");
  const [subtitles, setSubtitles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1);

  const [pointA, setPointA] = useState(null);
  const [pointB, setPointB] = useState(null);
  const [abLoopEnabled, setAbLoopEnabled] = useState(false);
  const [abModeActive, setAbModeActive] = useState(false);
  const [sentenceLoopEnabled, setSentenceLoopEnabled] = useState(false);

  const [showUpload, setShowUpload] = useState(true);
  const [subtitlesHidden, setSubtitlesHidden] = useState(false);
  const [bilingualMode, setBilingualMode] = useState("both");

  const [mediaError, setMediaError] = useState(null);
  const [subtitleError, setSubtitleError] = useState(null);

  const {
    isRecording,
    recordedAudio,
    recordingError,
    startRecording,
    stopRecording,
    clearRecordingError,
  } = useMediaRecorder();

  const { currentTime, duration, isPlaying, seek, togglePlay } =
    useVideoProgress(videoRef, mediaSrc);

  const hasBilingual = subtitles.some((s) => s.translation);

  useEffect(() => {
    return () => {
      if (mediaUrlRef.current) URL.revokeObjectURL(mediaUrlRef.current);
    };
  }, []);

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    setMediaError(null);

    const validation = validateMediaFile(file);
    if (!validation.ok) {
      setMediaError(validation.message);
      e.target.value = "";
      return;
    }

    if (mediaUrlRef.current) URL.revokeObjectURL(mediaUrlRef.current);
    const url = URL.createObjectURL(file);
    mediaUrlRef.current = url;
    setMediaSrc(url);
    setMediaFileName(file.name);
    setLessonTitle(file.name.replace(/\.[^.]+$/, ""));
    setShowUpload(false);
    e.target.value = "";
  };

  const handleSubtitleUpload = (e) => {
    const file = e.target.files[0];
    setSubtitleError(null);

    const validation = validateSubtitleFile(file);
    if (!validation.ok) {
      setSubtitleError(validation.message);
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const cues = parseSubtitle(reader.result, file.name);
        setSubtitles(cues);
        setSubtitleFileName(file.name);
        setCurrentIndex(null);
        e.target.value = "";
      } catch (err) {
        setSubtitleError(err.message || "Failed to parse subtitle file.");
        setSubtitles([]);
      }
    };
    reader.onerror = () => {
      setSubtitleError("Failed to read subtitle file.");
    };
    reader.readAsText(file);
  };

  const handleSubtitleLineClick = (index) => {
    setAbLoopEnabled(false);
    setCurrentIndex(index);
  };

  const goToSentence = (index) => {
    if (index < 0 || index >= subtitles.length) return;
    setAbLoopEnabled(false);
    setCurrentIndex(index);
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = subtitles[index].start;
    video.play();
  };

  const handleToggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const handleToggleSentenceLoop = () => {
    setSentenceLoopEnabled((enabled) => {
      const next = !enabled;
      if (!next) return next;

      const video = videoRef.current;
      if (!video || subtitles.length === 0) return next;

      // Prefer the highlighted card; only fall back to playhead / first cue.
      let targetIdx = currentIndex;
      if (targetIdx === null) {
        targetIdx = subtitles.findIndex(
          (s) => video.currentTime >= s.start && video.currentTime < s.end
        );
        if (targetIdx === -1) targetIdx = 0;
        setCurrentIndex(targetIdx);
      }

      setAbLoopEnabled(false);
      video.currentTime = subtitles[targetIdx].start;
      video.play();
      return next;
    });
  };

  const handleToggleAbMode = () => {
    setAbModeActive((active) => {
      if (active) {
        setAbLoopEnabled(false);
        return false;
      }
      return true;
    });
  };

  const handleCloseAbMode = () => {
    setAbModeActive(false);
    setAbLoopEnabled(false);
  };

  const resetPlaybackState = () => {
    setCurrentIndex(null);
    setPointA(null);
    setPointB(null);
    setAbLoopEnabled(false);
    setAbModeActive(false);
    setSentenceLoopEnabled(false);
    setSubtitlesHidden(false);
  };

  const handleRemoveMedia = () => {
    videoRef.current?.pause();
    if (mediaUrlRef.current) {
      URL.revokeObjectURL(mediaUrlRef.current);
      mediaUrlRef.current = null;
    }
    setMediaSrc(null);
    setMediaFileName(null);
    setSubtitles([]);
    setSubtitleFileName(null);
    setLessonTitle("跟读练习");
    setMediaError(null);
    setSubtitleError(null);
    resetPlaybackState();
    setShowUpload(true);
  };

  const handleRemoveSubtitles = () => {
    setSubtitles([]);
    setSubtitleFileName(null);
    setSubtitleError(null);
    setCurrentIndex(null);
  };

  usePlaybackRate(videoRef, playbackRate);
  useSubtitleLoop({
    videoRef,
    subtitles,
    currentIndex,
    setCurrentIndex,
    abLoopEnabled,
    pointA,
    pointB,
    sentenceLoopEnabled,
  });
  useAutoScroll(currentIndex);
  useKeyboardShortcuts({ videoRef, currentIndex, subtitles });

  const hasMedia = Boolean(mediaSrc);
  const hasSubtitles = subtitles.length > 0;
  const canNavigate = hasSubtitles && currentIndex !== null;

  const handleSeekBy = (delta) => {
    const video = videoRef.current;
    if (!video) return;
    seek(video.currentTime + delta);
  };

  return (
    <div className={styles.shell}>
      <div className={styles.phone}>
        {hasMedia ? (
          <>
            <AppHeader
              title={lessonTitle}
              onOpenUpload={() => setShowUpload(true)}
            />

            <main className={styles.main}>
              <div className={styles.contentRow}>
                <div className={styles.videoSection}>
                  <VideoPlayer videoRef={videoRef} mediaSrc={mediaSrc} />
                </div>
                <div className={styles.subtitleSection}>
                  <SubtitlePanel
                    subtitles={subtitles}
                    currentIndex={currentIndex}
                    videoRef={videoRef}
                    onLineClick={handleSubtitleLineClick}
                    hidden={subtitlesHidden}
                    bilingualMode={bilingualMode}
                  />
                </div>
              </div>
            </main>

            <footer className={styles.footer}>
              <ABLoopBar
                active={abModeActive}
                videoRef={videoRef}
                pointA={pointA}
                pointB={pointB}
                abLoopEnabled={abLoopEnabled}
                onSetA={setPointA}
                onSetB={setPointB}
                onToggleLoop={() => setAbLoopEnabled((v) => !v)}
                onClose={handleCloseAbMode}
              />
              <PlayerToolbar
                playbackRate={playbackRate}
                onSpeedChange={setPlaybackRate}
                abModeActive={abModeActive}
                onToggleAbMode={handleToggleAbMode}
                sentenceLoopEnabled={sentenceLoopEnabled}
                onToggleSentenceLoop={handleToggleSentenceLoop}
                isRecording={isRecording}
                onToggleRecording={handleToggleRecording}
                recordedAudio={recordedAudio}
                hasBilingual={hasBilingual}
                bilingualMode={bilingualMode}
                onBilingualModeChange={setBilingualMode}
              />
              <PlaybackControls
                currentTime={currentTime}
                duration={duration}
                isPlaying={isPlaying}
                onSeek={seek}
                onTogglePlay={togglePlay}
                onSeekBy={handleSeekBy}
                hasSubtitles={hasSubtitles}
                onPrevSentence={() =>
                  goToSentence(Math.max((currentIndex ?? 0) - 1, 0))
                }
                onNextSentence={() =>
                  goToSentence(
                    Math.min((currentIndex ?? 0) + 1, subtitles.length - 1)
                  )
                }
                subtitlesHidden={subtitlesHidden}
                onToggleSubtitlesHidden={() =>
                  setSubtitlesHidden((v) => !v)
                }
                canNavigate={canNavigate}
              />
            </footer>
          </>
        ) : (
          <div className={styles.landing}>
            <div className={styles.landingCard}>
              <h2 className={styles.landingTitle}>Shadowing Player</h2>
              <p className={styles.landingDesc}>
                上传视频和字幕，逐句跟读练习
              </p>
              <MediaUpload
                onMediaUpload={handleMediaUpload}
                onSubtitleUpload={handleSubtitleUpload}
                mediaError={mediaError}
                subtitleError={subtitleError}
                onDismissMediaError={() => setMediaError(null)}
                onDismissSubtitleError={() => setSubtitleError(null)}
              />
            </div>
          </div>
        )}

        <UploadSheet
          open={showUpload && hasMedia}
          onClose={() => setShowUpload(false)}
          onMediaUpload={handleMediaUpload}
          onSubtitleUpload={handleSubtitleUpload}
          mediaError={mediaError}
          subtitleError={subtitleError}
          onDismissMediaError={() => setMediaError(null)}
          onDismissSubtitleError={() => setSubtitleError(null)}
          mediaFileName={mediaFileName}
          subtitleFileName={subtitleFileName}
          onRemoveMedia={handleRemoveMedia}
          onRemoveSubtitles={handleRemoveSubtitles}
        />

        {recordingError && (
          <div className={styles.toast} onClick={clearRecordingError}>
            {recordingError}（点击关闭）
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
