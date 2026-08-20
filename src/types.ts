import type { ReactNode } from "react";

export type TLinePrefixProps = {
  readonly lineNumber: number;
  readonly totalLines: number;
  readonly isActiveLine: boolean;
  readonly isVirtualLine: boolean;
  readonly isContinuationLine: boolean;
  readonly continuationIndex: number;
  readonly isLastChunkOfLine: boolean;
};

export type TLinePrefixFn = (props: TLinePrefixProps) => ReactNode;

// A suffix is decorated with the same per-line information as a prefix.
export type TLineSuffixProps = TLinePrefixProps;

export type TLineSuffixFn = (props: TLineSuffixProps) => ReactNode;

export type TShowInvisibles =
  | boolean
  | {
      readonly space?: boolean;
      readonly tab?: boolean;
      readonly newline?: boolean;
    };

export type TStyleProps = {
  readonly color?: string;
  readonly bold?: boolean;
  readonly italic?: boolean;
  readonly underline?: boolean;
  readonly strikethrough?: boolean;
  readonly dim?: boolean;
  readonly inverse?: boolean;
  readonly bgColor?: string;
};

export type TStyles = {
  readonly text?: TStyleProps;
  readonly invisibleCharacter?: TStyleProps;
  readonly [labelName: string]: TStyleProps | undefined;
};

export type TLabelFn = (match: RegExpMatchArray) => string | undefined;
export type TLabelRule = {
  readonly pattern: RegExp;
  readonly label: string | TLabelFn;
};
export type TLabels = readonly TLabelRule[];

export type TKeybinding =
  | "Enter"
  | "Ctrl+J"
  | "Ctrl+Enter"
  | "Shift+Enter"
  | "Alt+Enter"
  | "Up"
  | "Down"
  | "Left"
  | "Right"
  | "Alt+B"
  | "Alt+F"
  | "Ctrl+A"
  | "Ctrl+E"
  | "Ctrl+F"
  | "Ctrl+B"
  | "Ctrl+W"
  | "Ctrl+U"
  | "Ctrl+K"
  | "Backspace"
  | "Delete"
  | "Alt+Backspace"
  | "Ctrl+Z"
  | "Ctrl+Y"
  | "Alt+Y";

/** Built-in editing actions bound to keyboard chords. */
export type TKeyAction =
  | "submit"
  | "insertNewline"
  | "cursorUp"
  | "cursorDown"
  | "cursorLeft"
  | "cursorRight"
  | "prevWord"
  | "nextWord"
  | "lineStart"
  | "lineEnd"
  | "cursorForwardChar"
  | "cursorBackwardChar"
  | "deletePrevWord"
  | "killToLineStart"
  | "killToLineEnd"
  | "deletePrevGrapheme"
  | "undo"
  | "redo"
  | "yank"
  | "yankPop";

/**
 * Per-chord keybinding setting.
 *
 * - `true` (default when omitted): use the fork's default action for the chord
 * - `false`: disable the chord
 * - `TKeyAction`: run this action instead (upstream-style `"Ctrl+Y": "redo"`)
 */
export type TKeybindingSetting = boolean | TKeyAction;

export type TKeybindings = Partial<
  Readonly<Record<TKeybinding, TKeybindingSetting>>
>;

export type TextAreaHandle = {
  readonly insert: (text: string) => void;
};

/**
 * Ink output origin for IME cursor placement (`useCursor` / `setCursorPosition`).
 * Matches the `cursorStart` pattern from ink-text-input PR #93.
 */
export type CursorStart = {
  readonly x?: number;
  readonly y: number;
};

export type TextAreaProps = {
  readonly focus: boolean;
  readonly onSubmit: (value: string) => void;
  readonly placeholder?: string;
  readonly linePrefix?: ReactNode | TLinePrefixFn;
  readonly lineSuffix?: ReactNode | TLineSuffixFn;
  readonly cursorInterval?: number;
  readonly typingPause?: number;
  readonly maxUndo?: number;
  readonly undoGroupDelay?: number;
  readonly autoNewLineLimit?: number;
  readonly highlightActiveLine?: boolean;
  readonly activeLineColor?: string;
  readonly disableArrowNavigation?: boolean;
  readonly disableCursorBlink?: boolean;
  // Controlled mode props
  readonly value?: string;
  readonly cursorPosition?: [line: number, col: number];
  readonly onChange?: (value: string) => void;
  readonly onCursorChange?: (
    position: [line: number, col: number],
    type: string,
    chunkIndex: number,
  ) => void;
  // Boundary navigation handlers
  readonly onFirstLineUp?: () => void;
  readonly onLastLineDown?: () => void;
  readonly onFirstCharacterLeft?: () => void;
  readonly onLastCharacterRight?: () => void;
  readonly onTab?: (shift: boolean) => void;
  // Initial line count
  readonly initialLineCount?: number;
  // Maximum number of visual rows to render at once. When set, the textarea
  // virtualizes rendering by slicing visualRows around the cursor and
  // auto-scrolling to keep the cursor visible. Defaults to no cap (renders
  // every row).
  readonly viewportLines?: number;
  /**
   * When set and `focus` is true, positions the terminal cursor for OS IME
   * composition via Ink `useCursor`. `y` is the visual row of the textarea's
   * first rendered line; `x` is the left edge of each row (prefix width is added).
   */
  readonly cursorStart?: CursorStart;
  readonly tabWidth?: number;
  readonly onDimensions?: (width: number) => void;
  readonly showInvisibles?: TShowInvisibles;
  readonly styles?: TStyles;
  readonly labels?: TLabels;
  readonly keybindings?: TKeybindings;
};
