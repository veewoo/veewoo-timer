import { IconButton, Flex, Text, Stack } from "@chakra-ui/react";
import { FaSync } from "react-icons/fa";
import { Task } from "@/types";
import { QueryObserverResult } from "@tanstack/react-query";

interface TopBarProps {
  isLoading: boolean;
  selectedTask: Task | null;
  setRemainingTime: (value: number) => void;
  refetchTasksAsync: () => Promise<QueryObserverResult<Task[]>>;
}

const PageHeader: React.FC<TopBarProps> = ({
  isLoading,
  selectedTask,
  setRemainingTime,
  refetchTasksAsync,
}) => {
  return (
    <Flex justifyContent="space-between" alignItems="center" mb={6} border="">
      <Text fontSize="large" fontWeight="bold">
        Veewoo Task Timer
      </Text>
      <Stack direction="row" gap={2}>
        <RefreshTaskButton
          isLoading={isLoading}
          selectedTask={selectedTask}
          setRemainingTime={setRemainingTime}
          refetchTasksAsync={refetchTasksAsync}
        />
      </Stack>
    </Flex>
  );
};

interface RefreshTaskButtonProps {
  isLoading: boolean;
  selectedTask: Task | null;
  setRemainingTime: (value: number) => void;
  refetchTasksAsync: () => Promise<QueryObserverResult<Task[]>>;
}

const RefreshTaskButton: React.FC<RefreshTaskButtonProps> = ({
  isLoading,
  selectedTask,
  setRemainingTime,
  refetchTasksAsync,
}) => {
  const handleRefresh = async () => {
    const response = await refetchTasksAsync();

    if (selectedTask && Array.isArray(response.data)) {
      const refreshedTask = response.data.find(
        (task) => task.id === selectedTask.id,
      );
      if (refreshedTask) {
        setRemainingTime(refreshedTask.remainingTime);
      }
    }
  };

  return (
    <IconButton
      size="sm"
      aria-label="Sync"
      loading={isLoading}
      onClick={handleRefresh}
    >
      <FaSync />
    </IconButton>
  );
};

export default PageHeader;
