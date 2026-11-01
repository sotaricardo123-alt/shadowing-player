export function parseTime(t) {
  const parts = t.trim().split(":");
  const parseSeconds = (rest) => {
    const [s, ms = "0"] = rest.split(/[,.]/);
    return Number(s) + Number(ms) / 1000;
  };

  if (parts.length === 2) {
    const [m, rest] = parts;
    return Number(m) * 60 + parseSeconds(rest);
  }

  const [h, m, rest] = parts;
  return Number(h) * 3600 + Number(m) * 60 + parseSeconds(rest);
}

export function stripVttTags(text) {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Split cue text lines into primary + optional translation.
 * Convention: exactly 2 lines → line1 = primary, line2 = translation.
 * 1 line → primary only. 3+ lines → joined as primary (legacy/wrapped EN).
 */
export function splitBilingualLines(lines) {
  const trimmed = lines.map((l) => l.trim()).filter(Boolean);
  if (trimmed.length === 0) return null;

  if (trimmed.length === 1) {
    return { text: trimmed[0] };
  }

  if (trimmed.length === 2) {
    return { text: trimmed[0], translation: trimmed[1] };
  }

  return { text: trimmed.join(" ") };
}

export function detectFormat(text, filename = "") {
  const trimmed = text.replace(/^\uFEFF/, "").trim();
  const ext = filename.toLowerCase();

  if (ext.endsWith(".vtt") || trimmed.startsWith("WEBVTT")) return "vtt";
  if (ext.endsWith(".srt")) return "srt";

  return "srt";
}

export function parseSrt(text) {
  return text
    .replace(/\r/g, "")
    .split(/\n\n+/)
    .map((block) => {
      const lines = block.split("\n");
      const timeLine = lines.find((l) => l.includes("-->"));
      if (!timeLine) return null;

      const [start, end] = timeLine.split(" --> ");
      const contentLines = lines.slice(lines.indexOf(timeLine) + 1);
      const parsed = splitBilingualLines(contentLines);
      if (!parsed) return null;

      return {
        start: parseTime(start.trim()),
        end: parseTime(end.trim()),
        ...parsed,
      };
    })
    .filter(Boolean);
}

export function parseVtt(text) {
  const normalized = text.replace(/\r/g, "").trim();

  if (!normalized.toUpperCase().startsWith("WEBVTT")) {
    throw new Error("Invalid VTT file: missing WEBVTT header");
  }

  const body = normalized.replace(/^WEBVTT[^\n]*\n/, "");
  const cues = [];

  for (const block of body.split(/\n\n+/)) {
    const lines = block.trim().split("\n");
    if (!lines.length) continue;

    if (/^(NOTE|STYLE|REGION)/.test(lines[0])) continue;

    const timeLineIdx = lines.findIndex((l) => l.includes("-->"));
    if (timeLineIdx === -1) continue;

    const timeLine = lines[timeLineIdx];
    const [startRaw, endPart] = timeLine.split("-->");
    const endRaw = endPart.trim().split(/\s+/)[0];
    const contentLines = lines.slice(timeLineIdx + 1).map((l) => stripVttTags(l));
    const parsed = splitBilingualLines(contentLines);
    if (!parsed) continue;

    cues.push({
      start: parseTime(startRaw.trim()),
      end: parseTime(endRaw),
      ...parsed,
    });
  }

  return cues;
}

export function parseSubtitle(text, filename = "") {
  const format = detectFormat(text, filename);
  const cues = format === "vtt" ? parseVtt(text) : parseSrt(text);

  if (cues.length === 0) {
    throw new Error("No subtitle cues found in file");
  }

  return cues;
}
