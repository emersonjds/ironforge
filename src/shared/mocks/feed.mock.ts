/** Feed social (Reels) — posts de treino de outros alunos. */

export interface FeedPost {
  id: string;
  authorName: string;
  authorAvatar: string | null;
  timeAgo: string;
  type: "photo" | "video";
  mediaUrl: string;
  caption: string;
  workoutTag: string;
  likes: number;
  liked: boolean;
  comments: number;
}

export const mockFeed: FeedPost[] = [
  {
    id: "fp-1",
    authorName: "Marina Costa",
    authorAvatar:
      "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=120&h=120&fit=crop",
    timeAgo: "há 35 min",
    type: "photo",
    mediaUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=70&fit=crop",
    caption: "PR no agachamento hoje! 💪 120kg que pareciam impossíveis mês passado.",
    workoutTag: "Legs Day",
    likes: 42,
    liked: false,
    comments: 6,
  },
  {
    id: "fp-2",
    authorName: "Bruno Almeida",
    authorAvatar: null,
    timeAgo: "há 2h",
    type: "video",
    mediaUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=70&fit=crop",
    caption: "Execução do terra, foco na coluna neutra. Feedback bem-vindo!",
    workoutTag: "Costas & Posterior",
    likes: 28,
    liked: true,
    comments: 11,
  },
  {
    id: "fp-3",
    authorName: "Carla Mendes",
    authorAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
    timeAgo: "há 5h",
    type: "photo",
    mediaUrl:
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=70&fit=crop",
    caption: "Semana fechada com 5 treinos! Consistência > intensidade.",
    workoutTag: "Full Body",
    likes: 67,
    liked: false,
    comments: 9,
  },
  {
    id: "fp-4",
    authorName: "Diego Ramos",
    authorAvatar:
      "https://images.unsplash.com/photo-1583468982228-19f19164aee2?w=120&h=120&fit=crop",
    timeAgo: "ontem",
    type: "video",
    mediaUrl:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=70&fit=crop",
    caption: "Supino inclinado, 3ª série pegando pesado. Bora pra cima! 🔥",
    workoutTag: "Push Day",
    likes: 51,
    liked: false,
    comments: 4,
  },
];
