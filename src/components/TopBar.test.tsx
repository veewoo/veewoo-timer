import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TopBar from "@/components/TopBar";
import { makeTask } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import type { QueryObserverResult } from "@tanstack/react-query";
import type { Task } from "@/types";

describe("TopBar", () => {
  it("renders heading and sync button", () => {
    renderWithProviders(
      <TopBar
        isLoading={false}
        selectedTask={null}
        setRemainingTime={vi.fn()}
        refetchTasksAsync={vi.fn()}
      />,
    );

    expect(screen.getByText("Veewoo Task Timer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sync" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeInTheDocument();
  });

  it("toggles between light and dark mode", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <TopBar
        isLoading={false}
        selectedTask={null}
        setRemainingTime={vi.fn()}
        refetchTasksAsync={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Switch to dark mode" }));

    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument();
    expect(document.documentElement).toHaveClass("dark");
  });

  it("calls refetchTasksAsync when sync is clicked", async () => {
    const user = userEvent.setup();
    const refetchTasksAsync = vi.fn().mockResolvedValue({ data: [] });

    renderWithProviders(
      <TopBar
        isLoading={false}
        selectedTask={null}
        setRemainingTime={vi.fn()}
        refetchTasksAsync={refetchTasksAsync}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Sync" }));

    expect(refetchTasksAsync).toHaveBeenCalledTimes(1);
  });

  it("updates remaining time from refreshed selected task", async () => {
    const user = userEvent.setup();
    const setRemainingTime = vi.fn();
    const selectedTask = makeTask({ id: 1, remainingTime: 600 });
    const refetchTasksAsync = vi.fn().mockResolvedValue({
      data: [makeTask({ id: 1, remainingTime: 300 })],
    } as unknown as QueryObserverResult<Task[]>);

    renderWithProviders(
      <TopBar
        isLoading={false}
        selectedTask={selectedTask}
        setRemainingTime={setRemainingTime}
        refetchTasksAsync={refetchTasksAsync}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Sync" }));

    expect(setRemainingTime).toHaveBeenCalledWith(300);
  });

  it("does not update remaining time when selected task is missing", async () => {
    const user = userEvent.setup();
    const setRemainingTime = vi.fn();
    const refetchTasksAsync = vi.fn().mockResolvedValue({
      data: [makeTask({ id: 2, remainingTime: 300 })],
    } as unknown as QueryObserverResult<Task[]>);

    renderWithProviders(
      <TopBar
        isLoading={false}
        selectedTask={makeTask({ id: 1 })}
        setRemainingTime={setRemainingTime}
        refetchTasksAsync={refetchTasksAsync}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Sync" }));

    expect(setRemainingTime).not.toHaveBeenCalled();
  });

  it("does not update remaining time when no task is selected", async () => {
    const user = userEvent.setup();
    const setRemainingTime = vi.fn();
    const refetchTasksAsync = vi.fn().mockResolvedValue({
      data: [makeTask({ id: 1, remainingTime: 300 })],
    } as unknown as QueryObserverResult<Task[]>);

    renderWithProviders(
      <TopBar
        isLoading={false}
        selectedTask={null}
        setRemainingTime={setRemainingTime}
        refetchTasksAsync={refetchTasksAsync}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Sync" }));

    expect(setRemainingTime).not.toHaveBeenCalled();
  });

  it("shows loading state on sync button", () => {
    renderWithProviders(
      <TopBar
        isLoading
        selectedTask={null}
        setRemainingTime={vi.fn()}
        refetchTasksAsync={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Sync" })).toHaveAttribute(
      "data-loading",
    );
  });
});
