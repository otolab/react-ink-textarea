import { describe, expect, it } from "vitest";
import {
  DEFAULT_KEY_ACTIONS,
  UPSTREAM_KEY_ACTIONS,
} from "../../src/constants.js";
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

  it("supports upstream-style Ctrl+Y redo override", () => {
    const fromUpstreamDefaults = resolveKeyActions(
      undefined,
      UPSTREAM_KEY_ACTIONS,
    );
    expect(fromUpstreamDefaults["Ctrl+Y"]).toBe("redo");

    const perChord = resolveKeyActions({ "Ctrl+Y": "redo" });
    expect(perChord["Ctrl+Y"]).toBe("redo");
  });

  it("force-disables navigation chords when requested", () => {
    const actions = resolveKeyActions({ Up: true }, DEFAULT_KEY_ACTIONS, true);
    expect(actions.Up).toBeNull();
    expect(actions["Ctrl+F"]).toBeNull();
    expect(actions.Enter).toBe("submit");
  });
});
