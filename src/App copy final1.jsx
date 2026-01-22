import { useEffect, useRef, useState } from "react";

function App() {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [mediaSrc, setMediaSrc] = useState(null);
  const [subtitles, setSubtitles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);

  const [showHelp, setShowHelp] = useState(false);

  /* ===== 时间解析 ===== */
  const parseTime = (t) => {
    const [h, m, rest] = t.split(":");
    const [s, ms] = rest.split(/[,\.]/);
    return (
      Number(h) * 3600 +
      Number(m) * 60 +
      Number(s) +
      Number(ms) / 1000
    );
  };

  /* ===== 字幕解析 ===== */
  const parseSubtitle = (text) =>
    text
      .replace(/\r/g, "")
      .split(/\n\n+/)
      .map((block) => {
        const lines = block.split("\n");
        const timeLine = lines.find((l) => l.includes("-->"));
        if (!timeLine) return null;

        const [start, end] = timeLine.split(" --> ");
        return {
          start: parseTime(start.trim()),
          end: parseTime(end.trim()),
          text: lines.slice(lines.indexOf(timeLine) + 1).join(" "),
        };
      })
      .filter(Boolean);

  /* ===== 上传 ===== */
  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) setMediaSrc(URL.createObjectURL(file));
  };

  const handleSubtitleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSubtitles(parseSubtitle(reader.result));
    reader.readAsText(file);
  };

  /* ===== 倍速 ===== */
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  /* ===== 播放 & 一句循环 ===== */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      const idx = subtitles.findIndex(
        (s) => video.currentTime >= s.start && video.currentTime < s.end
      );

      if (idx !== currentIndex) setCurrentIndex(idx);

      if (idx !== -1 && video.currentTime >= subtitles[idx].end) {
        video.currentTime = subtitles[idx].start;
        video.play();
      }
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    return () => video.removeEventListener("timeupdate", onTimeUpdate);
  }, [subtitles, currentIndex]);

  /* ===== 自动滚动 ===== */
  useEffect(() => {
    if (currentIndex === null) return;
    document
      .getElementById(`line-${currentIndex}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentIndex]);

  /* ===== 快捷键 ===== */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!videoRef.current) return;
      if (e.target.tagName === "INPUT") return;

      if (e.code === "Space") {
        e.preventDefault();
        videoRef.current.paused
          ? videoRef.current.play()
          : videoRef.current.pause();
      }

      if (e.code === "ArrowDown" && currentIndex !== null) {
        e.preventDefault();
        const next = Math.min(currentIndex + 1, subtitles.length - 1);
        videoRef.current.currentTime = subtitles[next].start;
        videoRef.current.play();
      }

      if (e.code === "ArrowUp" && currentIndex !== null) {
        e.preventDefault();
        const prev = Math.max(currentIndex - 1, 0);
        videoRef.current.currentTime = subtitles[prev].start;
        videoRef.current.play();
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [currentIndex, subtitles]);

  /* ===== 录音 ===== */
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    audioChunksRef.current = [];
    recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      setRecordedAudio(URL.createObjectURL(blob));
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", position: "relative" }}>
      <h2>Shadowing Practice Player</h2>

      {/* 快捷键说明 */}
      <div style={{ position: "absolute", top: 16, right: 16 }}>
        <button onClick={() => setShowHelp(!showHelp)}>⌨️ Shortcuts</button>
        {showHelp && (
          <div
            style={{
              marginTop: 6,
              padding: 8,
              fontSize: 12,
              background: "#f7f7f7",
              border: "1px solid #ccc",
            }}
          >
            Space — Play / Pause<br />
            ↑ — Previous sentence<br />
            ↓ — Next sentence
          </div>
        )}
      </div>

      {/* 上传区 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 10 }}>
          🎬 <strong>Upload Media</strong>
          <div style={{ fontSize: 12, color: "#555" }}>
            MP4 / WebM / MP3 / WAV
          </div>
          <input
            type="file"
            accept="video/mp4,video/webm,audio/mp3,audio/wav"
            onChange={handleMediaUpload}
          />
        </div>

        <div>
          📝 <strong>Upload Subtitles</strong>
          <div style={{ fontSize: 12, color: "#555" }}>.srt / .vtt</div>
          <input
            type="file"
            accept=".srt,.vtt"
            onChange={handleSubtitleUpload}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        {/* 播放器 */}
        <div style={{ width: 720, aspectRatio: "16 / 9", background: "#000" }}>
          {mediaSrc && (
            <video
              ref={videoRef}
              src={mediaSrc}
              controls
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          )}
        </div>

        {/* 字幕 */}
        <div
          style={{
            width: 320,
            maxHeight: 405,
            overflowY: "auto",
            border: "1px solid #ddd",
            padding: 8,
          }}
        >
          {subtitles.map((s, i) => (
            <div
              id={`line-${i}`}
              key={i}
              onClick={() => {
                videoRef.current.currentTime = s.start;
                videoRef.current.play();
                setCurrentIndex(i);
              }}
              style={{
                padding: 6,
                cursor: "pointer",
                background: i === currentIndex ? "#cceeff" : "transparent",
              }}
            >
              {s.text}
            </div>
          ))}
        </div>
      </div>

      {/* 倍速 */}
      <div style={{ marginTop: 12 }}>
        <strong>Speed:</strong>{" "}
        {[0.75, 1, 1.25, 1.5].map((r) => (
          <button
            key={r}
            onClick={() => setPlaybackRate(r)}
            style={{
              marginRight: 6,
              background: playbackRate === r ? "#4caf50" : "#eee",
            }}
          >
            {r}x
          </button>
        ))}
      </div>

      {/* 录音 */}
      <div style={{ marginTop: 16 }}>
        <strong>Recording:</strong>
        <br />
        {!isRecording ? (
          <button onClick={startRecording}>Start Recording</button>
        ) : (
          <button onClick={stopRecording}>Stop Recording</button>
        )}
        {recordedAudio && (
          <div style={{ marginTop: 8 }}>
            <audio src={recordedAudio} controls />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
