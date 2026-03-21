import { MINUTES_25 } from "@/constants";
import { useTask } from "@/context/TaskContext";
import { useTimer } from "@/context/TimerStateContext";
import { Task } from "@/types";
import { calculateElapsedTime, formatTime } from "@/utils";
import { Box, Button, Flex, useToast, Text } from "@chakra-ui/react";
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

  const elapsed = formatTime(
    inProgressTask
      ? task.secondsCounted + calculateElapsedTime(inProgressTask.startTime)
      : task.secondsCounted
  );

  return (
    <Box
      py={2}
      px={3}
      width="100%"
      cursor="pointer"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      transition="all 0.2s"
      bg={isSelected ? "teal" : "white"}
      boxShadow={isSelected ? "xl" : "sm"}
      onClick={handleClickTask}
      _hover={{ boxShadow: "md", transform: "translateY(-1px)" }}
    >
      <Flex align="center" gap={3} minH="32px" wrap="nowrap">
        <Text
          as="span"
          flex="1"
          minW={0}
          fontSize="sm"
          fontWeight="semibold"
          color={isSelected ? "white" : "gray.800"}
          noOfLines={1}
        >
          {task.name}
        </Text>
        <Text
          as="span"
          flexShrink={0}
          fontSize="sm"
          color={isSelected ? "whiteAlpha.900" : "gray.600"}
          sx={{ fontVariantNumeric: "tabular-nums" }}
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
            noOfLines={1}
          >
            {task.lastModified}
          </Text>
        ) : null}
        <Button
          flexShrink={0}
          size="xs"
          colorScheme="blue"
          isDisabled={isLoading}
          variant={isSelected ? "solid" : "outline"}
          borderRadius="full"
          onClick={handleResetTask}
        >
          <FaRedo />
        </Button>
      </Flex>
    </Box>
  );
};

export default TaskCard;
