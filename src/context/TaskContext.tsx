import {
  deleteTaskFromServer,
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
  QueryObserverResult,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  Dispatch,
} from "react";
import { useToast } from "@chakra-ui/react";
import { calculateElapsedTime } from "@/utils";
import { MINUTES_25 } from "@/constants";

interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  inProgressTask: InProgressTask | null;
}

interface TaskAction {
  type: "SET_TASKS" | "SET_SELECTED_TASK" | "SET_IN_PROGRESS_TASK";
  payload?: any;
}

interface TaskContextProps {
  state: TaskState;
  isLoading: boolean;
  isFetchingInProgressTasks: boolean;
  dispatch: Dispatch<TaskAction>;
  saveTaskAsync: (task: Task) => Promise<void>;
  removeInProgressTaskAsync: () => Promise<void>;
  deleteTaskAsync: (taskId: number) => Promise<void>;
  saveInProgressTaskAsync: (taskId: number) => Promise<void>;
  refetchTasksAsync: () => Promise<QueryObserverResult<Task[]>>;
}

const initialState: TaskState = {
  tasks: [],
  selectedTask: null,
  inProgressTask: null,
};

const TaskContext = createContext<TaskContextProps>({
  isLoading: false,
  state: initialState,
  isFetchingInProgressTasks: false,
  dispatch: () => null,
  refetchTasksAsync: async () => {
    throw new Error("Not implemented");
  },
  saveTaskAsync: async () => undefined,
  deleteTaskAsync: async () => undefined,
  saveInProgressTaskAsync: async () => undefined,
  removeInProgressTaskAsync: async () => undefined,
});

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case "SET_TASKS":
      return { ...state, tasks: action.payload };
    case "SET_SELECTED_TASK":
      return { ...state, selectedTask: action.payload };
    case "SET_IN_PROGRESS_TASK":
      return { ...state, inProgressTask: action.payload };
    default:
      return state;
  }
};

export const TaskProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const toast = useToast();
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const { isFetching: isFetchingTasks, refetch: refetchTasks } = useQuery(
    ["tasks"],
    fetchTasksFromServer,
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      onSuccess(data) {
        dispatch({ type: "SET_TASKS", payload: data });
        if (state.selectedTask) {
          dispatch({
            type: "SET_SELECTED_TASK",
            payload: data.find((task) => task.id === state.selectedTask?.id),
          });
        }
      },
    }
  );

  const { isFetching: isFetchingInProgressTasks, refetch: refetchInProgressTasks } = useQuery(
    ["tasks-in-progress", state.tasks.length],
    fetchInProgressTasks,
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      enabled: state.tasks.length > 0,
      onSuccess(inProgressTask) {
        if (!inProgressTask) {
          dispatch({ type: "SET_IN_PROGRESS_TASK", payload: null });
        } else {
          inProgressTask.id = Number(inProgressTask.id);

          const newSelectedTask = state.tasks.find(
            (task) => task.id === inProgressTask.id
          );

          if (!newSelectedTask) {
            toast({
              duration: 5000,
              isClosable: true,
              title: "Error",
              status: "error",
              description: "Selected task not found"
            });
            return;
          }

          const newElapsedTime = calculateElapsedTime(inProgressTask.startTime);

          if (newElapsedTime > newSelectedTask.remainingTime) {
            newSelectedTask.secondsCounted += newElapsedTime;
            newSelectedTask.remainingTime =
              MINUTES_25 - (newSelectedTask.secondsCounted % MINUTES_25);

            dispatch({
              type: "SET_TASKS",
              payload: state.tasks.map((task) =>
                task.id === newSelectedTask.id ? newSelectedTask : task
              ),
            });

            dispatch({
              type: "SET_SELECTED_TASK",
              payload: newSelectedTask,
            });
          } else {
            dispatch({
              type: "SET_SELECTED_TASK",
              payload: state.tasks.find((task) => task.id === inProgressTask.id),
            });
          }

          dispatch({ type: "SET_IN_PROGRESS_TASK", payload: inProgressTask });
        }
      },
    }
  );

  const saveTaskMutation = useMutation(saveTaskToServer);
  const deleteTaskMutation = useMutation(deleteTaskFromServer);
  const saveInProgressTaskMutation = useMutation(saveInProgressTask);
  const deleteInProgressTaskMutation = useMutation(deleteInProgressTask);

  const saveTaskAsync = async (task: Task) => {
    await saveTaskMutation.mutateAsync(task);
  };

  const deleteTaskAsync = async (taskId: number) => {
    await deleteTaskMutation.mutateAsync(taskId);
  };

  const saveInProgressTaskAsync = async (taskId: number) => {
    const inProgressTask = { taskId, startTime: Date.now() };
    dispatch({ type: "SET_IN_PROGRESS_TASK", payload: inProgressTask });
    await saveInProgressTaskMutation.mutateAsync(inProgressTask);
  };

  const removeInProgressTaskAsync = async () => {
    dispatch({ type: "SET_IN_PROGRESS_TASK", payload: null });
    await deleteInProgressTaskMutation.mutateAsync();
  };

  const refetchTasksAsync = async () => {
    return await refetchTasks();
  };

  return (
    <TaskContext.Provider
      value={{
        state,
        dispatch,
        saveTaskAsync,
        deleteTaskAsync,
        refetchTasksAsync,
        saveInProgressTaskAsync,
        removeInProgressTaskAsync,
        isFetchingInProgressTasks,
        isLoading: isFetchingTasks || saveTaskMutation.isLoading,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => useContext(TaskContext);
