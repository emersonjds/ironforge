import { PlaybackSchema, ExerciseDemoSchema } from "@entities/video/schema";

describe("PlaybackSchema", () => {
  it("aceita playback do tipo youtube", () => {
    const result = PlaybackSchema.safeParse({
      kind: "youtube",
      youtubeVideoId: "abc123",
      embedUrl: "https://www.youtube-nocookie.com/embed/abc123",
      watchUrl: "https://www.youtube.com/watch?v=abc123",
      thumbnailUrl: "https://img.youtube.com/vi/abc123/hqdefault.jpg",
    });
    expect(result.success).toBe(true);
  });

  it("aceita playback do tipo file com expiração e thumbnail nulo", () => {
    const result = PlaybackSchema.safeParse({
      kind: "file",
      url: "https://cdn.ironforge.app/videos/abc.mp4?sig=xyz",
      expiresAt: "2026-08-24T12:00:00.000Z",
      thumbnailUrl: null,
    });
    expect(result.success).toBe(true);
  });

  it("aceita playback do tipo unavailable com motivo", () => {
    const result = PlaybackSchema.safeParse({
      kind: "unavailable",
      reason: "Vídeo em processamento",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita kind desconhecido", () => {
    const result = PlaybackSchema.safeParse({ kind: "gif", url: "x" });
    expect(result.success).toBe(false);
  });

  it("rejeita file sem url válida", () => {
    const result = PlaybackSchema.safeParse({
      kind: "file",
      url: "not-a-url",
      expiresAt: "2026-08-24T12:00:00.000Z",
      thumbnailUrl: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("ExerciseDemoSchema", () => {
  it("aplica defaults de isPrimary, coachNote e ownedByCoach e aceita coach null (catálogo)", () => {
    const parsed = ExerciseDemoSchema.parse({
      exerciseId: "exercise-1",
      videoId: "video-1",
      title: "Agachamento livre",
      source: "youtube",
      performerGender: "all",
      coach: null,
      playback: { kind: "unavailable", reason: "sem vídeo" },
    });
    expect(parsed.isPrimary).toBe(false);
    expect(parsed.ownedByCoach).toBe(false);
    expect(parsed.coachNote).toBeNull();
    expect(parsed.coach).toBeNull();
  });

  it("aceita o objeto coach quando o demo é do personal do aluno", () => {
    const parsed = ExerciseDemoSchema.parse({
      exerciseId: "exercise-1",
      videoId: "video-2",
      title: "Agachamento livre",
      source: "upload",
      performerGender: "all",
      ownedByCoach: true,
      coachNote: "Cotovelo a 45 graus",
      coach: { id: "coach-1", name: "João Personal", avatarUrl: null },
      playback: { kind: "unavailable", reason: "processando" },
    });
    expect(parsed.coach).toEqual({ id: "coach-1", name: "João Personal", avatarUrl: null });
  });
});
