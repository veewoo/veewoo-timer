import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MINUTES_25 } from "@/constants";
import type { Task } from "@/types";
import {
  deleteTaskFromServer,
  fetchTasksFromServer,
  saveTaskToServer,
} from "@/services/tasks";

const mockResponse = (body: unknown, ok = true) =>
  ({ ok, json: async () => body }) as Response;

describe("tasks service", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("fetchTasksFromServer", () => {
    it("maps tasks and defaults falsy remainingTime to MINUTES_25", async () => {
      const tasks: Task[] = [
        {
          id: 1,
          name: "A",
          secondsCounted: 0,
          remainingTime: 0,
          startTime: null,
          pauseTime: null,
          stopTime: null,
          lastModified: "",
        },
        {
          id: 2,
          name: "B",
          secondsCounted: 0,
          remainingTime: 300,
          startTime: null,
          pauseTime: null,
          stopTime: null,
          lastModified: "",
        },
      ];

      vi.mocked(fetch).mockResolvedValue(mockResponse({ tasks }));

      const result = await fetchTasksFromServer();

      expect(fetch).toHaveBeenCalledWith("/api/tasks");
      expect(result[0].remainingTime).toBe(MINUTES_25);
      expect(result[1].remainingTime).toBe(300);
    });

    it("throws when response is not ok", async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({}, false));

      await expect(fetchTasksFromServer()).rejects.toThrow(
        "Failed to fetch tasks",
      );
    });
  });

  describe("saveTaskToServer", () => {
    it("posts the task payload", async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({}));

      const task = {
        id: 1,
        name: "A",
        secondsCounted: 10,
        remainingTime: 300,
        startTime: null,
        pauseTime: null,
        stopTime: null,
        lastModified: "09:00 AM",
      };

      await saveTaskToServer(task);

      expect(fetch).toHaveBeenCalledWith("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });
    });

    it("throws when response is not ok", async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({}, false));

      await expect(
        saveTaskToServer({
          id: 1,
          name: "A",
          secondsCounted: 0,
          remainingTime: MINUTES_25,
          startTime: null,
          pauseTime: null,
          stopTime: null,
          lastModified: "",
        }),
      ).rejects.toThrow("Failed to save task");
    });
  });

  describe("deleteTaskFromServer", () => {
    it("sends delete request with task id", async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({}));

      await deleteTaskFromServer(7);

      expect(fetch).toHaveBeenCalledWith("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: 7 }),
      });
    });

    it("throws when response is not ok", async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({}, false));

      await expect(deleteTaskFromServer(7)).rejects.toThrow(
        "Failed to delete task",
      );
    });
  });
});
