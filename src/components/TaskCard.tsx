import { InProgressTask, Task, TimerState } from "@/types";
import { getSessionTimerSnapshot, formatTime } from "@/utils";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { FaRedo } from "react-icons/fa";

type TaskCardProps = {
  task: Task;
  isLoading: boolean;
  timerState: TimerState;
  inProgressTask: InProgressTask | null;
  isSelected: boolean;
  onSelectTask: (task: Task) => void;
  onResetTask: (task: Task) => void;
};

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isLoading,
  timerState,
  inProgressTask,
  isSelected,
  onSelectTask,
  onResetTask,
}) => {
  const handleResetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onResetTask(task);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timerState !== "active") onSelectTask(task);
  };

  const elapsed = formatTime(
    inProgressTask?.id === task.id
      ? task.secondsCounted +
          getSessionTimerSnapshot(inProgressTask).elapsedSeconds
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
      onClick={handleCardClick}
      bg={isSelected ? "bg.inverted" : "bg.panel"}
    >
      <Flex align="center" gap={3} minH="32px" wrap="nowrap">
        <Text
          as="span"
          flex="1"
          minW={0}
          fontSize="sm"
          fontWeight="semibold"
          color={isSelected ? "fg.inverted" : "fg"}
          lineClamp={1}
        >
          {task.name}
        </Text>
        <Text
          as="span"
          flexShrink={0}
          fontSize="sm"
          color={isSelected ? "fg.inverted" : "fg.muted"}
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
            color={isSelected ? "fg.inverted" : "fg.subtle"}
            lineClamp={1}
          >
            {task.lastModified}
          </Text>
        ) : null}
        <Button
          flexShrink={0}
          size="2xs"
          disabled={isLoading}
          onClick={handleResetClick}
          variant={isSelected ? "solid" : "outline"}
        >
          <FaRedo />
        </Button>
      </Flex>
    </Box>
  );
};

export default TaskCard;
