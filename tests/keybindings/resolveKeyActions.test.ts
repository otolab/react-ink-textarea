import { describe, expect, it } from "vitest";
import { DEFAULT_KEY_ACTIONS } from "../../src/constants.js";
import { resolveKeyAction, resolveKeyActions } from "../../src/keybindings.js";

describe("resolveKeyAction", () => {
  it("uses the default action when setting is omitted or true", () => {
    expect(resolveKeyAction(undefined, "yank")).toBe("yank");
    expect(resolveKeyAction(true, "yank")).toBe("yank");
  });

  it("returns null when disabled", () => {
    expect(resolveKeyAction(false, "yank")).toBeNull();
  });

  it("accepts an action override", () => {
    expect(resolveKeyAction("redo", "yank")).toBe("redo");
  });
});

describe("resolveKeyActions", () => {
  it("maps every chord to a default fork action", () => {
    const actions = resolveKeyActions(undefined);
    expect(actions["Ctrl+Y"]).toBe("yank");
    expect(actions["Alt+Y"]).toBe("yankPop");
    expect(actions["Ctrl+F"]).toBe("cursorForwardChar");
  });

  it("supports per-chord action override", () => {
    const actions = resolveKeyActions({ "Ctrl+Y": "redo" });
    expect(actions["Ctrl+Y"]).toBe("redo");
    expect(actions["Ctrl+Z"]).toBe("undo");
  });

  it("force-disables navigation chords when requested", () => {
    const actions = resolveKeyActions({ Up: true }, DEFAULT_KEY_ACTIONS, true);
    expect(actions.Up).toBeNull();
    expect(actions["Ctrl+F"]).toBeNull();
    expect(actions.Enter).toBe("submit");
  });
});
