import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  avatarUrl: z.string().url().nullable().default(null),
  createdAt: z.string().datetime(),
});
export type User = z.infer<typeof UserSchema>;
