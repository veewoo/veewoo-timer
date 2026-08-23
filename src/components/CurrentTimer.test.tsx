import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CurrentTimer from "@/components/CurrentTimer";
import { MINUTES_25 } from "@/constants";
import { makeInProgressTask, makeTask } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import type { InProgressTask, Task, TimerState } from "@/types";

type TimerProps = {
  variant: "default" | "embed";
  timerState: TimerState;
  remainingTime: number;
  setRemainingTime: (value: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  inProgressTask: InProgressTask | null;
  selectedTask: Task | null;
  onTimerStart: () => void;
  onTimerPause: () => void;
  onTimerFinish: () => void;
};

function renderTimer(overrides: Partial<TimerProps> = {}) {
  const props: TimerProps = {
    variant: "default",
    timerState: "stopped",
    remainingTime: MINUTES_25,
    setRemainingTime: vi.fn(),
    startTimer: vi.fn(),
    pauseTimer: vi.fn(),
    stopTimer: vi.fn(),
    inProgressTask: null,
    selectedTask: null,
    onTimerStart: vi.fn(),
    onTimerPause: vi.fn(),
    onTimerFinish: vi.fn(),
    ...overrides,
  };

  const view = renderWithProviders(<CurrentTimer {...props} />);
  return { ...view, props };
}

describe("CurrentTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it("renders the default remaining time", () => {
    renderTimer();
    expect(screen.getByText("25:00")).toBeInTheDocument();
  });

  it("disables start when no task is selected", () => {
    renderTimer();
    expect(screen.getByRole("button", { name: /start/i })).toBeDisabled();
  });

  it("enables start when a task is selected", () => {
    renderTimer({ selectedTask: makeTask() });
    expect(screen.getByRole("button", { name: /start/i })).toBeEnabled();
  });

  it("calls start handlers when start is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { props } = renderTimer({ selectedTask: makeTask() });

    await user.click(screen.getByRole("button", { name: /start/i }));

    expect(props.startTimer).toHaveBeenCalledTimes(1);
    expect(props.onTimerStart).toHaveBeenCalledTimes(1);
  });

  it("shows pause and calls pause handlers when active", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { props } = renderTimer({
      timerState: "active",
      selectedTask: makeTask(),
    });

    await user.click(screen.getByRole("button", { name: /pause/i }));

    expect(props.pauseTimer).toHaveBeenCalledTimes(1);
    expect(props.onTimerPause).toHaveBeenCalledTimes(1);
    expect(props.onTimerPause).toHaveBeenCalledWith();
  });

  it("decrements remaining time while active", () => {
    const setRemainingTime = vi.fn();
    renderTimer({
      timerState: "active",
      selectedTask: makeTask(),
      setRemainingTime,
      inProgressTask: makeInProgressTask({
        sessionStartRemaining: 10,
        startTime: Date.now(),
      }),
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(setRemainingTime).toHaveBeenCalledWith(9);
  });

  it("finishes when remaining time reaches zero", () => {
    const stopTimer = vi.fn();
    const onTimerFinish = vi.fn();
    const setRemainingTime = vi.fn();

    renderTimer({
      timerState: "active",
      selectedTask: makeTask(),
      stopTimer,
      onTimerFinish,
      setRemainingTime,
      inProgressTask: makeInProgressTask({
        sessionStartRemaining: 1,
        startTime: Date.now(),
      }),
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(stopTimer).toHaveBeenCalledTimes(1);
    expect(onTimerFinish).toHaveBeenCalledTimes(1);
    expect(setRemainingTime).not.toHaveBeenCalledWith(0);
  });

  it("clears the interval when paused", () => {
    const setRemainingTime = vi.fn();
    const { rerender } = renderWithProviders(
      <CurrentTimer
        variant="default"
        timerState="active"
        remainingTime={10}
        setRemainingTime={setRemainingTime}
        startTimer={vi.fn()}
        pauseTimer={vi.fn()}
        stopTimer={vi.fn()}
        inProgressTask={makeInProgressTask({
          sessionStartRemaining: 10,
          startTime: Date.now(),
        })}
        selectedTask={makeTask()}
        onTimerStart={vi.fn()}
        onTimerPause={vi.fn()}
        onTimerFinish={vi.fn()}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    setRemainingTime.mockClear();

    rerender(
      <CurrentTimer
        variant="default"
        timerState="paused"
        remainingTime={9}
        setRemainingTime={setRemainingTime}
        startTimer={vi.fn()}
        pauseTimer={vi.fn()}
        stopTimer={vi.fn()}
        inProgressTask={makeInProgressTask({
          sessionStartRemaining: 10,
          startTime: Date.now(),
        })}
        selectedTask={makeTask()}
        onTimerStart={vi.fn()}
        onTimerPause={vi.fn()}
        onTimerFinish={vi.fn()}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(setRemainingTime).not.toHaveBeenCalled();
  });

  it("renders embed variant without progress circle", () => {
    renderTimer({ variant: "embed", selectedTask: makeTask() });
    expect(screen.getByText("25:00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
  });
});
