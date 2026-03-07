import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  useState,
} from "react";

interface SettingsState {
  continueTimerOnEnd: boolean;
  wakeLock: WakeLockSentinel | null;
}

interface SettingsAction {
  type: "TOGGLE_CONTINUE_TIMER_ON_END" | "SET_WAKE_LOCK";
  payload?: WakeLockSentinel | null;
}

const initialState: Omit<SettingsState, "wakeLock"> = {
  continueTimerOnEnd: false,
};

const SettingsContext = createContext<{
  state: SettingsState;
  dispatch: React.Dispatch<SettingsAction>;
}>({
  state: { ...initialState, wakeLock: null },
  dispatch: () => null,
});

const settingsReducer = (
  state: SettingsState,
  action: SettingsAction
): SettingsState => {
  switch (action.type) {
    case "TOGGLE_CONTINUE_TIMER_ON_END":
      return { ...state, continueTimerOnEnd: !state.continueTimerOnEnd };
    case "SET_WAKE_LOCK":
      return { ...state, wakeLock: action.payload || null };
    default:
      return state;
  }
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [state, dispatch] = useReducer(settingsReducer, {
    ...initialState,
    wakeLock,
  });

  return (
    <SettingsContext.Provider value={{ state, dispatch }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
