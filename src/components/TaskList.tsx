import { Box, Collapsible, List } from "@chakra-ui/react";
import TaskCard from "./TaskCard";
import { InProgressTask, Task, TimerState } from "@/types";

interface TaskListProps {
  tasks: Task[];
  timerState: TimerState;
  isLoading: boolean;
  selectedTask: Task | null;
  inProgressTask: InProgressTask | null;
  onSelectTask: (task: Task) => void;
  onResetTask: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  timerState,
  isLoading,
  selectedTask,
  inProgressTask,
  onSelectTask,
  onResetTask,
}) => {
  return (
    <Box mb={4}>
      <List.Root gap={3}>
        {tasks.map((task, index) => {
          const visible =
            timerState !== "active" || task.id === selectedTask?.id;
          const isSelected = task.id === selectedTask?.id;

          if (isSelected) {
            return (
              <Box
                py={1}
                bottom={2}
                position="sticky"
                zIndex={tasks.length}
                key={`task-${task.id}`}
              >
                <TaskCard
                  task={task}
                  isLoading={isLoading}
                  timerState={timerState}
                  inProgressTask={inProgressTask}
                  isSelected={isSelected}
                  onSelectTask={onSelectTask}
                  onResetTask={onResetTask}
                />
              </Box>
            );
          }

          return (
            <Collapsible.Root
              open={visible}
              key={`task-${task.id}`}
              style={{
                overflow: "visible",
                zIndex: index,
                position: "relative",
                background: "transparent",
              }}
            >
              <Collapsible.Content>
                <TaskCard
                  task={task}
                  isLoading={isLoading}
                  timerState={timerState}
                  inProgressTask={inProgressTask}
                  isSelected={isSelected}
                  onSelectTask={onSelectTask}
                  onResetTask={onResetTask}
                />
              </Collapsible.Content>
            </Collapsible.Root>
          );
        })}
      </List.Root>
    </Box>
  );
};

export default TaskList;
