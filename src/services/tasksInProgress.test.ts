import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  deleteInProgressTask,
  fetchInProgressTasks,
  saveInProgressTask,
} from "@/services/tasksInProgress";

const mockResponse = (body: unknown, ok = true) =>
  ({ ok, json: async () => body }) as Response;

describe("tasksInProgress service", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("fetchInProgressTasks", () => {
    it("returns parsed json including null", async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse(null));

      await expect(fetchInProgressTasks()).resolves.toBeNull();
      expect(fetch).toHaveBeenCalledWith("/api/tasks-in-progress");
    });

    it("throws when response is not ok", async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({}, false));

      await expect(fetchInProgressTasks()).rejects.toThrow(
        "Failed to fetch tasks",
      );
    });
  });

  describe("saveInProgressTask", () => {
    it("posts task id and start time", async () => {
      const payload = { id: 1, startTime: 123 };
      vi.mocked(fetch).mockResolvedValue(mockResponse(payload));

      await expect(
        saveInProgressTask({ taskId: 1, startTime: 123 }),
      ).resolves.toEqual(payload);

      expect(fetch).toHaveBeenCalledWith("/api/tasks-in-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: 1, startTime: 123 }),
      });
    });

    it("throws when response is not ok", async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({}, false));

      await expect(
        saveInProgressTask({ taskId: 1, startTime: 123 }),
      ).rejects.toThrow("Failed to save task");
    });
  });

  describe("deleteInProgressTask", () => {
    it("sends delete request", async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({}));

      await deleteInProgressTask();

      expect(fetch).toHaveBeenCalledWith("/api/tasks-in-progress", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
    });

    it("throws when response is not ok", async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({}, false));

      await expect(deleteInProgressTask()).rejects.toThrow(
        "Failed to delete task",
      );
    });
  });
});
