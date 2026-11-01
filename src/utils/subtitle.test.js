import { describe, expect, it } from "vitest";
import {
  detectFormat,
  parseSrt,
  parseSubtitle,
  parseTime,
  parseVtt,
  splitBilingualLines,
  stripVttTags,
} from "./subtitle.js";

describe("parseTime", () => {
  it("parses SRT timestamp with comma milliseconds", () => {
    expect(parseTime("00:01:02,500")).toBeCloseTo(62.5);
  });

  it("parses VTT timestamp with dot milliseconds", () => {
    expect(parseTime("00:01:02.500")).toBeCloseTo(62.5);
  });

  it("parses short VTT timestamp without hours", () => {
    expect(parseTime("01:30.250")).toBeCloseTo(90.25);
  });
});

describe("stripVttTags", () => {
  it("removes inline VTT tags", () => {
    expect(stripVttTags("<v Speaker>Hello <b>world</b>")).toBe("Hello world");
  });
});

describe("detectFormat", () => {
  it("detects VTT by header", () => {
    expect(detectFormat("WEBVTT\n\n00:01.000 --> 00:02.000\nHi")).toBe("vtt");
  });

  it("detects format by extension", () => {
    expect(detectFormat("1\n00:00:01,000 --> 00:00:02,000\nHi", "clip.srt")).toBe(
      "srt"
    );
    expect(detectFormat("WEBVTT\n\n00:01.000 --> 00:02.000\nHi", "clip.vtt")).toBe(
      "vtt"
    );
  });
});

describe("splitBilingualLines", () => {
  it("splits two lines into primary and translation", () => {
    expect(splitBilingualLines(["Hello world", "你好世界"])).toEqual({
      text: "Hello world",
      translation: "你好世界",
    });
  });

  it("keeps single line as primary only", () => {
    expect(splitBilingualLines(["Hello world"])).toEqual({
      text: "Hello world",
    });
  });

  it("joins three or more lines as primary text", () => {
    expect(splitBilingualLines(["Line one", "Line two", "Line three"])).toEqual({
      text: "Line one Line two Line three",
    });
  });
});

describe("parseSrt", () => {
  it("parses bilingual SRT blocks", () => {
    const srt = `1
00:00:01,000 --> 00:00:03,000
So, let's get unready.
那么，我们开始卸妆吧。`;

    expect(parseSrt(srt)).toEqual([
      {
        start: 1,
        end: 3,
        text: "So, let's get unready.",
        translation: "那么，我们开始卸妆吧。",
      },
    ]);
  });

  it("parses standard SRT blocks", () => {
    const srt = `1
00:00:01,000 --> 00:00:03,000
Hello world

2
00:00:04,000 --> 00:00:06,000
Second line`;

    expect(parseSrt(srt)).toEqual([
      { start: 1, end: 3, text: "Hello world" },
      { start: 4, end: 6, text: "Second line" },
    ]);
  });
});

describe("parseVtt", () => {
  it("parses bilingual VTT cues", () => {
    const vtt = `WEBVTT

00:01.000 --> 00:04.000
Hello world
你好世界`;

    expect(parseVtt(vtt)).toEqual([
      { start: 1, end: 4, text: "Hello world", translation: "你好世界" },
    ]);
  });

  it("parses WEBVTT cues and skips NOTE blocks", () => {
    const vtt = `WEBVTT

NOTE This is a comment

00:01.000 --> 00:04.000
Hello <b>world</b>

1:00:05.000 --> 1:00:07.500
<v Narrator>Next cue`;

    expect(parseVtt(vtt)).toEqual([
      { start: 1, end: 4, text: "Hello world" },
      { start: 3605, end: 3607.5, text: "Next cue" },
    ]);
  });

  it("throws when WEBVTT header is missing", () => {
    expect(() => parseVtt("00:01.000 --> 00:02.000\nHi")).toThrow(
      "Invalid VTT file"
    );
  });
});

describe("parseSubtitle", () => {
  it("routes to SRT parser by default", () => {
    const srt = `1
00:00:00,500 --> 00:00:02,000
Test`;

    expect(parseSubtitle(srt, "test.srt")).toEqual([
      { start: 0.5, end: 2, text: "Test" },
    ]);
  });

  it("throws when no cues are found", () => {
    expect(() => parseSubtitle("not subtitles", "test.srt")).toThrow(
      "No subtitle cues found"
    );
  });
});
