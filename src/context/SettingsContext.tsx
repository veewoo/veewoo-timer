import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode,
} from "react";

interface SettingsState {
  wakeLock: WakeLockSentinel | null;
}

interface SettingsAction {
  type: "SET_WAKE_LOCK";
  payload?: WakeLockSentinel | null;
}

const SettingsContext = createContext<{
  state: SettingsState;
  dispatch: React.Dispatch<SettingsAction>;
}>({
  state: { wakeLock: null },
  dispatch: () => null,
});

const settingsReducer = (
  state: SettingsState,
  action: SettingsAction
): SettingsState => {
  switch (action.type) {
    case "SET_WAKE_LOCK":
      return { ...state, wakeLock: action.payload || null };
    default:
      return state;
  }
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(settingsReducer, {
    wakeLock: null,
  });

  return (
    <SettingsContext.Provider value={{ state, dispatch }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
