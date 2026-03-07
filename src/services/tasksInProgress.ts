
export const fetchInProgressTasks = async () => {
    const response = await fetch("/api/tasks-in-progress");
    if (!response.ok) {
        throw new Error("Failed to fetch tasks");
    }
    const data = await response.json();
    return data;
};

export const saveInProgressTask = async (param: { taskId: number, startTime: number }) => {
    const response = await fetch("/api/tasks-in-progress", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(param),
    });

    if (!response.ok) {
        throw new Error("Failed to save task");
    }

    const data = await response.json();
    return data;
};

export const deleteInProgressTask = async () => {
    const response = await fetch("/api/tasks-in-progress", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Failed to delete task");
    }
};