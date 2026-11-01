export const MEDIA_EXTENSIONS = [
  ".mp4",
  ".webm",
  ".mov",
  ".mp3",
  ".wav",
  ".m4a",
  ".ogg",
];
export const SUBTITLE_EXTENSIONS = [".srt", ".vtt"];

export const MEDIA_ACCEPT =
  "video/mp4,video/webm,video/quicktime,audio/mp3,audio/wav,audio/mpeg,audio/mp4,audio/ogg";

function getExtension(filename) {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot).toLowerCase();
}

export function validateMediaFile(file) {
  if (!file) {
    return { ok: false, message: "No file selected." };
  }

  const ext = getExtension(file.name);
  const mimeOk = file.type.startsWith("video/") || file.type.startsWith("audio/");
  const extOk = MEDIA_EXTENSIONS.includes(ext);

  if (!mimeOk && !extOk) {
    return {
      ok: false,
      message: `Unsupported media format. Use: ${MEDIA_EXTENSIONS.join(", ")}`,
    };
  }

  return { ok: true };
}

export function validateSubtitleFile(file) {
  if (!file) {
    return { ok: false, message: "No file selected." };
  }

  const ext = getExtension(file.name);
  if (!SUBTITLE_EXTENSIONS.includes(ext)) {
    return {
      ok: false,
      message: `Subtitle file must be ${SUBTITLE_EXTENSIONS.join(" or ")}`,
    };
  }

  return { ok: true };
}
