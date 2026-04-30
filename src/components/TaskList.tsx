import { Box, Collapsible, List } from "@chakra-ui/react";
import TaskCard from "./TaskCard";
import { useTimer } from "@/context/TimerStateContext";
import { useTask } from "@/context/TaskContext";

type TaskListProps = {};

const TaskList: React.FC<TaskListProps> = ({}) => {
  const {
    state: { timerState },
  } = useTimer();
  const {
    state: { tasks, selectedTask },
  } = useTask();

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
                <TaskCard task={task} />
              </Box>
            );
          }

          return (
            <Collapsible.Root
              open={visible}
              key={`task-${task.id}`}
              style={{
                overflow: "visible", // Prevent inner component to be cut off
                zIndex: index,
                position: "relative",
                background: "transparent",
              }}
            >
              <Collapsible.Content>
                <TaskCard task={task} />
              </Collapsible.Content>
            </Collapsible.Root>
          );
        })}
      </List.Root>
    </Box>
  );
};

export default TaskList;
