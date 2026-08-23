import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MINUTES_25 } from "@/constants";
import {
  formatTime,
  formatTimeByDate,
  getSessionTimerSnapshot,
  requestWakeLockForPhone,
} from "@/utils";

const normalize = (value: string) => value.replace(/\s/g, " ");

describe("formatTime", () => {
  it("formats zero seconds", () => {
    expect(formatTime(0)).toBe("00:00");
  });

  it("formats single-digit seconds", () => {
    expect(formatTime(5)).toBe("00:05");
  });

  it("formats 59 seconds", () => {
    expect(formatTime(59)).toBe("00:59");
  });

  it("formats one minute", () => {
    expect(formatTime(60)).toBe("01:00");
  });

  it("formats minutes and seconds", () => {
    expect(formatTime(65)).toBe("01:05");
  });

  it("formats 25 minutes", () => {
    expect(formatTime(MINUTES_25)).toBe("25:00");
  });

  it("does not roll over hours", () => {
    expect(formatTime(3600)).toBe("60:00");
  });
});

describe("getSessionTimerSnapshot", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns zero elapsed when no time has passed", () => {
    const startTime = Date.now();
    expect(
      getSessionTimerSnapshot({
        startTime,
        sessionStartRemaining: 600,
      }),
    ).toEqual({ elapsedSeconds: 0, remainingSeconds: 600 });
  });

  it("decrements remaining after 10 seconds", () => {
    const startTime = Date.now();
    vi.advanceTimersByTime(10_000);

    expect(
      getSessionTimerSnapshot({
        startTime,
        sessionStartRemaining: 600,
      }),
    ).toEqual({ elapsedSeconds: 10, remainingSeconds: 590 });
  });

  it("floors sub-second elapsed time to 1 second", () => {
    const startTime = Date.now();
    vi.advanceTimersByTime(1500);

    expect(
      getSessionTimerSnapshot({
        startTime,
        sessionStartRemaining: 600,
      }),
    ).toEqual({ elapsedSeconds: 1, remainingSeconds: 599 });
  });

  it("clamps remaining to zero when elapsed exceeds session", () => {
    const startTime = Date.now();
    vi.advanceTimersByTime(700_000);

    const snapshot = getSessionTimerSnapshot({
      startTime,
      sessionStartRemaining: 600,
    });

    expect(snapshot.remainingSeconds).toBe(0);
    expect(snapshot.elapsedSeconds).toBe(700);
  });

  it("handles startTime in the future", () => {
    const startTime = Date.now() + 5000;

    const snapshot = getSessionTimerSnapshot({
      startTime,
      sessionStartRemaining: 600,
    });

    expect(snapshot.elapsedSeconds).toBeLessThan(0);
    expect(snapshot.remainingSeconds).toBe(605);
  });
});

describe("formatTimeByDate", () => {
  it("formats a fixed date in UTC", () => {
    expect(
      normalize(formatTimeByDate(new Date("2026-01-01T09:05:00Z"))),
    ).toBe("09:05 AM");
  });

  it("formats the default argument", () => {
    expect(normalize(formatTimeByDate())).toMatch(/^\d{2}:\d{2} (AM|PM)$/);
  });
});

describe("requestWakeLockForPhone", () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.unstubAllGlobals();
  });

  function stubPhoneDevice() {
    window.matchMedia = ((query: string) => ({
      matches:
        query === "(pointer: coarse)" || query === "(max-width: 767px)",
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  }

  it("requests wake lock on phone devices", async () => {
    stubPhoneDevice();
    const sentinel = { released: false };
    const request = vi.fn().mockResolvedValue(sentinel);
    Object.defineProperty(navigator, "wakeLock", {
      value: { request },
      configurable: true,
    });

    await expect(requestWakeLockForPhone()).resolves.toBe(sentinel);
    expect(request).toHaveBeenCalledWith("screen");
  });

  it("returns null when viewport is not phone-sized", async () => {
    window.matchMedia = ((query: string) => ({
      matches: query === "(pointer: coarse)",
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;

    const request = vi.fn();
    Object.defineProperty(navigator, "wakeLock", {
      value: { request },
      configurable: true,
    });

    await expect(requestWakeLockForPhone()).resolves.toBeNull();
    expect(request).not.toHaveBeenCalled();
  });

  it("returns null when wakeLock is unavailable", async () => {
    stubPhoneDevice();
    Object.defineProperty(navigator, "wakeLock", {
      value: undefined,
      configurable: true,
    });

    await expect(requestWakeLockForPhone()).resolves.toBeNull();
  });

  it("returns null when request rejects", async () => {
    stubPhoneDevice();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const request = vi
      .fn()
      .mockRejectedValue(new Error("Not allowed"));
    Object.defineProperty(navigator, "wakeLock", {
      value: { request },
      configurable: true,
    });

    await expect(requestWakeLockForPhone()).resolves.toBeNull();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
