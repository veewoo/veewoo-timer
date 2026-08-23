import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useTaskState } from "@/hooks/useTaskState";
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
import { makeTask } from "@/test/fixtures";
import { createQueryWrapper } from "@/test/render";

vi.mock("@/services/tasks");
vi.mock("@/services/tasksInProgress");
vi.mock("@/components/ui/toaster", () => ({
  toaster: { create: vi.fn() },
}));

describe("useTaskState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  it("loads tasks from the server", async () => {
    const tasks = [makeTask({ id: 1 }), makeTask({ id: 2, name: "Second" })];
    vi.mocked(fetchTasksFromServer).mockResolvedValue(tasks);

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useTaskState(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.tasks).toEqual(tasks);
    });
  });

  it("does not fetch in-progress tasks until tasks are loaded", async () => {
    vi.mocked(fetchTasksFromServer).mockResolvedValue([]);

    const { Wrapper } = createQueryWrapper();
    renderHook(() => useTaskState(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(fetchTasksFromServer).toHaveBeenCalled();
    });

    expect(fetchInProgressTasks).not.toHaveBeenCalled();
  });

  it("restores in-progress task with numeric id", async () => {
    const tasks = [makeTask({ id: 1, remainingTime: 600 })];
    vi.mocked(fetchTasksFromServer).mockResolvedValue(tasks);
    vi.mocked(fetchInProgressTasks).mockResolvedValue({
      id: "1",
      startTime: "1704067200000",
    });

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useTaskState(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.selectedTask?.id).toBe(1);
      expect(result.current.inProgressTask).toEqual({
        id: 1,
        startTime: 1704067200000,
        sessionStartRemaining: 600,
      });
    });
  });

  it("shows an error when restored in-progress task is missing", async () => {
    const tasks = [makeTask({ id: 1 })];
    vi.mocked(fetchTasksFromServer).mockResolvedValue(tasks);
    vi.mocked(fetchInProgressTasks).mockResolvedValue({
      id: "99",
      startTime: "1704067200000",
    });

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useTaskState(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(toaster.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Selected task not found",
        }),
      );
    });

    expect(result.current.inProgressTask).toBeNull();
  });

  it("clears in-progress task when server returns null", async () => {
    const tasks = [makeTask({ id: 1 })];
    vi.mocked(fetchTasksFromServer).mockResolvedValue(tasks);
    vi.mocked(fetchInProgressTasks).mockResolvedValue(null);

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useTaskState(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(fetchInProgressTasks).toHaveBeenCalled();
    });

    expect(result.current.inProgressTask).toBeNull();
  });

  it("optimistically saves in-progress task", async () => {
    vi.mocked(fetchTasksFromServer).mockResolvedValue([makeTask({ id: 1 })]);
    vi.mocked(fetchInProgressTasks).mockResolvedValue(null);
    vi.mocked(saveInProgressTask).mockResolvedValue({
      id: 1,
      startTime: Date.now(),
    });

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useTaskState(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    await act(async () => {
      await result.current.saveInProgressTaskAsync(1, 600);
    });

    expect(result.current.inProgressTask).toEqual({
      id: 1,
      startTime: Date.now(),
      sessionStartRemaining: 600,
    });
    expect(saveInProgressTask).toHaveBeenCalledWith({
      taskId: 1,
      startTime: Date.now(),
    });
  });

  it("removes in-progress task", async () => {
    vi.mocked(fetchTasksFromServer).mockResolvedValue([makeTask({ id: 1 })]);
    vi.mocked(fetchInProgressTasks).mockResolvedValue(null);
    vi.mocked(deleteInProgressTask).mockResolvedValue(undefined);

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useTaskState(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    await act(async () => {
      await result.current.saveInProgressTaskAsync(1, 600);
    });

    await act(async () => {
      await result.current.removeInProgressTaskAsync();
    });

    expect(result.current.inProgressTask).toBeNull();
    expect(deleteInProgressTask).toHaveBeenCalled();
  });

  it("saves a task through the mutation", async () => {
    vi.mocked(fetchTasksFromServer).mockResolvedValue([makeTask({ id: 1 })]);
    vi.mocked(fetchInProgressTasks).mockResolvedValue(null);
    vi.mocked(saveTaskToServer).mockResolvedValue(undefined);

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useTaskState(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    const updatedTask = makeTask({ id: 1, secondsCounted: 30 });

    await act(async () => {
      await result.current.saveTaskAsync(updatedTask);
    });

    expect(saveTaskToServer).toHaveBeenCalledWith(updatedTask);
  });

  it("refetches tasks and re-resolves selected task", async () => {
    const initialTasks = [makeTask({ id: 1, remainingTime: 600 })];
    const refreshedTasks = [makeTask({ id: 1, remainingTime: 300 })];

    vi.mocked(fetchTasksFromServer)
      .mockResolvedValueOnce(initialTasks)
      .mockResolvedValueOnce(refreshedTasks);
    vi.mocked(fetchInProgressTasks).mockResolvedValue(null);

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useTaskState(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.tasks).toEqual(initialTasks);
    });

    await act(async () => {
      result.current.setSelectedTask(initialTasks[0]);
    });

    await act(async () => {
      await result.current.refetchTasksAsync();
    });

    await waitFor(() => {
      expect(result.current.selectedTask?.remainingTime).toBe(300);
    });
  });

  it("sets isLoading while fetching tasks", async () => {
    let resolveFetch: (value: ReturnType<typeof makeTask>[]) => void = () => {};
    vi.mocked(fetchTasksFromServer).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useTaskState(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    await act(async () => {
      resolveFetch([makeTask()]);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("sets isLoading while saving a task", async () => {
    vi.mocked(fetchTasksFromServer).mockResolvedValue([makeTask({ id: 1 })]);
    vi.mocked(fetchInProgressTasks).mockResolvedValue(null);

    let resolveSave: () => void = () => {};
    vi.mocked(saveTaskToServer).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        }),
    );

    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useTaskState(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    let savePromise: Promise<void>;
    act(() => {
      savePromise = result.current.saveTaskAsync(
        makeTask({ id: 1, secondsCounted: 10 }),
      );
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    await act(async () => {
      resolveSave();
      await savePromise!;
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
