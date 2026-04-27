import { MINUTES_25 } from "@/constants";
import { useTask } from "@/context/TaskContext";
import { useTimer } from "@/context/TimerStateContext";
import { Task } from "@/types";
import { calculateElapsedTime, formatTime } from "@/utils";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { FaRedo } from "react-icons/fa";
import { toaster } from "./ui/toaster";

type TaskCardProps = {
  task: Task;
};

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const {
    state: { timerState },
    dispatch: timerDispatch,
  } = useTimer();
  const {
    state: { selectedTask, tasks, inProgressTask },
    isLoading,
    dispatch: taskDispatch,
    saveTaskAsync,
  } = useTask();

  const isSelected = selectedTask?.id === task.id;

  const handleResetTask = async (e: React.MouseEvent) => {
    try {
      e.stopPropagation();

      if (isSelected) {
        timerDispatch({ type: "STOP_TIMER" });
      }

      const resetTask: Task = {
        ...task,
        secondsCounted: 0,
        remainingTime: MINUTES_25, // Reset to 25 minutes
        startTime: null,
        pauseTime: null,
        stopTime: null,
      };

      await saveTaskAsync(resetTask);

      if (isSelected) {
        taskDispatch({ type: "SET_SELECTED_TASK", payload: resetTask });
      }

      taskDispatch({
        type: "SET_TASKS",
        payload: tasks.map((t) => (t.id === task.id ? resetTask : t)),
      });

      taskDispatch({ type: "SET_IN_PROGRESS_TASK", payload: null });
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

  const handleClickTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timerState !== "active") {
      taskDispatch({ type: "SET_SELECTED_TASK", payload: task });
      timerDispatch({
        type: "SET_REMAINING_TIME",
        payload: task.remainingTime,
      });
    }
  };

  const elapsed = formatTime(
    inProgressTask
      ? task.secondsCounted + calculateElapsedTime(inProgressTask.startTime)
      : task.secondsCounted,
  );

  return (
    <Box
      py={2}
      px={3}
      width="100%"
      cursor="pointer"
      borderWidth="1px"
      borderRadius="md"
      onClick={handleClickTask}
      bg={isSelected ? "gray.950" : "white"}
    >
      <Flex align="center" gap={3} minH="32px" wrap="nowrap">
        <Text
          as="span"
          flex="1"
          minW={0}
          fontSize="sm"
          fontWeight="semibold"
          color={isSelected ? "white" : "gray.800"}
          lineClamp={1}
        >
          {task.name}
        </Text>
        <Text
          as="span"
          flexShrink={0}
          fontSize="sm"
          color={isSelected ? "whiteAlpha.900" : "gray.600"}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {elapsed}
        </Text>
        {task?.lastModified ? (
          <Text
            as="span"
            flexShrink={0}
            display={{ base: "none", md: "inline" }}
            maxW="140px"
            fontSize="xs"
            fontStyle="italic"
            color={isSelected ? "whiteAlpha.800" : "gray.500"}
            lineClamp={1}
          >
            {task.lastModified}
          </Text>
        ) : null}
        <Button
          flexShrink={0}
          size="2xs"
          disabled={isLoading}
          onClick={handleResetTask}
          variant={isSelected ? "solid" : "outline"}
        >
          <FaRedo />
        </Button>
      </Flex>
    </Box>
  );
};

export default TaskCard;
