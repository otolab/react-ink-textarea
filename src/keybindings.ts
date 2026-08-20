import { DEFAULT_KEY_ACTIONS, NAV_KEYBINDINGS } from "./constants.js";
import type { TKeyAction, TKeybinding, TKeybindings } from "./types.js";

export const ALL_KEYBINDINGS: readonly TKeybinding[] = Object.keys(
  DEFAULT_KEY_ACTIONS,
) as TKeybinding[];

/**
 * Resolve one chord's effective action from a user setting.
 *
 * - `undefined` / `true` → default action for the chord
 * - `false` → disabled (chord swallowed)
 * - `TKeyAction` → override (upstream-compatible `"Ctrl+Y": "redo"`, etc.)
 */
export const resolveKeyAction = (
  setting: TKeybindings[TKeybinding] | undefined,
  defaultAction: TKeyAction,
): TKeyAction | null => {
  if (setting === false) return null;
  if (setting === true || setting === undefined) return defaultAction;
  return setting;
};

/** Build the full chord → action map used by `useKeyboardInput`. */
export const resolveKeyActions = (
  overrides: TKeybindings | undefined,
  defaults: Readonly<Record<TKeybinding, TKeyAction>> = DEFAULT_KEY_ACTIONS,
  disableArrowNavigation = false,
): Readonly<Record<TKeybinding, TKeyAction | null>> => {
  const result = {} as Record<TKeybinding, TKeyAction | null>;
  for (const chord of ALL_KEYBINDINGS) {
    result[chord] = resolveKeyAction(overrides?.[chord], defaults[chord]);
  }
  if (disableArrowNavigation) {
    for (const chord of NAV_KEYBINDINGS) {
      result[chord] = null;
    }
  }
  return result;
};
