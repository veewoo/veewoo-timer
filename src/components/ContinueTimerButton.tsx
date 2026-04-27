import { IconButton } from "@chakra-ui/react";
import { FaRecycle } from "react-icons/fa";
import { useSettings } from "@/context/SettingsContext";

const ContinueTimerButton = () => {
  const {
    state: { continueTimerOnEnd },
    dispatch: settingsDispatch,
  } = useSettings();

  return (
    <IconButton
      aria-label="Continue timer"
      size="sm"
      colorScheme={continueTimerOnEnd ? "blue" : "gray"}
      onClick={() => {
        settingsDispatch({
          type: "TOGGLE_CONTINUE_TIMER_ON_END",
        });
      }}
    >
      <FaRecycle />
    </IconButton>
  );
};

export default ContinueTimerButton;
