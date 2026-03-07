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
        {tasks.map((task, index) => (
          <Collapse
            key={`task-${task.id}`}
            style={{
              overflow: "",
              zIndex: index,
              position: "relative",
              background: "transparent",
            }}
            in={timerState != "active" || task.id === selectedTask?.id}
          >
            <ListItem>
              <TaskCard task={task} />
            </ListItem>
          </Collapse>
        ))}
      </List>
    </Box>
  );
};

export default TaskList;
