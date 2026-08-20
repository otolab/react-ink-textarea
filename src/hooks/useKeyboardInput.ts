import { useInput, usePaste } from "ink";
import {
  countTrailingEmptyLines,
  findLineStart,
  findLineEnd,
  findPrevWordBoundary,
  findNextWordBoundary,
  getCursorLineAndColumn,
  computeVisualUpCursor,
  computeVisualDownCursor,
  prevGraphemeOffset,
  nextGraphemeOffset,
  visualRowForCursor,
} from "../textUtils.js";
import type { VisualRow } from "../textUtils.js";
import type { TKeyAction, TKeybinding } from "../types.js";

type UseKeyboardInputOptions = {
  isActive: boolean;
  value: string;
  cursor: number;
  keyActions: Readonly<Record<TKeybinding, TKeyAction | null>>;
  autoNewLineLimit: number;
  onSubmit: (value: string) => void;
  onFirstLineUp: (() => void) | undefined;
  onLastLineDown: (() => void) | undefined;
  onFirstCharacterLeft: (() => void) | undefined;
  onLastCharacterRight: (() => void) | undefined;
  onTab: ((shift: boolean) => void) | undefined;
  setValue: (updater: string | ((prev: string) => string)) => void;
  setCursor: {
    (updater: (prev: number) => number): void;
    (value: number, valueForCalculation?: string): void;
  };
  pushUndo: (type: "insert" | "delete", value: string, cursor: number) => void;
  undo: (
    value: string,
    cursor: number,
  ) => { value: string; cursor: number } | undefined;
  redo: (
    value: string,
    cursor: number,
  ) => { value: string; cursor: number } | undefined;
  pushKill: (text: string, append?: boolean) => void;
  yank: () => string;
  yankPop: () => string;
  getLastYankLength: () => number;
  setLastYankLength: (length: number) => void;
  resetYankState: () => void;
  resetMutationTracking: () => void;
  resetBlink: () => void;
  lineWidth: number;
  visualRows: readonly VisualRow[];
};

export const useKeyboardInput = ({
  isActive,
  value,
  cursor,
  keyActions,
  autoNewLineLimit,
  onSubmit,
  onFirstLineUp,
  onLastLineDown,
  onFirstCharacterLeft,
  onLastCharacterRight,
  onTab,
  setValue,
  setCursor,
  pushUndo,
  undo,
  redo,
  pushKill,
  yank,
  yankPop,
  getLastYankLength,
  setLastYankLength,
  resetYankState,
  resetMutationTracking,
  resetBlink,
  lineWidth,
  visualRows,
}: UseKeyboardInputOptions): void => {
  usePaste(
    (text) => {
      const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      if (!normalized) return;
      resetBlink();
      pushUndo("insert", value, cursor);
      const newValue =
        value.slice(0, cursor) + normalized + value.slice(cursor);
      setValue(newValue);
      setCursor(cursor + normalized.length, newValue);
      resetMutationTracking();
    },
    { isActive },
  );

  useInput(
    (input, key) => {
      const killToLineStart = (): void => {
        resetBlink();
        const lineStart = findLineStart(value, cursor);
        if (lineStart === cursor) {
          if (cursor === 0) return;
          const killed = value[cursor - 1] ?? "";
          if (killed) pushKill(killed);
          pushUndo("delete", value, cursor);
          const target = cursor - 1;
          const newValue = value.slice(0, target) + value.slice(cursor);
          setValue(newValue);
          setCursor(target, newValue);
          resetMutationTracking();
          return;
        }
        const killed = value.slice(lineStart, cursor);
        if (killed) pushKill(killed);
        pushUndo("delete", value, cursor);
        const newValue = value.slice(0, lineStart) + value.slice(cursor);
        setValue(newValue);
        setCursor(lineStart, newValue);
        resetMutationTracking();
      };

      const runAction = (action: TKeyAction): void => {
        switch (action) {
          case "insertNewline": {
            resetBlink();
            pushUndo("insert", value, cursor);
            const newValue =
              value.slice(0, cursor) + "\n" + value.slice(cursor);
            setValue(newValue);
            setCursor(cursor + 1, newValue);
            return;
          }
          case "submit":
            onSubmit(value);
            return;
          case "cursorUp": {
            const { line, column } = getCursorLineAndColumn(value, cursor);
            if (lineWidth > 0) {
              const idx = visualRowForCursor(
                visualRows,
                line,
                column,
                lineWidth,
              );
              if (idx <= 0) {
                if (onFirstLineUp) onFirstLineUp();
                return;
              }
              resetBlink();
              setCursor((c) =>
                computeVisualUpCursor(value, c, lineWidth, visualRows),
              );
            } else {
              if (line === 0) {
                if (onFirstLineUp) onFirstLineUp();
                return;
              }
              resetBlink();
              setCursor((c) => {
                const { line: currentLine, column: col } =
                  getCursorLineAndColumn(value, c);
                if (currentLine === 0) return findLineStart(value, c);
                const prevLineEnd = findLineStart(value, c) - 1;
                const prevLineStart = findLineStart(value, prevLineEnd);
                const prevLineLength = prevLineEnd - prevLineStart;
                return prevLineStart + Math.min(col, prevLineLength);
              });
            }
            return;
          }
          case "cursorDown": {
            resetBlink();
            if (lineWidth > 0) {
              const newPos = computeVisualDownCursor(
                value,
                cursor,
                lineWidth,
                visualRows,
              );
              if (newPos !== null) {
                setCursor(newPos);
              } else {
                const trailingEmpty = countTrailingEmptyLines(value);
                if (trailingEmpty >= autoNewLineLimit) {
                  if (onLastLineDown) {
                    onLastLineDown();
                    return;
                  }
                  setCursor(value.length);
                  return;
                }
                pushUndo("insert", value, cursor);
                const newValue = value + "\n";
                setValue(newValue);
                setCursor(newValue.length, newValue);
              }
            } else {
              const currentLineEnd = findLineEnd(value, cursor);
              const isOnLastLine = currentLineEnd >= value.length;
              if (isOnLastLine) {
                const trailingEmpty = countTrailingEmptyLines(value);
                if (trailingEmpty >= autoNewLineLimit) {
                  if (onLastLineDown) {
                    onLastLineDown();
                    return;
                  }
                  setCursor(value.length);
                  return;
                }
                pushUndo("insert", value, cursor);
                const newValue = value + "\n";
                setValue(newValue);
                setCursor(newValue.length, newValue);
              } else {
                setCursor((c) => {
                  const { column } = getCursorLineAndColumn(value, c);
                  const nextLineStart = currentLineEnd + 1;
                  const nextLineEnd = findLineEnd(value, nextLineStart);
                  const nextLineLength = nextLineEnd - nextLineStart;
                  return nextLineStart + Math.min(column, nextLineLength);
                });
              }
            }
            return;
          }
          case "cursorLeft":
            if (cursor === 0) {
              if (onFirstCharacterLeft) onFirstCharacterLeft();
              return;
            }
            resetBlink();
            setCursor((c) => prevGraphemeOffset(value, c));
            return;
          case "cursorRight":
            if (cursor === value.length) {
              if (onLastCharacterRight) onLastCharacterRight();
              return;
            }
            resetBlink();
            setCursor((c) => nextGraphemeOffset(value, c));
            return;
          case "prevWord":
            resetBlink();
            setCursor((c) => findPrevWordBoundary(value, c));
            return;
          case "nextWord":
            resetBlink();
            setCursor((c) => findNextWordBoundary(value, c));
            return;
          case "lineStart":
            resetBlink();
            setCursor((c) => findLineStart(value, c));
            return;
          case "lineEnd":
            resetBlink();
            setCursor((c) => findLineEnd(value, c));
            return;
          case "cursorForwardChar":
            if (cursor === value.length) {
              if (onLastCharacterRight) onLastCharacterRight();
              return;
            }
            resetBlink();
            setCursor((c) => nextGraphemeOffset(value, c));
            return;
          case "cursorBackwardChar":
            if (cursor === 0) {
              if (onFirstCharacterLeft) onFirstCharacterLeft();
              return;
            }
            resetBlink();
            setCursor((c) => prevGraphemeOffset(value, c));
            return;
          case "deletePrevWord": {
            resetBlink();
            const boundary = findPrevWordBoundary(value, cursor);
            const killed = value.slice(boundary, cursor);
            if (killed) pushKill(killed);
            pushUndo("delete", value, cursor);
            const newValue = value.slice(0, boundary) + value.slice(cursor);
            setValue(newValue);
            setCursor(boundary, newValue);
            resetMutationTracking();
            return;
          }
          case "killToLineStart":
            killToLineStart();
            return;
          case "killToLineEnd": {
            resetBlink();
            const lineEnd = findLineEnd(value, cursor);
            const killEnd = value[lineEnd] === "\n" ? lineEnd + 1 : lineEnd;
            const killed = value.slice(cursor, killEnd);
            if (killed) pushKill(killed, true);
            pushUndo("delete", value, cursor);
            const newValue = value.slice(0, cursor) + value.slice(killEnd);
            setValue(newValue);
            setCursor(cursor, newValue);
            resetMutationTracking();
            return;
          }
          case "deletePrevGrapheme":
            if (cursor > 0) {
              resetBlink();
              pushUndo("delete", value, cursor);
              const target = prevGraphemeOffset(value, cursor);
              const newValue = value.slice(0, target) + value.slice(cursor);
              setValue(newValue);
              setCursor(target, newValue);
            }
            return;
          case "undo": {
            resetBlink();
            const entry = undo(value, cursor);
            if (entry) {
              setValue(entry.value);
              setCursor(entry.cursor);
            }
            resetMutationTracking();
            return;
          }
          case "redo": {
            resetBlink();
            const entry = redo(value, cursor);
            if (entry) {
              setValue(entry.value);
              setCursor(entry.cursor);
            }
            resetMutationTracking();
            return;
          }
          case "yank": {
            const text = yank();
            if (!text) return;
            resetBlink();
            pushUndo("insert", value, cursor);
            const newValue = value.slice(0, cursor) + text + value.slice(cursor);
            setValue(newValue);
            setCursor(cursor + text.length, newValue);
            setLastYankLength(text.length);
            resetMutationTracking();
            return;
          }
          case "yankPop": {
            const lastYankLength = getLastYankLength();
            const text = yankPop();
            if (!text) return;
            resetBlink();
            const deleteStart = Math.max(0, cursor - lastYankLength);
            pushUndo("insert", value, deleteStart);
            const newValue =
              value.slice(0, deleteStart) + text + value.slice(cursor);
            setValue(newValue);
            setCursor(deleteStart + text.length, newValue);
            setLastYankLength(text.length);
            resetMutationTracking();
            return;
          }
        }
      };

      const dispatchChord = (chord: TKeybinding): void => {
        const action = keyActions[chord];
        if (action === null) return;
        runAction(action);
      };

      const handleChord = (chord: TKeybinding): void => {
        dispatchChord(chord);
      };

      const isCtrlJ = key.ctrl && input === "j";
      const isCtrlEnter =
        (key.return && key.ctrl) ||
        input === "\x1b[27;5;13~" ||
        input.endsWith("[27;5;13~");
      const isShiftEnter =
        (key.return && key.shift) ||
        input === "\x1b[27;2;13~" ||
        input.endsWith("[27;2;13~");
      const isAltEnter =
        (key.return && key.meta) ||
        input === "\x1b[27;3;13~" ||
        input.endsWith("[27;3;13~");

      const newlineChord: TKeybinding | null = isCtrlJ
        ? "Ctrl+J"
        : isCtrlEnter
          ? "Ctrl+Enter"
          : isShiftEnter
            ? "Shift+Enter"
            : isAltEnter
              ? "Alt+Enter"
              : null;

      if (newlineChord) {
        handleChord(newlineChord);
        return;
      }

      if (key.return) {
        handleChord("Enter");
        return;
      }

      if (key.upArrow) {
        handleChord("Up");
        return;
      }

      if (key.downArrow) {
        handleChord("Down");
        return;
      }

      if (key.leftArrow) {
        handleChord("Left");
        return;
      }

      if (key.rightArrow) {
        handleChord("Right");
        return;
      }

      if (key.meta && input === "b") {
        handleChord("Alt+B");
        return;
      }

      if (key.meta && input === "f") {
        handleChord("Alt+F");
        return;
      }

      if (key.ctrl && input === "a") {
        handleChord("Ctrl+A");
        return;
      }

      if (key.ctrl && input === "e") {
        handleChord("Ctrl+E");
        return;
      }

      if (key.ctrl && input === "f") {
        handleChord("Ctrl+F");
        return;
      }

      if (key.ctrl && input === "b") {
        handleChord("Ctrl+B");
        return;
      }

      if (key.ctrl && input === "w") {
        handleChord("Ctrl+W");
        return;
      }

      if (key.ctrl && input === "u") {
        handleChord("Ctrl+U");
        return;
      }

      if (key.ctrl && input === "k") {
        handleChord("Ctrl+K");
        return;
      }

      if (key.backspace || key.delete) {
        if (key.super && key.backspace) {
          dispatchChord("Ctrl+U");
          return;
        }
        if (key.meta) {
          handleChord("Alt+Backspace");
          return;
        }
        const chord: TKeybinding = key.backspace ? "Backspace" : "Delete";
        handleChord(chord);
        return;
      }

      if (key.ctrl && input === "z") {
        handleChord("Ctrl+Z");
        return;
      }

      if (key.ctrl && input === "y") {
        handleChord("Ctrl+Y");
        return;
      }

      if (key.meta && input === "y") {
        handleChord("Alt+Y");
        return;
      }

      if (key.tab) {
        if (onTab) onTab(!!key.shift);
        return;
      }

      if (key.ctrl || key.escape) {
        return;
      }

      if (input && input.length > 0) {
        resetBlink();
        pushUndo("insert", value, cursor);
        const newValue = value.slice(0, cursor) + input + value.slice(cursor);
        setValue(newValue);
        setCursor(cursor + input.length, newValue);
      }
    },
    { isActive },
  );
};
