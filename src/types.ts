export type Task = {
    id: number;
    name: string;
    secondsCounted: number;
    remainingTime: number;
    startTime: number | null;
    pauseTime: number | null;
    stopTime: number | null;
    lastModified: string;
};

export type InProgressTask = {
    id: number;
    startTime: number;
}

export type TimerState = "active" | "paused" | "stopped";