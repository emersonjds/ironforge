/** Dados mockados do Dashboard (hidratação, suplementos, próximos treinos). */

export interface TodayHero {
  tag: string;
  name: string;
  focus: string;
  estimatedMin: number;
}

export const mockTodayHero: TodayHero = {
  tag: "Treino de Hoje",
  name: "Superior & Core A",
  focus: "Foco em hipertrofia e estabilidade.",
  estimatedMin: 55,
};

export interface Hydration {
  currentLiters: number;
  goalLiters: number;
}

export const mockHydration: Hydration = {
  currentLiters: 2.1,
  goalLiters: 3.5,
};

export interface Supplement {
  id: string;
  name: string;
  dose: string;
  taken: boolean;
}

export const mockSupplements: Supplement[] = [
  { id: "sup-creatina", name: "Creatina", dose: "5g", taken: true },
  { id: "sup-whey", name: "Whey Protein", dose: "30g", taken: false },
];

export interface UpcomingSession {
  id: string;
  dayAbbrev: string;
  name: string;
  description: string;
}

export const mockUpcomingSessions: UpcomingSession[] = [
  {
    id: "up-1",
    dayAbbrev: "SEX",
    name: "Inferiores & HIIT",
    description: "Agachamento, Leg Press + 15min Corrida",
  },
  {
    id: "up-2",
    dayAbbrev: "SAB",
    name: "Mobilidade & Core",
    description: "Yoga focado em quadril e pranchas",
  },
  {
    id: "up-3",
    dayAbbrev: "SEG",
    name: "Pull Day · Costas & Bíceps",
    description: "Remadas, Puxadas e Rosca Direta",
  },
];

export const mockReminder =
  "Anotar o RIR de cada série é o que transforma o app em coaching real. Sem isso, só resta força bruta.";
