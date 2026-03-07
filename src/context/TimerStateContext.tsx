import { MINUTES_25 } from "@/constants";
import { TimerState } from "@/types";
import React, { createContext, useReducer, useContext, ReactNode } from "react";

interface Timer {
  timerState: TimerState;
  remainingTime: number;
}

interface TimerAction {
  type: "START_TIMER" | "PAUSE_TIMER" | "STOP_TIMER" | "SET_REMAINING_TIME";
  payload?: number;
}

const initialState: Timer = {
  timerState: "stopped",
  remainingTime: MINUTES_25,
};

const TimerContext = createContext<{
  state: Timer;
  dispatch: React.Dispatch<TimerAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

const timerReducer = (state: Timer, action: TimerAction): Timer => {
  switch (action.type) {
    case "START_TIMER":
      return { ...state, timerState: "active" };
    case "STOP_TIMER":
      return { ...state, timerState: "stopped", remainingTime: MINUTES_25 };
    case "PAUSE_TIMER":
      return { ...state, timerState: "paused" };
    case "SET_REMAINING_TIME":
      return { ...state, remainingTime: action.payload! };
    default:
      return state;
  }
};

export const TimerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(timerReducer, initialState);

  return (
    <TimerContext.Provider value={{ state, dispatch }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
