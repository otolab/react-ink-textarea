import type { TKeyAction, TKeybinding } from "./types.js";

export const DEFAULT_CURSOR_INTERVAL = 500;
export const DEFAULT_TYPING_PAUSE = 450;
export const DEFAULT_MAX_UNDO = 128;
export const DEFAULT_UNDO_GROUP_DELAY = 750;
export const DEFAULT_AUTO_NEW_LINE_LIMIT = 3;
export const DEFAULT_INITIAL_LINE_COUNT = 2;
export const DEFAULT_TAB_WIDTH = 4;

/** Default chord → action map for this fork (Readline yank on `Ctrl+Y`). */
export const DEFAULT_KEY_ACTIONS: Readonly<Record<TKeybinding, TKeyAction>> = {
  Enter: "submit",
  "Ctrl+J": "insertNewline",
  "Ctrl+Enter": "insertNewline",
  "Shift+Enter": "insertNewline",
  "Alt+Enter": "insertNewline",
  Up: "cursorUp",
  Down: "cursorDown",
  Left: "cursorLeft",
  Right: "cursorRight",
  "Alt+B": "prevWord",
  "Alt+F": "nextWord",
  "Ctrl+A": "lineStart",
  "Ctrl+E": "lineEnd",
  "Ctrl+F": "cursorForwardChar",
  "Ctrl+B": "cursorBackwardChar",
  "Ctrl+D": "deleteNextGrapheme",
  "Ctrl+P": "cursorUpVisualRow",
  "Ctrl+N": "cursorDownVisualRow",
  "Ctrl+W": "deletePrevWord",
  "Ctrl+U": "killToLineStart",
  "Ctrl+K": "killToLineEnd",
  Backspace: "deletePrevGrapheme",
  Delete: "deletePrevGrapheme",
  "Alt+Backspace": "deletePrevWord",
  "Ctrl+Z": "undo",
  "Ctrl+Y": "yank",
  "Alt+Y": "yankPop",
};

/** @deprecated Boolean toggles only; prefer `DEFAULT_KEY_ACTIONS` + `TKeybindings`. */
export const DEFAULT_KEYBINDINGS: Readonly<Record<TKeybinding, boolean>> = {
  Enter: true,
  "Ctrl+J": true,
  "Ctrl+Enter": true,
  "Shift+Enter": true,
  "Alt+Enter": true,
  Up: true,
  Down: true,
  Left: true,
  Right: true,
  "Alt+B": true,
  "Alt+F": true,
  "Ctrl+A": true,
  "Ctrl+E": true,
  "Ctrl+F": true,
  "Ctrl+B": true,
  "Ctrl+D": true,
  "Ctrl+P": true,
  "Ctrl+N": true,
  "Ctrl+W": true,
  "Ctrl+U": true,
  "Ctrl+K": true,
  Backspace: true,
  Delete: true,
  "Alt+Backspace": true,
  "Ctrl+Z": true,
  "Ctrl+Y": true,
  "Alt+Y": true,
};

export const NAV_KEYBINDINGS: readonly TKeybinding[] = [
  "Up",
  "Down",
  "Left",
  "Right",
  "Alt+B",
  "Alt+F",
  "Ctrl+A",
  "Ctrl+E",
  "Ctrl+F",
  "Ctrl+B",
  "Ctrl+P",
  "Ctrl+N",
];
