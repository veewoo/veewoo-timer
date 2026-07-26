import { MINUTES_25 } from "@/constants";
import { TimerState } from "@/types";
import { useCallback, useState } from "react";

export const useTimerState = () => {
  const [timerState, setTimerState] = useState<TimerState>("stopped");
  const [remainingTime, setRemainingTime] = useState<number>(MINUTES_25);

  const startTimer = useCallback(() => setTimerState("active"), []);
  const pauseTimer = useCallback(() => setTimerState("paused"), []);
  const stopTimer = useCallback(() => {
    setTimerState("stopped");
    setRemainingTime(MINUTES_25);
  }, []);

  return {
    timerState,
    remainingTime,
    startTimer,
    pauseTimer,
    stopTimer,
    setRemainingTime,
  };
};
