import { MINUTES_25 } from "@/constants";
import type { InProgressTask, Task } from "@/types";

export const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 1,
  name: "Write plan",
  secondsCounted: 0,
  remainingTime: MINUTES_25,
  startTime: null,
  pauseTime: null,
  stopTime: null,
  lastModified: "",
  ...overrides,
});

export const makeInProgressTask = (
  overrides: Partial<InProgressTask> = {},
): InProgressTask => ({
  id: 1,
  startTime: Date.now(),
  sessionStartRemaining: MINUTES_25,
  ...overrides,
});
