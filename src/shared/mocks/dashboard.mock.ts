/** Dados mockados do Dashboard (hidratação, suplementos, lembrete) — ainda sem endpoint na API. */

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

export const mockReminder =
  "Depois de cada série, anote quantas repetições ainda sobravam no tanque. Essa “reserva” é o que mostra sua real evolução — não só o esforço do dia.";
