import { useEffect, useRef } from "react";

const HOLD_DELAY_MS = 400;
const HOLD_INTERVAL_MS = 80;
const HOLD_STEP_SEC = 0.45;

export function useHoldSeek({ onShortSeek, onHoldStep, enabled = true }) {
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const longPressRef = useRef(false);

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timerRef.current = null;
    intervalRef.current = null;
  };

  useEffect(() => clear, []);

  const getHandlers = (direction) => {
    if (!enabled) return {};

    return {
      onPointerDown: (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        longPressRef.current = false;
        clear();

        timerRef.current = setTimeout(() => {
          longPressRef.current = true;
          onHoldStep(direction * HOLD_STEP_SEC);
          intervalRef.current = setInterval(
            () => onHoldStep(direction * HOLD_STEP_SEC),
            HOLD_INTERVAL_MS
          );
        }, HOLD_DELAY_MS);
      },
      onPointerUp: () => {
        if (!longPressRef.current) onShortSeek();
        clear();
        longPressRef.current = false;
      },
      onPointerLeave: () => {
        clear();
        longPressRef.current = false;
      },
      onPointerCancel: () => {
        clear();
        longPressRef.current = false;
      },
      onContextMenu: (e) => e.preventDefault(),
    };
  };

  return { getHandlers };
}
