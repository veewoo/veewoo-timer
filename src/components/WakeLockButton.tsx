"use client";

import { useEffect, useState } from "react";
import { IconButton, useToast } from "@chakra-ui/react";
import { FaLock } from "react-icons/fa";

const WakeLockButton = () => {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const toast = useToast();

  useEffect(() => {
    if (!("wakeLock" in navigator)) {
      setIsSupported(false);
    }
  }, []);

  const requestWakeLock = async () => {
    try {
      const newWakeLock = await navigator.wakeLock.request("screen");

      newWakeLock.addEventListener("release", () => {
        console.log("Wake Lock was released");
      });

      console.log("Wake Lock is active");
      toast({
        title: "Screen will stay on",
        status: "success",
        duration: 2000,
      });
    } catch (err) {
      if (err instanceof Error) {
        console.error(`${err.name}, ${err.message}`);
      } else {
        console.error("An unknown error occurred");
      }
      setIsSupported(false);
      toast({
        title: "Failed to keep screen on",
        status: "error",
        duration: 2000,
      });
    }
  };

  const handleButtonClick = async () => {
    await requestWakeLock();
  };

  return (
    <IconButton
      size="sm"
      aria-label="Keep Screen On"
      icon={<FaLock />}
      onClick={handleButtonClick}
      isDisabled={!isSupported}
    />
  );
};

export default WakeLockButton;
