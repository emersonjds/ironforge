const API_PORT = 3333;

interface ResolveApiBaseUrlInput {
  envUrl?: string;
  hostUri?: string | null;
  platformOS: string;
  port?: number;
}

export function resolveApiBaseUrl(input: ResolveApiBaseUrlInput): string {
  if (input.envUrl) return input.envUrl;

  const port = input.port ?? API_PORT;
  const host = input.hostUri?.split(":")[0];
  if (host) return `http://${host}:${port}`;

  return input.platformOS === "android" ? `http://10.0.2.2:${port}` : `http://localhost:${port}`;
}
