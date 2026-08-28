import { ApiError } from "@shared/lib/api/client";
import { fetchMeasurementPhotos } from "@entities/athlete/api";
import {
  comparisonPair,
  photoForAngle,
  hasAnyPhoto,
  ANGLE_LABEL,
  PHOTO_ANGLES,
} from "@entities/athlete/lib/photo-comparison";
import { server } from "../../msw/server";
import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@shared/lib/api/client";
import { resetAthleteHandlerState, seedMeasurement, seedPhoto } from "../../msw/athlete-handlers";

beforeEach(() => {
  resetAthleteHandlerState();
});

describe("fotos de progresso", () => {
  it("lê as fotos de uma medida com a url assinada", async () => {
    const measurement = seedMeasurement({ measuredAt: "2026-05-01T00:00:00.000Z", weightKg: 80 });
    seedPhoto({ measurementId: measurement.id, angle: "front" });
    seedPhoto({ measurementId: measurement.id, angle: "side" });

    const photos = await fetchMeasurementPhotos(measurement.id);

    expect(photos).toHaveLength(2);
    expect(photos[0]!.url).toMatch(/^https:/);
    expect(photos.map((photo) => photo.angle)).toEqual(["front", "side"]);
  });

  it("devolve lista vazia para medida sem foto — o caso comum", async () => {
    const measurement = seedMeasurement({ measuredAt: "2026-05-01T00:00:00.000Z", weightKg: 80 });

    await expect(fetchMeasurementPhotos(measurement.id)).resolves.toEqual([]);
  });

  it("entrega a foto pendente sem url em vez de falhar", async () => {
    const measurement = seedMeasurement({ measuredAt: "2026-05-01T00:00:00.000Z", weightKg: 80 });
    seedPhoto({ measurementId: measurement.id, angle: "back", status: "pending", url: null });

    const [photo] = await fetchMeasurementPhotos(measurement.id);

    expect(photo!.status).toBe("pending");
    expect(photo!.url).toBeNull();
  });

  it("propaga 404 de medida que não é do aluno", async () => {
    await expect(fetchMeasurementPhotos("measurement-de-outro")).rejects.toBeInstanceOf(ApiError);
  });

  it("rejeita resposta fora do contrato em vez de renderizar lixo", async () => {
    const measurement = seedMeasurement({ measuredAt: "2026-05-01T00:00:00.000Z", weightKg: 80 });
    server.use(
      http.get(`${API_BASE_URL}/measurements/:id/photos`, () =>
        HttpResponse.json([{ id: "p1", angle: "top" }]),
      ),
    );

    await expect(fetchMeasurementPhotos(measurement.id)).rejects.toThrow();
  });
});

describe("comparação antes e depois", () => {
  const older = { id: "m1", measuredAt: "2026-05-01T00:00:00.000Z" };
  const middle = { id: "m2", measuredAt: "2026-06-01T00:00:00.000Z" };
  const newer = { id: "m3", measuredAt: "2026-07-01T00:00:00.000Z" };

  it("escolhe a mais antiga e a mais recente, ignorando as do meio", () => {
    const pair = comparisonPair([middle, newer, older] as never);

    expect(pair).toEqual({ before: older, after: newer });
  });

  it("não compara quando há uma medida só", () => {
    expect(comparisonPair([older] as never)).toBeNull();
  });

  it("não compara quando não há medida nenhuma", () => {
    expect(comparisonPair([])).toBeNull();
  });

  it("acha a foto do ângulo pedido e devolve null quando não existe", () => {
    const photos = [
      { id: "p1", angle: "front" },
      { id: "p2", angle: "side" },
    ] as never;

    expect(photoForAngle(photos, "front")).toMatchObject({ id: "p1" });
    expect(photoForAngle(photos, "back")).toBeNull();
  });

  it("reconhece quando nenhum dos dois momentos tem foto", () => {
    expect(hasAnyPhoto([], [])).toBe(false);
    expect(hasAnyPhoto([], [{ id: "p1" }] as never)).toBe(true);
  });

  it("rotula os três ângulos em português", () => {
    expect(PHOTO_ANGLES).toEqual(["front", "back", "side"]);
    expect(PHOTO_ANGLES.map((angle) => ANGLE_LABEL[angle])).toEqual(["Frente", "Costas", "Lado"]);
  });
});
