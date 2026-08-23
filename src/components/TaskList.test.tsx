import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskList from "@/components/TaskList";
import { makeTask } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";

describe("TaskList", () => {
  it("renders one card per task", () => {
    renderWithProviders(
      <TaskList
        tasks={[
          makeTask({ id: 1, name: "Task A" }),
          makeTask({ id: 2, name: "Task B" }),
        ]}
        timerState="stopped"
        isLoading={false}
        selectedTask={null}
        inProgressTask={null}
        onSelectTask={vi.fn()}
        onResetTask={vi.fn()}
      />,
    );

    expect(screen.getByText("Task A")).toBeInTheDocument();
    expect(screen.getByText("Task B")).toBeInTheDocument();
  });

  it("hides non-selected tasks while timer is active", () => {
    renderWithProviders(
      <TaskList
        tasks={[
          makeTask({ id: 1, name: "Selected task" }),
          makeTask({ id: 2, name: "Hidden task" }),
        ]}
        timerState="active"
        isLoading={false}
        selectedTask={makeTask({ id: 1, name: "Selected task" })}
        inProgressTask={null}
        onSelectTask={vi.fn()}
        onResetTask={vi.fn()}
      />,
    );

    expect(screen.getByText("Selected task")).toBeVisible();
    expect(screen.getByText("Hidden task")).not.toBeVisible();
  });

  it("shows all tasks when timer is not active", () => {
    renderWithProviders(
      <TaskList
        tasks={[
          makeTask({ id: 1, name: "Task A" }),
          makeTask({ id: 2, name: "Task B" }),
        ]}
        timerState="stopped"
        isLoading={false}
        selectedTask={makeTask({ id: 1, name: "Task A" })}
        inProgressTask={null}
        onSelectTask={vi.fn()}
        onResetTask={vi.fn()}
      />,
    );

    expect(screen.getByText("Task A")).toBeVisible();
    expect(screen.getByText("Task B")).toBeVisible();
  });

  it("propagates select and reset callbacks", async () => {
    const user = userEvent.setup();
    const onSelectTask = vi.fn();
    const onResetTask = vi.fn();
    const task = makeTask({ id: 1, name: "Task A" });

    renderWithProviders(
      <TaskList
        tasks={[task]}
        timerState="stopped"
        isLoading={false}
        selectedTask={null}
        inProgressTask={null}
        onSelectTask={onSelectTask}
        onResetTask={onResetTask}
      />,
    );

    await user.click(screen.getByText("Task A"));
    expect(onSelectTask).toHaveBeenCalledWith(task);

    await user.click(screen.getByRole("button"));
    expect(onResetTask).toHaveBeenCalledWith(task);
  });

  it("renders nothing for an empty task list", () => {
    renderWithProviders(
      <TaskList
        tasks={[]}
        timerState="stopped"
        isLoading={false}
        selectedTask={null}
        inProgressTask={null}
        onSelectTask={vi.fn()}
        onResetTask={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
