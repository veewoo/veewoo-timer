"use client";

import { useEffect, useState } from "react";
import { IconButton } from "@chakra-ui/react";
import { FaLock } from "react-icons/fa";
import { toaster } from "./ui/toaster";

const WakeLockButton = () => {
  const [isSupported, setIsSupported] = useState<boolean>(true);
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
      toaster.create({
        title: "Screen will stay on",
        type: "success",
        duration: 2000,
      });
    } catch (err) {
      if (err instanceof Error) {
        console.error(`${err.name}, ${err.message}`);
      } else {
        console.error("An unknown error occurred");
      }
      setIsSupported(false);
      toaster.create({
        title: "Failed to keep screen on",
        type: "error",
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
      onClick={handleButtonClick}
      disabled={!isSupported}
    >
      <FaLock />
    </IconButton>
  );
};

export default WakeLockButton;
