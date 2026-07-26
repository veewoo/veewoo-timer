"use client";

import { useRef, useEffect } from "react";
import { Box, Container } from "@chakra-ui/react";
import TaskList from "../components/TaskList";
import TopBar from "../components/TopBar";
import { useTaskState } from "@/hooks/useTaskState";
import { useTimerState } from "@/hooks/useTimerState";
import { MINUTES_25 } from "@/constants";
import {
  getSessionTimerSnapshot,
  formatTimeByDate,
  requestWakeLockForPhone,
} from "@/utils";
import { useSearchParams } from "next/navigation";
import CurrentTimer from "@/components/CurrentTimer";
import { toaster } from "./ui/toaster";
import { Task } from "@/types";

const TimerClient: React.FC = () => {
  const wakeLockSentinelRef = useRef<WakeLockSentinel | null>(null);
  const searchParams = useSearchParams();
  const {
    timerState,
    remainingTime,
    startTimer,
    pauseTimer,
    stopTimer,
    setRemainingTime,
  } = useTimerState();
  const {
    selectedTask,
    inProgressTask,
    tasks,
    setTasks,
    setSelectedTask,
    setInProgressTask,
    saveTaskAsync,
    saveInProgressTaskAsync,
    removeInProgressTaskAsync,
    isLoading,
    refetchTasksAsync,
  } = useTaskState();

  const embed = searchParams.get("embed");
  const taskId = searchParams.get("taskId");

  const requestWakeLock = async () => {
    if (!wakeLockSentinelRef.current || wakeLockSentinelRef.current.released) {
      wakeLockSentinelRef.current = await requestWakeLockForPhone();
    }
  };

  const handleTimerStart = async () => {
    await saveInProgressTaskAsync(
      selectedTask!.id,
      selectedTask!.remainingTime,
    );
    await requestWakeLock();
  };

  const handleTimerPause = async () => {
    if (!selectedTask || !inProgressTask) return;

    const { elapsedSeconds, remainingSeconds } =
      getSessionTimerSnapshot(inProgressTask);

    const newSelectedTask = {
      ...selectedTask,
      secondsCounted: selectedTask.secondsCounted + elapsedSeconds,
      remainingTime: remainingSeconds,
      lastModified: formatTimeByDate(),
    };

    setSelectedTask(newSelectedTask);

    setTasks(
      tasks.map((task) =>
        task.id === selectedTask.id ? newSelectedTask : task,
      ),
    );

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
    if (!selectedTask || !inProgressTask) return;

    const { elapsedSeconds } = getSessionTimerSnapshot(inProgressTask);

    const newSelectedTask = {
      ...selectedTask,
      secondsCounted: selectedTask.secondsCounted + elapsedSeconds,
      remainingTime: MINUTES_25,
      lastModified: formatTimeByDate(),
    };

    setSelectedTask(newSelectedTask);

    setTasks(
      tasks.map((task) =>
        task.id === selectedTask.id ? newSelectedTask : task,
      ),
    );

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

  const handleSelectTask = (task: Task) => {
    if (timerState !== "active") {
      setSelectedTask(task);
      setRemainingTime(task.remainingTime);
    }
  };

  const handleResetTask = async (task: Task) => {
    try {
      const isSelected = selectedTask?.id === task.id;

      if (isSelected) {
        stopTimer();
      }

      const resetTask: Task = {
        ...task,
        secondsCounted: 0,
        remainingTime: MINUTES_25,
        startTime: null,
        pauseTime: null,
        stopTime: null,
      };

      await saveTaskAsync(resetTask);

      if (isSelected) {
        setSelectedTask(resetTask);
      }

      setTasks(tasks.map((t) => (t.id === task.id ? resetTask : t)));

      setInProgressTask(null);
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Error",
        description: "An error occurred while resetting the task.",
        type: "error",
        duration: 5000,
        closable: true,
      });
    }
  };

  useEffect(() => {
    if (taskId) {
      const task = tasks.find((task) => task.id === Number(taskId));
      if (task) {
        setSelectedTask(task);
      }
    }
  }, [tasks, taskId]);

  useEffect(() => {
    if (!selectedTask) return;
    if (inProgressTask) {
      const { remainingSeconds } = getSessionTimerSnapshot(inProgressTask);
      setRemainingTime(remainingSeconds);
      if (timerState !== "active") {
        startTimer();
      }
      requestWakeLock();
      return;
    }
    if (timerState !== "active") {
      setRemainingTime(selectedTask.remainingTime);
    }
  }, [
    inProgressTask,
    selectedTask?.id,
    selectedTask?.remainingTime,
    timerState,
    setRemainingTime,
    startTimer,
  ]);

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
        timerState={timerState}
        remainingTime={remainingTime}
        startTimer={startTimer}
        pauseTimer={pauseTimer}
        stopTimer={stopTimer}
        setRemainingTime={setRemainingTime}
        inProgressTask={inProgressTask}
        selectedTask={selectedTask}
        onTimerStart={handleTimerStart}
        onTimerPause={handleTimerPause}
        onTimerFinish={handleTimerFinish}
      />
      {!embed && (
        <Box flexGrow={1}>
          <TopBar
            isLoading={isLoading}
            selectedTask={selectedTask}
            setRemainingTime={setRemainingTime}
            refetchTasksAsync={refetchTasksAsync}
          />
          <TaskList
            tasks={tasks}
            timerState={timerState}
            isLoading={isLoading}
            selectedTask={selectedTask}
            inProgressTask={inProgressTask}
            onSelectTask={handleSelectTask}
            onResetTask={handleResetTask}
          />
        </Box>
      )}
    </Container>
  );
};

export default TimerClient;
