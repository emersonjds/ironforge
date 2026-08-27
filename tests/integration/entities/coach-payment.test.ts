import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "@shared/lib/api/client";
import { fetchCoachPayment } from "@entities/athlete/api";
import { server } from "../../msw/server";
import { resetAthleteHandlerState, setCoachPayment } from "../../msw/athlete-handlers";

beforeEach(() => {
  resetAthleteHandlerState();
});

describe("perfil: pagamento do personal configurado", () => {
  it("retorna chave pix, tipo, valor e observação do personal", async () => {
    setCoachPayment({
      coachDisplayName: "Coach Amanda",
      pixKey: "amanda@pix.com",
      pixKeyType: "email",
      monthlyPriceCents: 25000,
      paymentNotes: "Vencimento todo dia 5",
    });

    const payment = await fetchCoachPayment();

    expect(payment).toEqual({
      coachDisplayName: "Coach Amanda",
      pixKey: "amanda@pix.com",
      pixKeyType: "email",
      monthlyPriceCents: 25000,
      paymentNotes: "Vencimento todo dia 5",
    });
  });
});

describe("perfil: 404 é caso normal, não erro", () => {
  it("aluno sem personal ativo: fetchCoachPayment resolve null em vez de rejeitar", async () => {
    await expect(fetchCoachPayment()).resolves.toBeNull();
  });

  it("personal ativo mas sem pix configurado: 200 com campos nulos, não 404", async () => {
    setCoachPayment({
      coachDisplayName: "Coach Amanda",
      pixKey: null,
      pixKeyType: null,
      monthlyPriceCents: null,
      paymentNotes: null,
    });

    const payment = await fetchCoachPayment();

    expect(payment).not.toBeNull();
    expect(payment?.pixKey).toBeNull();
  });
});

describe("perfil: erro de rede real (não 404) continua sendo erro", () => {
  it("timeout/erro 500 rejeita para a tela mostrar estado de erro com repetição", async () => {
    server.use(
      http.get(`${API_BASE_URL}/athletes/me/coach-payment`, () =>
        HttpResponse.json({ error: { code: "INTERNAL", message: "boom" } }, { status: 500 }),
      ),
    );

    await expect(fetchCoachPayment()).rejects.toThrow();
  });
});
