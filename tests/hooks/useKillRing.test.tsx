import { afterEach, describe, expect, it } from "vitest";
import { useEffect } from "react";
import { cleanup, render } from "ink-testing-library";
import { useKillRing } from "../../src/hooks/useKillRing.js";

describe("useKillRing", () => {
  afterEach(() => {
    cleanup();
  });

  it("yanks the most recent kill and appends consecutive kills", async () => {
    let api: ReturnType<typeof useKillRing> | undefined;

    function KillRingProbe({
      onReady,
    }: {
      readonly onReady: (readyApi: ReturnType<typeof useKillRing>) => void;
    }) {
      const readyApi = useKillRing();
      useEffect(() => {
        onReady(readyApi);
      }, [readyApi, onReady]);
      return null;
    }

    render(
      <KillRingProbe
        onReady={(readyApi) => {
          api = readyApi;
        }}
      />,
    );
    await new Promise((r) => setTimeout(r, 30));

    expect(api).toBeDefined();
    api!.pushKill("remove");
    api!.pushKill(" tail", true);
    expect(api!.yank()).toBe("remove tail");
  });

  it("rotates the kill ring with yankPop", async () => {
    let api: ReturnType<typeof useKillRing> | undefined;

    function KillRingProbe({
      onReady,
    }: {
      readonly onReady: (readyApi: ReturnType<typeof useKillRing>) => void;
    }) {
      const readyApi = useKillRing();
      useEffect(() => {
        onReady(readyApi);
      }, [readyApi, onReady]);
      return null;
    }

    render(
      <KillRingProbe
        onReady={(readyApi) => {
          api = readyApi;
        }}
      />,
    );
    await new Promise((r) => setTimeout(r, 30));

    api!.pushKill("first");
    api!.pushKill("second");
    expect(api!.yank()).toBe("second");
    expect(api!.yankPop()).toBe("first");
    expect(api!.yankPop()).toBe("second");
  });
});
