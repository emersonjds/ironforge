import { pickHeaviestRecord } from "@entities/load-history/lib/pick-heaviest-record";
import type { PersonalRecordEntry } from "@entities/load-history/api";

function record(overrides: Partial<PersonalRecordEntry>): PersonalRecordEntry {
  return {
    exerciseId: "ex-1",
    weight: 100,
    reps: 5,
    performedAt: "2026-03-28T12:00:00.000Z",
    ...overrides,
  };
}

describe("pickHeaviestRecord", () => {
  it("sem recordes: null", () => {
    expect(pickHeaviestRecord([])).toBeNull();
  });

  it("escolhe o recorde de maior peso", () => {
    const records = [record({ weight: 100 }), record({ weight: 160, exerciseId: "ex-2" }), record({ weight: 80 })];

    expect(pickHeaviestRecord(records)?.exerciseId).toBe("ex-2");
  });
});
