import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MINUTES_25 } from "@/constants";
import { useTimerState } from "@/hooks/useTimerState";

describe("useTimerState", () => {
  it("starts in stopped state with default remaining time", () => {
    const { result } = renderHook(() => useTimerState());

    expect(result.current.timerState).toBe("stopped");
    expect(result.current.remainingTime).toBe(MINUTES_25);
  });

  it("transitions to active on startTimer", () => {
    const { result } = renderHook(() => useTimerState());

    act(() => {
      result.current.startTimer();
    });

    expect(result.current.timerState).toBe("active");
  });

  it("transitions to paused on pauseTimer", () => {
    const { result } = renderHook(() => useTimerState());

    act(() => {
      result.current.startTimer();
      result.current.pauseTimer();
    });

    expect(result.current.timerState).toBe("paused");
  });

  it("resets remaining time on stopTimer", () => {
    const { result } = renderHook(() => useTimerState());

    act(() => {
      result.current.setRemainingTime(300);
      result.current.stopTimer();
    });

    expect(result.current.timerState).toBe("stopped");
    expect(result.current.remainingTime).toBe(MINUTES_25);
  });

  it("does not change remaining time on pauseTimer", () => {
    const { result } = renderHook(() => useTimerState());

    act(() => {
      result.current.setRemainingTime(300);
      result.current.startTimer();
      result.current.pauseTimer();
    });

    expect(result.current.remainingTime).toBe(300);
  });

  it("keeps stable callback identities", () => {
    const { result, rerender } = renderHook(() => useTimerState());
    const { startTimer, pauseTimer, stopTimer } = result.current;

    rerender();

    expect(result.current.startTimer).toBe(startTimer);
    expect(result.current.pauseTimer).toBe(pauseTimer);
    expect(result.current.stopTimer).toBe(stopTimer);
  });
});
