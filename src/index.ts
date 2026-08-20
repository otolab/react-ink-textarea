export { TextArea } from "./TextArea.js";
export type {
  TextAreaProps,
  TextAreaHandle,
  CursorStart,
  TLinePrefixProps,
  TLinePrefixFn,
  TLineSuffixProps,
  TLineSuffixFn,
  TShowInvisibles,
  TStyleProps,
  TStyles,
  TLabels,
  TLabelRule,
  TLabelFn,
  TKeybinding,
  TKeyAction,
  TKeybindingSetting,
  TKeybindings,
} from "./types.js";
export {
  DEFAULT_KEY_ACTIONS,
  UPSTREAM_KEY_ACTIONS,
} from "./constants.js";
export { resolveKeyAction, resolveKeyActions } from "./keybindings.js";
export { LineNumber } from "./LineNumber.js";
export type { LineNumberProps } from "./LineNumber.js";
export { LineNumberPrefix } from "./LineNumberPrefix.js";
export type { LineNumberPrefixProps } from "./LineNumberPrefix.js";
