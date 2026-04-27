"use client";

import { useEffect, useState } from "react";
import { Field, Switch } from "@chakra-ui/react";
import { useSettings } from "../context/SettingsContext";

const WakeLockSwitch = () => {
  const { state, dispatch } = useSettings();
  const { wakeLock } = state;
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    if (!("wakeLock" in navigator)) {
      setIsSupported(false);
    }
  }, []);

  const releaseWakeLock = async () => {
    if (wakeLock) {
      try {
        await wakeLock.release();
        dispatch({ type: "SET_WAKE_LOCK", payload: null });
        console.log("Wake Lock is released");
      } catch (err) {
        console.error("Failed to release Wake Lock:", err);
      }
    }
  };

  const requestWakeLock = async () => {
    try {
      const wakeLock = await navigator.wakeLock.request("screen");
      dispatch({ type: "SET_WAKE_LOCK", payload: wakeLock });

      wakeLock.addEventListener("release", () => {
        console.log("Wake Lock was released");
      });

      console.log("Wake Lock is active");
    } catch (err) {
      if (err instanceof Error) {
        console.error(`${err.name}, ${err.message}`);
      } else {
        console.error("An unknown error occurred");
      }
      setIsSupported(false);
    }
  };

  const handleSwitchChange = async () => {
    if (wakeLock) {
      await releaseWakeLock();
    } else {
      await requestWakeLock();
    }
  };

  return (
    <Field.Root
      orientation="horizontal"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <Field.Label htmlFor="wake-lock-switch" mb="0">
        Enable Wake Lock
      </Field.Label>
      <Switch.Root
        id="wake-lock-switch"
        checked={!!wakeLock}
        disabled={!isSupported}
        onCheckedChange={handleSwitchChange}
      >
        <Switch.HiddenInput />
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Root>
    </Field.Root>
  );
};

export default WakeLockSwitch;
