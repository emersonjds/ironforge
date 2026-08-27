import { z } from "zod";
import { apiRequest } from "@shared/lib/api/client";

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  coachId: z.string().nullable(),
  athleteId: z.string().nullable(),
  createdAt: z.string(),
});
export type AuthUser = z.infer<typeof AuthUserSchema>;

const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: AuthUserSchema,
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export async function login(email: string, password: string): Promise<LoginResponse> {
  const raw = await apiRequest<unknown>("/auth/login", { method: "POST", body: { email, password } });
  return LoginResponseSchema.parse(raw);
}

export async function fetchMe(): Promise<AuthUser> {
  const raw = await apiRequest<unknown>("/auth/me");
  return AuthUserSchema.parse(raw);
}
