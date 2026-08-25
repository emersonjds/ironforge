import { useRestTimerStore, getRemainingSeconds } from "@features/workout/store-rest-timer";
import { haptics } from "@lib/haptics";

jest.mock("@lib/haptics", () => ({
  haptics: { pr: jest.fn() },
}));

describe("useRestTimerStore", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useRestTimerStore.getState().stop();
    jest.clearAllMocks();
  });

  afterEach(() => {
    useRestTimerStore.getState().stop();
    jest.useRealTimers();
  });

  it("conta por relógio de parede, não por decremento", () => {
    useRestTimerStore.getState().start(90);
    const remaining = getRemainingSeconds(useRestTimerStore.getState());
    expect(remaining).toBe(90);
  });

  it("sobrevive a um app em background: o tempo passado conta mesmo sem tick", () => {
    useRestTimerStore.getState().start(60);
    jest.setSystemTime(Date.now() + 40_000);
    const remaining = getRemainingSeconds(useRestTimerStore.getState());
    expect(remaining).toBe(20);
  });

  it("dispara o háptico de fim exatamente uma vez ao zerar", () => {
    useRestTimerStore.getState().start(2);
    jest.advanceTimersByTime(3000);
    expect(haptics.pr).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(3000);
    expect(haptics.pr).toHaveBeenCalledTimes(1);
  });

  it("adjust nunca deixa o restante negativo", () => {
    useRestTimerStore.getState().start(10);
    useRestTimerStore.getState().adjust(-30);
    expect(getRemainingSeconds(useRestTimerStore.getState())).toBe(0);
  });

  it("stop zera o estado", () => {
    useRestTimerStore.getState().start(30);
    useRestTimerStore.getState().stop();
    expect(useRestTimerStore.getState().endsAt).toBeNull();
    expect(getRemainingSeconds(useRestTimerStore.getState())).toBe(0);
  });
});
