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

interface CurrentTimerProps {
  variant: "default" | "embed";
  onTimerStart: () => void;
  onTimerPause: (remainingTime: number) => void;
  onTimerFinish: () => void;
}

const CurrentTimer: React.FC<CurrentTimerProps> = ({
  variant,
  onTimerStart,
  onTimerPause,
  onTimerFinish,
}) => {
  const {
    state: { timerState, remainingTime },
    dispatch,
  } = useTimer();

  const {
    state: { inProgressTask, selectedTask },
  } = useTask();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (inProgressTask && timerState === "active") {
      intervalRef.current = setInterval(() => {
        const newElapsedTime = calculateElapsedTime(inProgressTask.startTime);
        if (newElapsedTime >= remainingTime) {
          dispatch({ type: "SET_REMAINING_TIME", payload: MINUTES_25 });
          dispatch({ type: "STOP_TIMER" });
          onTimerFinish();
        } else {
          dispatch({
            type: "SET_REMAINING_TIME",
            payload: remainingTime - newElapsedTime,
          });
        }
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

  return (
    <Box textAlign="center">
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
          <Text fontSize="xl" fontWeight="bold">
            {formatTime(remainingTime)}
          </Text>
        )}
        <Stack direction="row" gap={2} justify="center">
          {(timerState === "paused" || timerState == "stopped") && (
            <Button
              size={variant === "embed" ? "xs" : "sm"}
              onClick={startTimer}
              disabled={!selectedTask}
            >
              <FaPlay />
              Start
            </Button>
          )}
          {timerState === "active" && (
            <Button
              size={variant === "embed" ? "xs" : "sm"}
              colorPalette="yellow"
              onClick={pauseTimer}
            >
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
