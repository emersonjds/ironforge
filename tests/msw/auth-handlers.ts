import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@shared/lib/api/client";
import type { AuthUser, LoginResponse } from "@features/auth/api";

function errorBody(code: string, message: string) {
  return { error: { code, message, details: {} } };
}

export const VALID_PASSWORD = "senha-correta-2026";

export const ATHLETE_ACCOUNT: LoginResponse = {
  accessToken: "test-athlete-access-token",
  refreshToken: "test-athlete-refresh-token",
  user: {
    id: "user-athlete-1",
    email: "aluno@ironforge.test",
    displayName: "Bruno Aluno",
    avatarUrl: null,
    coachId: null,
    athleteId: "athlete-1",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
};

export const COACH_ONLY_ACCOUNT: LoginResponse = {
  accessToken: "test-coach-access-token",
  refreshToken: "test-coach-refresh-token",
  user: {
    id: "user-coach-1",
    email: "personal@ironforge.test",
    displayName: "João Personal",
    avatarUrl: null,
    coachId: "coach-1",
    athleteId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
};

const ACCOUNTS_BY_EMAIL: Record<string, LoginResponse> = {
  [ATHLETE_ACCOUNT.user.email]: ATHLETE_ACCOUNT,
  [COACH_ONLY_ACCOUNT.user.email]: COACH_ONLY_ACCOUNT,
};

const ACCOUNTS_BY_TOKEN: Record<string, AuthUser> = {
  [ATHLETE_ACCOUNT.accessToken]: ATHLETE_ACCOUNT.user,
  [COACH_ONLY_ACCOUNT.accessToken]: COACH_ONLY_ACCOUNT.user,
};

export const authHandlers = [
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    const account = body.email ? ACCOUNTS_BY_EMAIL[body.email] : undefined;
    if (!account || body.password !== VALID_PASSWORD) {
      return HttpResponse.json(errorBody("INVALID_CREDENTIALS", "E-mail ou senha inválidos"), {
        status: 401,
      });
    }
    return HttpResponse.json(account, { status: 200 });
  }),

  http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      displayName?: string;
      profile?: "coach" | "athlete";
    };
    const isCoach = body.profile === "coach";
    const account: LoginResponse = {
      accessToken: "test-new-access-token",
      refreshToken: "test-new-refresh-token",
      user: {
        id: "user-new-1",
        email: body.email ?? "novo@ironforge.test",
        displayName: body.displayName ?? "Novo Usuário",
        avatarUrl: null,
        coachId: isCoach ? "coach-new-1" : null,
        athleteId: isCoach ? null : "athlete-new-1",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    };
    return HttpResponse.json(account, { status: 201 });
  }),

  http.get(`${API_BASE_URL}/auth/me`, ({ request }) => {
    const auth = request.headers.get("Authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    const user = token ? ACCOUNTS_BY_TOKEN[token] : undefined;
    if (!user) {
      return HttpResponse.json(errorBody("UNAUTHORIZED", "Sessão inválida"), { status: 401 });
    }
    return HttpResponse.json(user);
  }),
];
