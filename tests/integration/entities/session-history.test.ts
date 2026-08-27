import { fetchSessions } from "@entities/session/api";
import {
  resetSessionHandlerState,
  seedOpenSession,
  TEST_ATHLETE_ID,
} from "../../msw/session-handlers";

beforeEach(() => {
  resetSessionHandlerState();
});

describe("histórico: GET /sessions com paginação", () => {
  it("primeira página respeita o limit e informa o total", async () => {
    for (let i = 0; i < 5; i += 1) {
      seedOpenSession({ endedAt: new Date(2026, 7, i + 1).toISOString() });
    }

    const page = await fetchSessions({ limit: 2, offset: 0 });

    expect(page.items).toHaveLength(2);
    expect(page.total).toBe(5);
    expect(page.offset).toBe(0);
  });

  it("segunda página busca o próximo bloco sem repetir itens", async () => {
    for (let i = 0; i < 5; i += 1) {
      seedOpenSession({ endedAt: new Date(2026, 7, i + 1).toISOString() });
    }

    const first = await fetchSessions({ limit: 2, offset: 0 });
    const second = await fetchSessions({ limit: 2, offset: 2 });

    const firstIds = new Set(first.items.map((s) => s.id));
    const secondIds = second.items.map((s) => s.id);
    expect(secondIds.every((id) => !firstIds.has(id))).toBe(true);
    expect(second.offset).toBe(2);
  });

  it("sem sessões: página vazia com total zero", async () => {
    const page = await fetchSessions();

    expect(page.items).toEqual([]);
    expect(page.total).toBe(0);
  });

  it("mapeia os campos da sessão para o domínio local do athleteId de teste", async () => {
    seedOpenSession({ endedAt: "2026-08-20T12:00:00.000Z" });

    const page = await fetchSessions({ limit: 1 });

    expect(page.items[0]!.athleteId).toBe(TEST_ATHLETE_ID);
    expect(page.items[0]!.endedAt).toBe("2026-08-20T12:00:00.000Z");
  });
});
