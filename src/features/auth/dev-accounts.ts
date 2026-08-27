import type { UserRole } from "./store";

export interface DevAccount {
  id: string;
  label: string;
  hint: string;
  role: UserRole;
  email: string;
  password: string;
}

/**
 * Atalho de login para desenvolvimento: autentica de verdade na API com as
 * credenciais de uma conta semeada no backend. Só renderiza sob `__DEV__`.
 *
 * ponytail: contas mock que não existem no backend real foram removidas —
 * login agora é real (POST /auth/login), então um botão para usuário
 * inexistente só resultaria em "credenciais inválidas". Adicione aqui outras
 * contas conforme forem semeadas.
 */
const DEV_ACCOUNT_PASSWORD = process.env.EXPO_PUBLIC_DEV_ACCOUNT_PASSWORD;

export const DEV_ACCOUNTS: DevAccount[] = DEV_ACCOUNT_PASSWORD
  ? [
      {
        id: "athlete-demo",
        label: "Aluno demo",
        hint: "aluno@ironforge.test",
        role: "athlete",
        email: "aluno@ironforge.test",
        password: DEV_ACCOUNT_PASSWORD,
      },
      {
        id: "coach-demo",
        label: "Personal demo",
        hint: "personal@ironforge.test",
        role: "coach",
        email: "personal@ironforge.test",
        password: DEV_ACCOUNT_PASSWORD,
      },
    ]
  : [];
