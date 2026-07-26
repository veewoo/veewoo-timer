"use client";

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
import { calculateElapsedTime, formatTime } from "@/utils";
import { MINUTES_25 } from "@/constants";
import { InProgressTask, Task, TimerState } from "@/types";

interface CurrentTimerProps {
  variant: "default" | "embed";
  timerState: TimerState;
  remainingTime: number;
  setRemainingTime: (value: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  inProgressTask: InProgressTask | null;
  selectedTask: Task | null;
  onTimerStart: () => void;
  onTimerPause: (remainingTime: number) => void;
  onTimerFinish: () => void;
}

const CurrentTimer: React.FC<CurrentTimerProps> = ({
  variant,
  timerState,
  remainingTime,
  setRemainingTime,
  startTimer,
  pauseTimer,
  stopTimer,
  inProgressTask,
  selectedTask,
  onTimerStart,
  onTimerPause,
  onTimerFinish,
}) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (inProgressTask && timerState === "active") {
      intervalRef.current = setInterval(() => {
        const newElapsedTime = calculateElapsedTime(inProgressTask.startTime);
        if (newElapsedTime >= remainingTime) {
          stopTimer();
          onTimerFinish();
        } else {
          setRemainingTime(remainingTime - newElapsedTime);
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

  const handleStart = async () => {
    startTimer();
    onTimerStart();
  };

  const handlePause = async () => {
    pauseTimer();
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
              onClick={handleStart}
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
              onClick={handlePause}
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
