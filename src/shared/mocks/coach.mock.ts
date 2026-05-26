/** Treinador mockado (plataforma personal↔aluno). */

export interface Coach {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  online: boolean;
}

export const mockCoach: Coach = {
  id: "coach-amanda",
  name: "Coach Amanda",
  role: "Sua treinadora",
  avatarUrl:
    "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=160&h=160&fit=crop",
  online: true,
};
