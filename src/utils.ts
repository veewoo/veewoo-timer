export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

export const formatTimeByDate = (date: Date = new Date()) => {
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return formattedTime;
};

export function getSessionTimerSnapshot(inProgressTask: {
  startTime: number;
  sessionStartRemaining: number;
}) {
  const elapsedSeconds = Math.floor(
    (Date.now() - inProgressTask.startTime) / 1000,
  );
  const remainingSeconds = Math.max(
    0,
    inProgressTask.sessionStartRemaining - elapsedSeconds,
  );
  return { elapsedSeconds, remainingSeconds };
}

export async function requestWakeLockForPhone() {
  if (!isPhoneDevice() || !("wakeLock" in navigator)) return null;

  try {
    console.log("Requesting Wake Lock");
    return await navigator.wakeLock.request("screen");
  } catch (err) {
    if (err instanceof Error) {
      console.error(`${err.name}, ${err.message}`);
    } else {
      console.error("An unknown error occurred");
    }
    return null;
  }
}

function isPhoneDevice() {
  if (typeof window === "undefined") return false;

  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const hasPhoneViewport = window.matchMedia("(max-width: 767px)").matches;

  return hasCoarsePointer && hasPhoneViewport;
}
