import { z } from "zod";

export const InviteTokenSchema = z.object({
  token: z.string(),
  coachId: z.string(),
  coachName: z.string(),
  coachAvatarUrl: z.string().nullable(),
  coachBio: z.string().nullable(),
  athleteEmail: z.string().email().nullable(),
  expiresAt: z.string().datetime(),
  acceptedAt: z.string().datetime().nullable().default(null),
  rejectedAt: z.string().datetime().nullable().default(null),
});
export type InviteToken = z.infer<typeof InviteTokenSchema>;
