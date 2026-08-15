import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "ink-testing-library";
import { Text } from "ink";
import { TextArea } from "../../src/index.js";
import { tick } from "../_util/wait.js";

const setCursorPosition = vi.fn();

vi.mock("ink", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ink")>();
  return {
    ...actual,
    useCursor: () => ({ setCursorPosition }),
  };
});

describe("TextArea IME cursor", () => {
  beforeEach(() => {
    setCursorPosition.mockClear();
  });

  it("calls setCursorPosition during render when focused with cursorStart", async () => {
    render(
      <TextArea
        focus={true}
        onSubmit={() => {}}
        value="ab"
        cursorPosition={[0, 2]}
        onChange={() => {}}
        cursorStart={{ x: 3, y: 4 }}
      />,
    );
    await tick();

    expect(setCursorPosition).toHaveBeenCalled();
    const last = setCursorPosition.mock.calls.at(-1)?.[0];
    expect(last).toEqual({ x: 3 + 2, y: 4 });
  });

  it("hides IME cursor when not focused", async () => {
    render(
      <TextArea
        focus={false}
        onSubmit={() => {}}
        value="ab"
        cursorPosition={[0, 2]}
        onChange={() => {}}
        cursorStart={{ x: 0, y: 0 }}
      />,
    );
    await tick();

    expect(setCursorPosition).toHaveBeenCalledWith(undefined);
  });

  it("does not position IME cursor when cursorStart is omitted", async () => {
    render(
      <TextArea
        focus={true}
        onSubmit={() => {}}
        value="ab"
        cursorPosition={[0, 2]}
        onChange={() => {}}
      />,
    );
    await tick();

    expect(setCursorPosition).toHaveBeenCalledWith(undefined);
  });

  it("adjusts Y for viewport scroll", async () => {
    const value = Array.from({ length: 20 }, (_, i) => `row${i}`).join("\n");
    const { stdin } = render(
      <TextArea
        focus={true}
        onSubmit={() => {}}
        value={value}
        cursorPosition={[0, 0]}
        onChange={() => {}}
        viewportLines={5}
        cursorStart={{ x: 0, y: 1 }}
      />,
    );
    await tick();

    for (let i = 0; i < 7; i++) {
      stdin.write("\x1b[B");
      await tick();
    }

    const last = setCursorPosition.mock.calls.at(-1)?.[0];
    expect(last?.y).toBeGreaterThan(1);
  });

  it("includes measured prefix width in X when linePrefix is set", async () => {
    render(
      <TextArea
        focus={true}
        onSubmit={() => {}}
        value="x"
        cursorPosition={[0, 1]}
        onChange={() => {}}
        linePrefix={<Text>{"| "}</Text>}
        cursorStart={{ x: 0, y: 0 }}
      />,
    );
    await tick();
    await tick();

    const positioned = setCursorPosition.mock.calls
      .map((call) => call[0])
      .filter((pos): pos is { x: number; y: number } => pos != null);
    expect(positioned.some((pos) => pos.x >= 2)).toBe(true);
  });
});
