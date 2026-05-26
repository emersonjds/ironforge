import type { InviteToken } from "../schema";

// Tabela estática de tokens válidos para dev/mock. Em prod o backend valida.
const TTL_48H = 48 * 60 * 60 * 1000;

const MOCK_TOKENS: Record<string, Omit<InviteToken, "expiresAt" | "acceptedAt" | "rejectedAt">> = {
  "invite-amanda-test": {
    token: "invite-amanda-test",
    coachId: "coach-amanda",
    coachName: "Prof. Amanda Costa",
    coachAvatarUrl: "https://i.pravatar.cc/150?img=47",
    coachBio: "Especialista em hipertrofia e força. CREF 012345-G/SP. +8 anos formando atletas.",
    athleteEmail: null,
  },
};

export function decodeMockInviteToken(token: string): InviteToken | null {
  const base = MOCK_TOKENS[token];
  if (!base) return null;
  return {
    ...base,
    expiresAt: new Date(Date.now() + TTL_48H).toISOString(),
    acceptedAt: null,
    rejectedAt: null,
  };
}
