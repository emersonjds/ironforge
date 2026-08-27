/**
 * Financeiro do professor (mock). Campos alinhados ao que um PSP BR (ex.: Asaas)
 * devolve, para não retrabalhar ao plugar o gateway: valores em centavos,
 * status/método/vencimento, bruto vs líquido. Nada processa pagamento — só exibe.
 */

export type ChargeStatus = "paid" | "pending" | "overdue";
export type ChargeMethod = "pix" | "credit_card" | "boleto";

export interface CoachBalance {
  availableCents: number; // disponível para saque
  pendingCents: number; // a receber (agenda de recebíveis)
  receivedThisMonthCents: number;
}

export interface StudentCharge {
  id: string;
  studentName: string;
  studentAvatar: string | null;
  amountCents: number;
  method: ChargeMethod;
  status: ChargeStatus;
  dueLabel: string; // ex.: "vence em 2 dias", "pago", "atrasado 3 dias"
  recurring: boolean;
}

export interface ReceivableBucket {
  label: string;
  amountCents: number;
}

export interface AnticipationOffer {
  eligibleCents: number;
  feeCents: number;
  netCents: number;
}

export const mockCoachBalance: CoachBalance = {
  availableCents: 124000,
  pendingCents: 238000,
  receivedThisMonthCents: 362000,
};

export const mockStudentCharges: StudentCharge[] = [
  {
    id: "ch-1",
    studentName: "Marina Costa",
    studentAvatar:
      "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=120&h=120&fit=crop",
    amountCents: 24900,
    method: "credit_card",
    status: "paid",
    dueLabel: "pago em 03/05",
    recurring: true,
  },
  {
    id: "ch-2",
    studentName: "Ricardo Silva",
    studentAvatar:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=120&h=120&fit=crop",
    amountCents: 19900,
    method: "pix",
    status: "pending",
    dueLabel: "vence em 2 dias",
    recurring: true,
  },
  {
    id: "ch-3",
    studentName: "Bruno Almeida",
    studentAvatar: null,
    amountCents: 19900,
    method: "boleto",
    status: "overdue",
    dueLabel: "atrasado 3 dias",
    recurring: true,
  },
  {
    id: "ch-4",
    studentName: "Carla Mendes",
    studentAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
    amountCents: 29900,
    method: "pix",
    status: "pending",
    dueLabel: "vence em 5 dias",
    recurring: true,
  },
];

// Provisionamento: o que entra e quando
export const mockReceivableSchedule: ReceivableBucket[] = [
  { label: "Esta semana", amountCents: 19900 },
  { label: "Próxima semana", amountCents: 49800 },
  { label: "Este mês", amountCents: 238000 },
];

export const mockAnticipationOffer: AnticipationOffer = {
  eligibleCents: 238000,
  feeCents: 7140, // ~3%
  netCents: 230860,
};

/** Formata centavos em BRL sem depender de Intl (Hermes-safe). */
export function formatBRL(cents: number): string {
  const fixed = (cents / 100).toFixed(2).replace(".", ",");
  const [intPart, dec] = fixed.split(",");
  // toFixed(2) sempre produz uma parte inteira antes da vírgula; o fallback é
  // defensivo e não é alcançável para nenhum number válido.
  /* istanbul ignore next */
  const grouped = (intPart ?? "0").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${grouped},${dec}`;
}
