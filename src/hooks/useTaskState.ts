import {
  fetchTasksFromServer,
  saveTaskToServer,
} from "@/services/tasks";
import {
  deleteInProgressTask,
  fetchInProgressTasks,
  saveInProgressTask,
} from "@/services/tasksInProgress";
import { Task, InProgressTask } from "@/types";
import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { useState } from "react";
import { toaster } from "@/components/ui/toaster";

export const useTaskState = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [inProgressTask, setInProgressTask] = useState<InProgressTask | null>(
    null,
  );

  const { isFetching: isFetchingTasks, refetch: refetchTasks } = useQuery(
    ["tasks"],
    fetchTasksFromServer,
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      onSuccess(data) {
        setTasks(data);
        if (selectedTask) {
          setSelectedTask(
            data.find((task) => task.id === selectedTask?.id) ?? null,
          );
        }
      },
    },
  );

  useQuery(
    ["tasks-in-progress", tasks.length],
    fetchInProgressTasks,
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      enabled: tasks.length > 0,
      onSuccess(inProgressTask) {
        if (!inProgressTask) {
          setInProgressTask(null);
        } else {
          inProgressTask.id = Number(inProgressTask.id);

          const newSelectedTask = tasks.find(
            (task) => task.id === inProgressTask.id,
          );

          if (!newSelectedTask) {
            toaster.create({
              duration: 5000,
              closable: true,
              title: "Error",
              type: "error",
              description: "Selected task not found",
            });
            return;
          }

          setSelectedTask(newSelectedTask);
          setInProgressTask({
            id: inProgressTask.id,
            startTime: Number(inProgressTask.startTime),
            sessionStartRemaining: newSelectedTask.remainingTime,
          });
        }
      },
    },
  );

  const saveTaskMutation = useMutation(saveTaskToServer);
  const saveInProgressTaskMutation = useMutation(saveInProgressTask);
  const deleteInProgressTaskMutation = useMutation(deleteInProgressTask);

  const saveTaskAsync = async (task: Task) => {
    await saveTaskMutation.mutateAsync(task);
  };

  const saveInProgressTaskAsync = async (
    taskId: number,
    sessionStartRemaining: number,
  ) => {
    const startTime = Date.now();
    setInProgressTask({ id: taskId, startTime, sessionStartRemaining });
    await saveInProgressTaskMutation.mutateAsync({ taskId, startTime });
  };

  const removeInProgressTaskAsync = async () => {
    setInProgressTask(null);
    await deleteInProgressTaskMutation.mutateAsync();
  };

  const refetchTasksAsync = async () => {
    return await refetchTasks();
  };

  return {
    tasks,
    selectedTask,
    inProgressTask,
    setTasks,
    setSelectedTask,
    setInProgressTask,
    saveTaskAsync,
    refetchTasksAsync,
    saveInProgressTaskAsync,
    removeInProgressTaskAsync,
    isLoading: isFetchingTasks || saveTaskMutation.isLoading,
  };
};
