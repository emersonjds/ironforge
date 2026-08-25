import { resolveApiBaseUrl } from "@shared/lib/api/resolve-base-url";

describe("resolveApiBaseUrl", () => {
  it("usa EXPO_PUBLIC_API_URL quando definida, mesmo com hostUri disponível", () => {
    const url = resolveApiBaseUrl({
      envUrl: "https://api.example.com",
      hostUri: "192.168.0.10:8081",
      platformOS: "ios",
    });
    expect(url).toBe("https://api.example.com");
  });

  it("deriva da hostUri do Expo quando não há variável de ambiente", () => {
    const url = resolveApiBaseUrl({
      hostUri: "192.168.0.10:8081",
      platformOS: "ios",
    });
    expect(url).toBe("http://192.168.0.10:3333");
  });

  it("deriva da hostUri também no Android", () => {
    const url = resolveApiBaseUrl({
      hostUri: "192.168.0.10:8081",
      platformOS: "android",
    });
    expect(url).toBe("http://192.168.0.10:3333");
  });

  it("sem hostUri, cai em 10.0.2.2 no Android", () => {
    const url = resolveApiBaseUrl({ hostUri: null, platformOS: "android" });
    expect(url).toBe("http://10.0.2.2:3333");
  });

  it("sem hostUri, cai em localhost no iOS", () => {
    const url = resolveApiBaseUrl({ hostUri: null, platformOS: "ios" });
    expect(url).toBe("http://localhost:3333");
  });

  it("respeita uma porta customizada", () => {
    const url = resolveApiBaseUrl({ hostUri: null, platformOS: "ios", port: 4000 });
    expect(url).toBe("http://localhost:4000");
  });
});
