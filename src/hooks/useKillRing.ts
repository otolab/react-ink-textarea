import { useRef } from "react";

const MAX_KILL_RING = 128;

export type UseKillRingReturn = {
  pushKill: (text: string, append?: boolean) => void;
  yank: () => string;
  yankPop: () => string;
  resetYankState: () => void;
  getLastYankLength: () => number;
  setLastYankLength: (length: number) => void;
};

/**
 * Readline-style kill ring for Emacs yank (`Ctrl+Y`) / yank-pop (`Alt+Y`).
 */
export const useKillRing = (): UseKillRingReturn => {
  const ring = useRef<string[]>([]);
  const yankIndex = useRef(-1);
  const lastWasKill = useRef(false);
  const lastYankLength = useRef(0);

  const pushKill = (text: string, append = false): void => {
    if (!text) return;
    if (append && lastWasKill.current && ring.current.length > 0) {
      ring.current[ring.current.length - 1] += text;
    } else {
      ring.current.push(text);
      if (ring.current.length > MAX_KILL_RING) {
        ring.current.shift();
      }
    }
    lastWasKill.current = true;
    yankIndex.current = ring.current.length - 1;
    lastYankLength.current = 0;
  };

  const yank = (): string => {
    lastWasKill.current = false;
    if (ring.current.length === 0) return "";
    yankIndex.current = ring.current.length - 1;
    return ring.current[yankIndex.current] ?? "";
  };

  const yankPop = (): string => {
    lastWasKill.current = false;
    if (ring.current.length === 0) return "";
    if (yankIndex.current <= 0) {
      yankIndex.current = ring.current.length - 1;
    } else {
      yankIndex.current -= 1;
    }
    return ring.current[yankIndex.current] ?? "";
  };

  const resetYankState = (): void => {
    lastYankLength.current = 0;
  };

  return {
    pushKill,
    yank,
    yankPop,
    resetYankState,
    getLastYankLength: () => lastYankLength.current,
    setLastYankLength: (length: number) => {
      lastYankLength.current = length;
    },
  };
};
