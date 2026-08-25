import Constants from "expo-constants";
import { Platform } from "react-native";
import { getApiAuthToken } from "./auth-token";
import { resolveApiBaseUrl } from "./resolve-base-url";

// Em dev o Expo expõe o host que serve o bundle (hostUri) — é o mesmo endereço
// que alcança a API tanto no emulador quanto num celular físico na mesma rede,
// então não depende de configurar EXPO_PUBLIC_API_URL na mão em cada ambiente.
const API_BASE_URL = resolveApiBaseUrl({
  envUrl: process.env.EXPO_PUBLIC_API_URL,
  hostUri: Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost ?? null,
  platformOS: Platform.OS,
});

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string | null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

/**
 * Registrado pelo store de auth na inicialização (evita client.ts → store,
 * que criaria import circular já que o store importa deste módulo).
 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getApiAuthToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    signal: options.signal,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    if (response.status === 401) unauthorizedHandler?.();
    // A API responde { error: { code, message, details } }; versões antigas usavam o topo.
    const payload = (await response.json().catch(() => null)) as {
      error?: { code?: string; message?: string };
      code?: string;
      message?: string;
    } | null;
    const failure = payload?.error ?? payload ?? undefined;
    throw new ApiError(
      failure?.message ?? `Erro ao chamar ${path}`,
      response.status,
      failure?.code ?? null,
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export { API_BASE_URL };
