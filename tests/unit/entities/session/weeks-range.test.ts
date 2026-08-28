import { weeksRangeEndingNow } from "@entities/session/lib/weeks-range";

describe("weeksRangeEndingNow", () => {
  it("calcula from como N semanas antes de now e to como now", () => {
    const now = new Date("2026-08-27T12:00:00.000Z");

    const range = weeksRangeEndingNow(26, now);

    expect(range.to).toBe(now.toISOString());
    expect(range.from).toBe("2026-02-26T12:00:00.000Z");
  });
});
