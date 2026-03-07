import React, { useRef, useState } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Button,
  IconButton,
  Switch,
  FormControl,
  FormLabel,
  Flex,
  Text,
  Stack,
} from "@chakra-ui/react";
import { FaCog, FaSync } from "react-icons/fa";
import { useSettings } from "../context/SettingsContext";
import WakeLockSwitch from "./WakeLockSwitch";
import { useTask } from "@/context/TaskContext";
import { useTimer } from "@/context/TimerStateContext";
import WakeLockButton from "./WakeLockButton";
import ContinueTimerButton from "./ContinueTimerButton";

const PageHeader: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const { state, dispatch } = useSettings();

  return (
    <Flex justifyContent="space-between" alignItems="center" mb={6} border="">
      <Text fontSize="large" fontWeight="bold">
        Veewoo Task Timer
      </Text>
      <Stack direction="row" gap={2}>
        <RefreshTaskButton />
        <WakeLockButton />
        <ContinueTimerButton />
      </Stack>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Settings</DrawerHeader>
          <DrawerBody>
            <WakeLockSwitch />
            <FormControl display="flex" alignItems="center" mt={4}>
              <FormLabel htmlFor="continue-timer-on-end" mb="0">
                Continue Timer on End
              </FormLabel>
              <Switch
                id="continue-timer-on-end"
                isChecked={state.continueTimerOnEnd}
                onChange={() =>
                  dispatch({ type: "TOGGLE_CONTINUE_TIMER_ON_END" })
                }
              />
            </FormControl>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
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
      isLoading={isLoading}
      onClick={handleRefresh}
    >
      <FaSync />
    </IconButton>
  );
};

export default PageHeader;
