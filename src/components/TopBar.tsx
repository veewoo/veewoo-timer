import React from "react";
import { IconButton, Flex, Text, Stack } from "@chakra-ui/react";
import { FaSync } from "react-icons/fa";
import { useTask } from "@/context/TaskContext";
import { useTimer } from "@/context/TimerStateContext";

const PageHeader: React.FC = () => {
  return (
    <Flex justifyContent="space-between" alignItems="center" mb={6} border="">
      <Text fontSize="large" fontWeight="bold">
        Veewoo Task Timer
      </Text>
      <Stack direction="row" gap={2}>
        <RefreshTaskButton />
      </Stack>
    </Flex>
  );
};

const RefreshTaskButton: React.FC = () => {
  const { dispatch } = useTimer();
  const {
    state: { selectedTask },
    isLoading,
    refetchTasksAsync,
  } = useTask();

  const handleRefresh = async () => {
    const response = await refetchTasksAsync();

    if (selectedTask && Array.isArray(response.data)) {
      dispatch({
        type: "SET_REMAINING_TIME",
        payload: response.data.find((task) => task.id === selectedTask.id)
          ?.remainingTime,
      });
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
