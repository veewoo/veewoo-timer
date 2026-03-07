import { MINUTES_25 } from "@/constants";
import { Task } from "@/types";

export const fetchTasksFromServer = async () => {
    const response = await fetch("/api/tasks");
    if (!response.ok) {
        throw new Error("Failed to fetch tasks");
    }
    const data = await response.json();
    return (data.tasks as Task[]).map((item) => ({
        ...item,
        remainingTime: item.remainingTime || MINUTES_25,
    }));
};

export const saveTaskToServer = async (task: Task) => {
    const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ task }),
    });

    if (!response.ok) {
        throw new Error("Failed to save task");
    }
};

export const deleteTaskFromServer = async (taskId: number) => {
    const response = await fetch("/api/tasks", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: taskId }),
    });

    if (!response.ok) {
        throw new Error("Failed to delete task");
    }
};