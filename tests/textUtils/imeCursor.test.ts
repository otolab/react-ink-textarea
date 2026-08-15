import { describe, it, expect } from "vitest";
import {
  textVisualWidth,
  computeImeScreenPosition,
  buildVisualRows,
  visualRowForCursor,
} from "../../src/textUtils.js";

describe("textVisualWidth", () => {
  it("returns 0 for empty string", () => {
    expect(textVisualWidth("")).toBe(0);
  });

  it("counts ASCII by code units", () => {
    expect(textVisualWidth("abc")).toBe(3);
  });

  it("counts wide CJK characters", () => {
    expect(textVisualWidth("あい")).toBe(4);
  });

  it("expands tabs to tabWidth", () => {
    expect(textVisualWidth("\t", 4)).toBe(4);
  });
});

describe("computeImeScreenPosition", () => {
  it("maps cursor column within a single visual row", () => {
    const pos = computeImeScreenPosition({
      cursorRowIndex: 0,
      chunkText: "hello",
      cursorOffsetInChunk: 3,
      visibleRowStart: 0,
      prefixWidth: 2,
      cursorStart: { x: 1, y: 5 },
    });
    expect(pos).toEqual({ x: 1 + 2 + 3, y: 5 });
  });

  it("uses visual width for CJK text before cursor", () => {
    const pos = computeImeScreenPosition({
      cursorRowIndex: 0,
      chunkText: "あいう",
      cursorOffsetInChunk: 2,
      visibleRowStart: 0,
      prefixWidth: 0,
      cursorStart: { x: 0, y: 0 },
    });
    expect(pos).toEqual({ x: 2, y: 0 });
  });

  it("offsets Y by viewport scroll", () => {
    const pos = computeImeScreenPosition({
      cursorRowIndex: 7,
      chunkText: "x",
      cursorOffsetInChunk: 1,
      visibleRowStart: 5,
      prefixWidth: 0,
      cursorStart: { x: 0, y: 10 },
    });
    expect(pos).toEqual({ x: 1, y: 12 });
  });

  it("returns undefined when cursor row is scrolled out", () => {
    const pos = computeImeScreenPosition({
      cursorRowIndex: 2,
      chunkText: "x",
      cursorOffsetInChunk: 0,
      visibleRowStart: 5,
      prefixWidth: 0,
      cursorStart: { x: 0, y: 0 },
    });
    expect(pos).toBeUndefined();
  });

  it("integrates with buildVisualRows and visualRowForCursor for wrapped lines", () => {
    const lines = ["abcdefgh"];
    const lineWidth = 3;
    const rows = buildVisualRows(lines, lineWidth, 0, 5, 0);
    const rowIndex = visualRowForCursor(rows, 0, 5, lineWidth);
    const row = rows[rowIndex]!;
    const pos = computeImeScreenPosition({
      cursorRowIndex: rowIndex,
      chunkText: row.text,
      cursorOffsetInChunk: 5 - (row.absStart - 0),
      visibleRowStart: 0,
      prefixWidth: 4,
      cursorStart: { x: 2, y: 3 },
    });
    expect(pos).toEqual({ x: 2 + 4 + 2, y: 3 + rowIndex });
  });
});
