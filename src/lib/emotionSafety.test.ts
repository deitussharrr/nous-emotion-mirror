import { describe, expect, it } from "vitest";
import {
  clampConfidence,
  containsCrisisLanguage,
  normalizeText,
} from "./emotionSafety";

describe("emotion safety utilities", () => {
  it("normalizes unicode and repeated whitespace", () => {
    expect(normalizeText("  I\u2019m   overwhelmed  ")).toBe("i’m overwhelmed");
  });

  it("detects explicit crisis language before model inference", () => {
    expect(containsCrisisLanguage("I don't want to live anymore")).toBe(true);
    expect(containsCrisisLanguage("I had a difficult day")).toBe(false);
  });

  it("clamps malformed confidence values to a safe range", () => {
    expect(clampConfidence(1.4)).toBe(1);
    expect(clampConfidence(-0.2)).toBe(0);
    expect(clampConfidence("not-a-number", 0.4)).toBe(0.4);
  });
});
