"use client";

import { useTimer } from "@/context/TimerStateContext";
import {
  Box,
  Button,
  Text,
  Stack,
  ProgressCircle,
  AbsoluteCenter,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import { useTask } from "@/context/TaskContext";
import { calculateElapsedTime, formatTime } from "@/utils";
import { MINUTES_25 } from "@/constants";
import { useSettings } from "@/context/SettingsContext";

interface CurrentTimerProps {
  variant: "default" | "embed";
  onTimerStart: () => void;
  onTimerPause: (remainingTime: number) => void;
  onTimerStop: () => void;
}

const CurrentTimer: React.FC<CurrentTimerProps> = ({
  variant,
  onTimerStart,
  onTimerPause,
  onTimerStop,
}) => {
  const {
    state: { timerState, remainingTime },
    dispatch,
  } = useTimer();

  const {
    state: { inProgressTask, selectedTask },
  } = useTask();

  const {
    state: { continueTimerOnEnd },
  } = useSettings();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerState === "active") {
      intervalRef.current = setInterval(() => {
        const newElapsedTime = calculateElapsedTime(inProgressTask?.startTime);
        const secondsCounted =
          (selectedTask?.secondsCounted || 0) + newElapsedTime;
        const secondsCountedInCurrentCycle = secondsCounted % MINUTES_25;
        let newRemainingTime = MINUTES_25 - secondsCountedInCurrentCycle;

        if (
          secondsCountedInCurrentCycle === 0 &&
          secondsCounted !== 0 &&
          !continueTimerOnEnd
        ) {
          newRemainingTime = MINUTES_25;
          dispatch({ type: "STOP_TIMER" });
          onTimerStop();
        }

        dispatch({
          type: "SET_REMAINING_TIME",
          payload: newRemainingTime,
        });
      }, 1000);
    } else {
      clearTimerInterval();
    }
    return () => {
      clearTimerInterval();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerState]);

  function clearTimerInterval() {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  const startTimer = async () => {
    dispatch({ type: "START_TIMER" });
    onTimerStart();
  };

  const pauseTimer = async () => {
    dispatch({ type: "PAUSE_TIMER" });
    onTimerPause(remainingTime);
  };

  const stopTimer = async () => {
    dispatch({ type: "STOP_TIMER" });
    onTimerStop();
  };

  return (
    <Box mb={4} textAlign="center">
      <Stack
        direction={variant === "default" ? "column" : "row"}
        alignItems="center"
      >
        {variant === "default" && (
          <ProgressCircle.Root
            value={((MINUTES_25 - remainingTime) / MINUTES_25) * 100}
            mb={4}
          >
            <ProgressCircle.Circle
              css={{
                "--size": "200px",
                "--thickness": "12px",
              }}
            >
              <ProgressCircle.Track />
              <ProgressCircle.Range />
            </ProgressCircle.Circle>
            <AbsoluteCenter>
              <ProgressCircle.ValueText fontSize="4xl" fontWeight="bold">
                {formatTime(remainingTime)}
              </ProgressCircle.ValueText>
            </AbsoluteCenter>
          </ProgressCircle.Root>
        )}
        {variant === "embed" && (
          <Text fontSize="xl" fontWeight="bold" color="teal.500">
            {formatTime(remainingTime)}
          </Text>
        )}
        <Stack direction="row" gap={2} justify="center">
          {(timerState === "paused" || timerState == "stopped") && (
            <Button
              size="sm"
              colorScheme="teal"
              onClick={startTimer}
              disabled={!selectedTask}
            >
              <FaPlay />
              Start
            </Button>
          )}
          {timerState === "active" && (
            <Button size="sm" colorScheme="yellow" onClick={pauseTimer}>
              <FaPause />
              Pause
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default CurrentTimer;
