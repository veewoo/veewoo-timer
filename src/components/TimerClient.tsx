"use client";

import { useState, useRef, useEffect } from "react";
import { Box, Container } from "@chakra-ui/react";
import TaskList from "../components/TaskList";
import TopBar from "../components/TopBar";
import { useTask } from "@/context/TaskContext";
import { useTimer } from "@/context/TimerStateContext";
import { MINUTES_25 } from "@/constants";
import { calculateElapsedTime, formatTimeByDate } from "@/utils";
import { useSearchParams } from "next/navigation";
import CurrentTimer from "@/components/CurrentTimer";
import { toaster } from "./ui/toaster";

const TimerClient: React.FC = () => {
  const searchParams = useSearchParams();
  const {
    state: { timerState },
    dispatch: timerDispatch,
  } = useTimer();
  const {
    state: { selectedTask, inProgressTask, tasks },
    dispatch: taskDispatch,
    saveTaskAsync,
    saveInProgressTaskAsync,
    removeInProgressTaskAsync,
  } = useTask();

  const embed = searchParams.get("embed");
  const taskId = searchParams.get("taskId");

  useEffect(() => {
    if (taskId) {
      const task = tasks.find((task) => task.id === Number(taskId));
      if (task) {
        taskDispatch({ type: "SET_SELECTED_TASK", payload: task });
      }
    }
  }, [tasks, taskId]);

  useEffect(() => {
    if (!selectedTask) return;
    if (inProgressTask) {
      timerDispatch({
        type: "SET_REMAINING_TIME",
        payload: selectedTask.remainingTime,
      });
      if (timerState !== "active") {
        timerDispatch({ type: "START_TIMER" });
      }
      return;
    }
    if (timerState !== "active") {
      timerDispatch({
        type: "SET_REMAINING_TIME",
        payload: selectedTask.remainingTime,
      });
    }
  }, [
    inProgressTask,
    selectedTask?.id,
    selectedTask?.remainingTime,
    timerState,
    timerDispatch,
  ]);

  const handleTimerStart = async () => {
    await saveInProgressTaskAsync(selectedTask!.id);
  };

  const handleTimerPause = async (remaining: number) => {
    if (!selectedTask || !inProgressTask) return;

    const newElapsedTime = calculateElapsedTime(inProgressTask.startTime);

    const newSelectedTask = {
      ...selectedTask,
      secondsCounted: selectedTask.secondsCounted + newElapsedTime,
      remainingTime: remaining,
      lastModified: formatTimeByDate(),
    };

    taskDispatch({
      type: "SET_SELECTED_TASK",
      payload: newSelectedTask,
    });

    taskDispatch({
      type: "SET_TASKS",
      payload: tasks.map((task) =>
        task.id === selectedTask.id ? newSelectedTask : task,
      ),
    });

    try {
      await Promise.all([
        saveTaskAsync(newSelectedTask),
        removeInProgressTaskAsync(),
      ]);
    } catch (error) {
      console.error(error);

      toaster.create({
        duration: 5000,
        closable: true,
        title: "Error",
        type: "error",
        description: "An error occurred while saving the task",
      });
    }
  };

  const handleTimerFinish = async () => {
    if (!selectedTask) return;

    const remainingInCycle =
      MINUTES_25 - (selectedTask.secondsCounted % MINUTES_25);

    const newSelectedTask = {
      ...selectedTask,
      secondsCounted: selectedTask.secondsCounted + remainingInCycle,
      remainingTime: MINUTES_25,
      lastModified: formatTimeByDate(),
    };

    taskDispatch({
      type: "SET_SELECTED_TASK",
      payload: newSelectedTask,
    });

    taskDispatch({
      type: "SET_TASKS",
      payload: tasks.map((task) =>
        task.id === selectedTask.id ? newSelectedTask : task,
      ),
    });

    try {
      await Promise.all([
        saveTaskAsync(newSelectedTask),
        removeInProgressTaskAsync(),
      ]);
    } catch (error) {
      console.error(error);

      toaster.create({
        duration: 5000,
        closable: true,
        title: "Error",
        type: "error",
        description: "An error occurred while saving the task",
      });
    }
  };

  return (
    <Container
      gap={8}
      maxW="4xl"
      display="flex"
      py={embed ? 0 : 4}
      px={embed ? 0 : undefined}
      flexDirection={{ base: "column", sm: "row" }}
    >
      <CurrentTimer
        variant={embed ? "embed" : "default"}
        onTimerStart={handleTimerStart}
        onTimerPause={handleTimerPause}
        onTimerFinish={handleTimerFinish}
      />
      {!embed && (
        <Box flexGrow={1}>
          <TopBar />
          <TaskList />
        </Box>
      )}
    </Container>
  );
};

export default TimerClient;
