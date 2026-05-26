/** Notificações mockadas — avisos do personal sobre mudanças de treino, etc. */

export type NotificationType =
  | "plan_change"
  | "workout_change"
  | "message"
  | "achievement";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timeAgo: string;
  read: boolean;
}

export const mockNotifications: AppNotification[] = [
  {
    id: "n1",
    type: "plan_change",
    title: "Treino atualizado",
    body: "Coach Amanda ajustou seu treino de Pernas: +1 série no Agachamento e troca do Leg Press por Hack.",
    timeAgo: "há 2h",
    read: false,
  },
  {
    id: "n2",
    type: "workout_change",
    title: "Tipo de treino alterado",
    body: "Seu treino de quinta mudou de Push para Upper & Core, foco em estabilidade.",
    timeAgo: "ontem",
    read: false,
  },
  {
    id: "n3",
    type: "message",
    title: "Mensagem da treinadora",
    body: "Bom trabalho na semana! Capricha na execução do supino, sem pressa na descida.",
    timeAgo: "2 dias",
    read: true,
  },
  {
    id: "n4",
    type: "achievement",
    title: "Novo recorde",
    body: "Você bateu um PR no Supino Reto: 120 kg × 3. Mandou bem!",
    timeAgo: "3 dias",
    read: true,
  },
];
