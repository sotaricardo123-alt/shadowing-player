import { describe, expect, it } from "vitest";
import { validateMediaFile, validateSubtitleFile } from "./media.js";

describe("validateMediaFile", () => {
  it("accepts video mime types", () => {
    const file = { name: "clip.bin", type: "video/mp4" };
    expect(validateMediaFile(file).ok).toBe(true);
  });

  it("accepts known extensions when mime is empty", () => {
    const file = { name: "audio.mp3", type: "" };
    expect(validateMediaFile(file).ok).toBe(true);
  });

  it("accepts .mov by extension or quicktime mime", () => {
    expect(validateMediaFile({ name: "clip.mov", type: "" }).ok).toBe(true);
    expect(
      validateMediaFile({ name: "clip.bin", type: "video/quicktime" }).ok
    ).toBe(true);
  });

  it("rejects unknown formats", () => {
    const file = { name: "doc.pdf", type: "application/pdf" };
    expect(validateMediaFile(file).ok).toBe(false);
  });
});

describe("validateSubtitleFile", () => {
  it("accepts srt and vtt", () => {
    expect(validateSubtitleFile({ name: "a.srt" }).ok).toBe(true);
    expect(validateSubtitleFile({ name: "a.vtt" }).ok).toBe(true);
  });

  it("rejects other extensions", () => {
    expect(validateSubtitleFile({ name: "a.txt" }).ok).toBe(false);
  });
});
