import { Box, List, ListItem, Collapse } from "@chakra-ui/react";
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
      <List spacing={3}>
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
                <ListItem>
                  <TaskCard task={task} />
                </ListItem>
              </Box>
            );
          }

          return (
            <Collapse
              in={visible}
              key={`task-${task.id}`}
              style={{
                overflow: "", // Prevent inner component to be cut off
                zIndex: index,
                position: "relative",
                background: "transparent",
              }}
            >
              <ListItem>
                <TaskCard task={task} />
              </ListItem>
            </Collapse>
          );
        })}
      </List>
    </Box>
  );
};

export default TaskList;
