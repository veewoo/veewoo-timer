import React from "react";
import {
  Drawer,
  useDisclosure,
  Button,
  CloseButton,
  IconButton,
  Flex,
  Text,
  Stack,
} from "@chakra-ui/react";
import { FaCog, FaSync } from "react-icons/fa";
import WakeLockSwitch from "./WakeLockSwitch";
import { useTask } from "@/context/TaskContext";
import { useTimer } from "@/context/TimerStateContext";
import WakeLockButton from "./WakeLockButton";

const PageHeader: React.FC = () => {
  const { open, onOpen, onClose } = useDisclosure();

  return (
    <Flex justifyContent="space-between" alignItems="center" mb={6} border="">
      <Text fontSize="large" fontWeight="bold">
        Veewoo Task Timer
      </Text>
      <Stack direction="row" gap={2}>
        <RefreshTaskButton />
        <WakeLockButton />
        <IconButton size="sm" aria-label="Settings" onClick={onOpen}>
          <FaCog />
        </IconButton>
      </Stack>
      <Drawer.Root
        open={open}
        placement="end"
        onOpenChange={(details) => {
          if (details.open) onOpen();
          else onClose();
        }}
      >
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
            <Drawer.Header>
              <Drawer.Title>Settings</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <WakeLockSwitch />
            </Drawer.Body>

            <Drawer.Footer>
              <Button variant="outline" mr={3} onClick={onClose}>
                Close
              </Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
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
