import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskCard from "@/components/TaskCard";
import { makeInProgressTask, makeTask } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";

describe("TaskCard", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders task name and elapsed time", () => {
    renderWithProviders(
      <TaskCard
        task={makeTask({ name: "Design review", secondsCounted: 60 })}
        isLoading={false}
        timerState="stopped"
        inProgressTask={null}
        isSelected={false}
        onSelectTask={vi.fn()}
        onResetTask={vi.fn()}
      />,
    );

    expect(screen.getByText("Design review")).toBeInTheDocument();
    expect(screen.getByText("01:00")).toBeInTheDocument();
  });

  it("adds live session seconds for the in-progress task", () => {
    const startTime = Date.now() - 30_000;

    renderWithProviders(
      <TaskCard
        task={makeTask({ id: 1, secondsCounted: 60 })}
        isLoading={false}
        timerState="active"
        inProgressTask={makeInProgressTask({
          id: 1,
          startTime,
          sessionStartRemaining: 600,
        })}
        isSelected
        onSelectTask={vi.fn()}
        onResetTask={vi.fn()}
      />,
    );

    expect(screen.getByText("01:30")).toBeInTheDocument();
  });

  it("does not add session seconds for other tasks", () => {
    renderWithProviders(
      <TaskCard
        task={makeTask({ id: 2, secondsCounted: 60 })}
        isLoading={false}
        timerState="active"
        inProgressTask={makeInProgressTask({ id: 1 })}
        isSelected={false}
        onSelectTask={vi.fn()}
        onResetTask={vi.fn()}
      />,
    );

    expect(screen.getByText("01:00")).toBeInTheDocument();
  });

  it("renders lastModified when present", () => {
    renderWithProviders(
      <TaskCard
        task={makeTask({ lastModified: "09:05 AM" })}
        isLoading={false}
        timerState="stopped"
        inProgressTask={null}
        isSelected={false}
        onSelectTask={vi.fn()}
        onResetTask={vi.fn()}
      />,
    );

    expect(screen.getByText("09:05 AM")).toBeInTheDocument();
  });

  it("calls onSelectTask when clicked while timer is not active", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSelectTask = vi.fn();
    const task = makeTask({ id: 3, name: "Select me" });

    renderWithProviders(
      <TaskCard
        task={task}
        isLoading={false}
        timerState="stopped"
        inProgressTask={null}
        isSelected={false}
        onSelectTask={onSelectTask}
        onResetTask={vi.fn()}
      />,
    );

    await user.click(screen.getByText("Select me"));

    expect(onSelectTask).toHaveBeenCalledWith(task);
  });

  it("does not call onSelectTask when timer is active", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSelectTask = vi.fn();
    const task = makeTask({ id: 3, name: "Locked" });

    renderWithProviders(
      <TaskCard
        task={task}
        isLoading={false}
        timerState="active"
        inProgressTask={null}
        isSelected={false}
        onSelectTask={onSelectTask}
        onResetTask={vi.fn()}
      />,
    );

    await user.click(screen.getByText("Locked"));

    expect(onSelectTask).not.toHaveBeenCalled();
  });

  it("calls onResetTask without selecting the card", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSelectTask = vi.fn();
    const onResetTask = vi.fn();
    const task = makeTask({ id: 4, name: "Reset me" });

    renderWithProviders(
      <TaskCard
        task={task}
        isLoading={false}
        timerState="stopped"
        inProgressTask={null}
        isSelected={false}
        onSelectTask={onSelectTask}
        onResetTask={onResetTask}
      />,
    );

    await user.click(screen.getByRole("button"));

    expect(onResetTask).toHaveBeenCalledWith(task);
    expect(onSelectTask).not.toHaveBeenCalled();
  });

  it("disables reset button while loading", () => {
    renderWithProviders(
      <TaskCard
        task={makeTask()}
        isLoading
        timerState="stopped"
        inProgressTask={null}
        isSelected={false}
        onSelectTask={vi.fn()}
        onResetTask={vi.fn()}
      />,
    );

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
