import { MINUTES_25 } from "@/constants";
import { useTask } from "@/context/TaskContext";
import { useTimer } from "@/context/TimerStateContext";
import { Task } from "@/types";
import { calculateElapsedTime, formatTime } from "@/utils";
import { Box, Button, Stack, useToast, Text } from "@chakra-ui/react";
import { FaRedo } from "react-icons/fa";

type TaskCardProps = {
  task: Task;
};

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const toasts = useToast();
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
      toasts({
        title: "Error",
        description: "An error occurred while resetting the task.",
        status: "error",
        duration: 5000,
        isClosable: true,
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

  return (
    <Box
      py={2}
      px={4}
      width="100%"
      cursor="pointer"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      transition="all 0.2s"
      bg={isSelected ? "teal" : "white"}
      boxShadow={isSelected ? "xl" : "lg"}
      onClick={handleClickTask}
      _hover={{ boxShadow: "xl", transform: "scale(1.02)" }}
    >
      <Stack direction="row" alignItems="center" justify="space-between">
        <Box>
          <Text
            fontSize="sm"
            fontWeight="bold"
            color={isSelected ? "white" : undefined}
          >
            {task.name}
          </Text>
          <Text fontSize="sm" color={isSelected ? "white" : "gray.500"}>
            {formatTime(
              inProgressTask
                ? task.secondsCounted +
                    calculateElapsedTime(inProgressTask.startTime)
                : task.secondsCounted
            )}
          </Text>
        </Box>
        <Stack
          flex="1"
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
        >
          <Text
            fontSize="sm"
            fontStyle="italic"
            color={isSelected ? "white" : "gray.500"}
          >
            {task?.lastModified ? `${task.lastModified}` : ""}
          </Text>
          {/* <Button
            size="xs"
            colorScheme="red"
            isDisabled={isLoading}
            variant={isSelected ? "solid" : "outline"}
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(task.id);
            }}
          >
            <FaTrash />
          </Button> */}
          <Button
            size="xs"
            colorScheme="blue"
            isDisabled={isLoading}
            variant={isSelected ? "solid" : "outline"}
            onClick={handleResetTask}
          >
            <FaRedo />
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default TaskCard;
