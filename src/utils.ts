import { MINUTES_25 } from "./constants";

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
}

export function calculateElapsedTime(startTime?: number) {
    const startTimeInSecond = startTime
        ? Math.floor(startTime / 1000) // Convert timestamp to seconds
        : 0; // Start time in seconds
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    return currentTime - startTimeInSecond; // Elapsed time in seconds
}

export function calculateRemainingTimer(currentRemainingTime: number, startTime?: number) {
    const elapsedTime = calculateElapsedTime(startTime); // Elapsed time in seconds
    return MINUTES_25 - (elapsedTime % MINUTES_25);
}