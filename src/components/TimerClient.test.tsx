import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TimerClient from "@/components/TimerClient";
import {
  fetchTasksFromServer,
  saveTaskToServer,
} from "@/services/tasks";
import {
  deleteInProgressTask,
  fetchInProgressTasks,
  saveInProgressTask,
} from "@/services/tasksInProgress";
import { toaster } from "@/components/ui/toaster";
import { requestWakeLockForPhone } from "@/utils";
import { makeTask } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { MINUTES_25 } from "@/constants";

let searchParams = "";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(searchParams),
}));
vi.mock("@/services/tasks");
vi.mock("@/services/tasksInProgress");
vi.mock("@/components/ui/toaster", () => ({
  toaster: { create: vi.fn() },
}));
vi.mock("@/utils", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/utils")>()),
  requestWakeLockForPhone: vi.fn().mockResolvedValue(null),
}));

function getResetButtonForTask(taskName: string) {
  const taskNameEl = screen.getByText(taskName);
  const flex = taskNameEl.parentElement;
  return within(flex as HTMLElement).getByRole("button");
}

describe("TimerClient", () => {
  beforeEach(() => {
    searchParams = "";
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));

    vi.mocked(fetchTasksFromServer).mockResolvedValue([
      makeTask({ id: 1, name: "Task A", remainingTime: MINUTES_25 }),
      makeTask({ id: 2, name: "Task B", remainingTime: 600 }),
    ]);
    vi.mocked(fetchInProgressTasks).mockResolvedValue(null);
    vi.mocked(saveTaskToServer).mockResolvedValue(undefined);
    vi.mocked(saveInProgressTask).mockResolvedValue({
      id: 1,
      startTime: Date.now(),
    });
    vi.mocked(deleteInProgressTask).mockResolvedValue(undefined);
  });

  it("renders fetched tasks and the default timer", async () => {
    renderWithProviders(<TimerClient />);

    await waitFor(() => {
      expect(screen.getByText("Task A")).toBeInTheDocument();
      expect(screen.getByText("Task B")).toBeInTheDocument();
      expect(screen.getByText("25:00")).toBeInTheDocument();
    });
  });

  it("selects a task and updates the displayed timer", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<TimerClient />);

    await waitFor(() => {
      expect(screen.getByText("Task B")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Task B"));

    expect(screen.getByText("10:00")).toBeInTheDocument();
  });

  it("starts the timer and requests wake lock", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<TimerClient />);

    await waitFor(() => {
      expect(screen.getByText("Task A")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Task A"));
    await user.click(screen.getByRole("button", { name: /start/i }));

    await waitFor(() => {
      expect(saveInProgressTask).toHaveBeenCalledWith(
        expect.objectContaining({
          taskId: 1,
          startTime: expect.any(Number),
        }),
      );
      expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
      expect(requestWakeLockForPhone).toHaveBeenCalled();
    });
  });

  it("pauses and persists elapsed time", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<TimerClient />);

    await waitFor(() => {
      expect(screen.getByText("Task A")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Task A"));
    await user.click(screen.getByRole("button", { name: /start/i }));

    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    await user.click(screen.getByRole("button", { name: /pause/i }));

    await waitFor(() => {
      expect(saveTaskToServer).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          secondsCounted: 30,
          remainingTime: MINUTES_25 - 30,
          lastModified: expect.any(String),
        }),
      );
      expect(deleteInProgressTask).toHaveBeenCalled();
    });
  });

  it("finishes the timer and resets remaining time", async () => {
    vi.mocked(fetchTasksFromServer).mockResolvedValue([
      makeTask({ id: 1, name: "Task A", remainingTime: 3 }),
    ]);

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<TimerClient />);

    await waitFor(() => {
      expect(screen.getByText("Task A")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Task A"));
    await user.click(screen.getByRole("button", { name: /start/i }));

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(saveTaskToServer).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          secondsCounted: 3,
          remainingTime: MINUTES_25,
        }),
      );
      expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
    });
  });

  it("resets a task", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<TimerClient />);

    await waitFor(() => {
      expect(screen.getByText("Task A")).toBeInTheDocument();
    });

    await user.click(getResetButtonForTask("Task A"));

    await waitFor(() => {
      expect(saveTaskToServer).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          secondsCounted: 0,
          remainingTime: MINUTES_25,
          startTime: null,
          pauseTime: null,
          stopTime: null,
        }),
      );
    });
  });

  it("shows a toast when pause save fails", async () => {
    vi.mocked(saveTaskToServer).mockRejectedValue(new Error("save failed"));

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<TimerClient />);

    await waitFor(() => {
      expect(screen.getByText("Task A")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Task A"));
    await user.click(screen.getByRole("button", { name: /start/i }));

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    await user.click(screen.getByRole("button", { name: /pause/i }));

    await waitFor(() => {
      expect(toaster.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "An error occurred while saving the task",
        }),
      );
    });
  });

  it("shows a toast when reset save fails", async () => {
    vi.mocked(saveTaskToServer).mockRejectedValue(new Error("reset failed"));

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<TimerClient />);

    await waitFor(() => {
      expect(screen.getByText("Task A")).toBeInTheDocument();
    });

    await user.click(getResetButtonForTask("Task A"));

    await waitFor(() => {
      expect(toaster.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "An error occurred while resetting the task.",
        }),
      );
    });
  });

  it("hides top bar and task list in embed mode", async () => {
    searchParams = "embed=1";
    renderWithProviders(<TimerClient />);

    await waitFor(() => {
      expect(screen.getByText("25:00")).toBeInTheDocument();
    });

    expect(screen.queryByText("Veewoo Task Timer")).not.toBeInTheDocument();
    expect(screen.queryByText("Task A")).not.toBeInTheDocument();
  });

  it("auto-selects task from taskId query param", async () => {
    searchParams = "taskId=2";
    renderWithProviders(<TimerClient />);

    await waitFor(() => {
      expect(screen.getByText("10:00")).toBeInTheDocument();
    });
  });

  it("auto-starts when an in-progress task is restored", async () => {
    vi.mocked(fetchInProgressTasks).mockResolvedValue({
      id: "1",
      startTime: String(Date.now() - 10_000),
    });

    renderWithProviders(<TimerClient />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
    });
  });
});
