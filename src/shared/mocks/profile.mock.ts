/** Dados mockados do Perfil (stats, recorde pessoal). */

export interface ProfileStat {
  label: string;
  value: string;
  icon: string; // nome do ícone Ionicons
}

export const mockProfileStats: ProfileStat[] = [
  { label: "Treinos", value: "142", icon: "barbell-outline" },
  { label: "Recordes", value: "18", icon: "trophy-outline" },
  { label: "Média Semanal", value: "8.4h", icon: "time-outline" },
  { label: "Semanas Ativas", value: "12", icon: "flame-outline" },
];

export interface PersonalRecord {
  weightKg: number;
  exercise: string;
  reps: number;
}

export const mockPersonalRecord: PersonalRecord = {
  weightKg: 120,
  exercise: "Supino Reto",
  reps: 3,
};
