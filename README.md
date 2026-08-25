<div align="center">

<img src="./assets/icon.png" alt="IronForge" width="120" height="120" style="border-radius:24px" />

# 🏋️ IronForge

**A plataforma que conecta personal trainer e aluno — treino de verdade, no bolso.**

App mobile _dark-first_ (Expo / React Native) para o aluno, com prescrição de treino, registro de séries, histórico de cargas e detecção de PRs.

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/React_Native-0.81-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NativeWind-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="NativeWind" />
  <img src="https://img.shields.io/badge/Zustand-5-543A2E?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />
  <img src="https://img.shields.io/badge/TanStack_Query-5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="TanStack Query" />
  <img src="https://img.shields.io/badge/Zod-3-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/coverage-83.7%25-2EA043?style=flat-square&logo=jest&logoColor=white" alt="Coverage" />
  <img src="https://img.shields.io/badge/tests-53_passed-2EA043?style=flat-square&logo=jest&logoColor=white" alt="Tests" />
  <img src="https://img.shields.io/badge/npm-10-CB3837?style=flat-square&logo=npm&logoColor=white" alt="npm" />
  <img src="https://img.shields.io/badge/platform-iOS_|_Android_|_Web-555?style=flat-square&logo=apple&logoColor=white" alt="Platform" />
  <img src="https://img.shields.io/badge/license-Proprietary-555?style=flat-square" alt="License" />
</p>

</div>

---

## ✨ Destaques

- 🌑 **Dark-first** — interface desenhada no escuro desde o token, não adaptada depois.
- 🏗️ **Arquitetura FSD-lite** — fronteiras explícitas (`app → widgets → features → entities → shared`), com imports só "pra baixo" garantidos por lint.
- 🧮 **Lógica de treino testada** — e1RM, detecção de PR, progressão de carga e resolução da próxima sessão cobertas por testes unitários.
- ⚡ **Optimistic UI** com TanStack Query + Zustand.
- 🧾 **Schemas Zod** como fonte de verdade do modelo de dados.
- 📱 **Multiplataforma** — iOS, Android e Web a partir da mesma base (Expo Router).

---

## 🧱 Stack

| Camada | Tecnologia |
| --- | --- |
| **Runtime / SDK** | Expo `~54` · React Native `0.81` · React `19` |
| **Navegação** | Expo Router `6` (file-based) |
| **Estilo** | NativeWind `4` (Tailwind) · design tokens dark-first |
| **Estado** | Zustand `5` (cliente) · TanStack Query `5` (servidor) |
| **Formulários** | React Hook Form `7` + Zod `3` |
| **Animação / Gestos** | Reanimated `4` · Gesture Handler `2` |
| **Storage** | AsyncStorage |
| **Testes** | Jest `29` + `jest-expo` |
| **Qualidade** | TypeScript estrito · ESLint `9` (+ `eslint-plugin-boundaries`) · Prettier |
| **Gerenciador** | npm `10` |

---

## 🚀 Como rodar

### Pré-requisitos

- **Node.js** 20+
- **npm** 10 (vem com o Node)
- App **Expo Go** no celular, ou um simulador iOS / emulador Android

### Instalação

```bash
git clone git@github.com:emersonjds/ironforge.git
cd ironforge
npm install
```

### Subir o app

```bash
npm run start        # Metro + QR code (Expo Go)
npm run ios          # abre no simulador iOS
npm run android      # abre no emulador Android
npm run web          # roda no navegador
```

### Scripts disponíveis

| Comando | O que faz |
| --- | --- |
| `npm run start` | Inicia o Metro bundler (Expo) |
| `npm run ios` / `npm run android` / `npm run web` | Abre na plataforma alvo |
| `npm run test` | Roda a suíte de testes unitários |
| `npm run typecheck` | Checagem de tipos (`tsc --noEmit`) |
| `npm run lint` | ESLint em todo o projeto |

---

## 🧪 Testes & Cobertura

Lógica de domínio (cálculos de treino, progressão e regras de sessão) coberta por **53 testes** em **6 suítes**, todos passando.

```bash
npm test                 # roda os testes
npm test -- --coverage   # com relatório de cobertura
```

| Métrica | Cobertura | |
| --- | --- | --- |
| **Statements** | `83.70%` | 113 / 135 |
| **Branches** | `79.31%` | 69 / 87 |
| **Functions** | `91.89%` | 34 / 37 |
| **Lines** | `83.65%` | 87 / 104 |

> `✓ Test Suites: 6 passed` · `✓ Tests: 53 passed` · ⏱ ~1.7s

**O que está coberto:**

- `entities/session` → cálculo de **e1RM**, **detecção de PR**, estatísticas de sessão
- `entities/plan` → **resolução da próxima sessão** (15 casos de borda)
- `entities/load-history` → **progressão de carga**
- `entities/exercise` → catálogo de exercícios

---

## 📁 Estrutura (FSD-lite)

```
ironforge/
├── app/                  # rotas (Expo Router, file-based)
│   ├── (auth)/           # login / cadastro
│   ├── (onboarding)/     # setup inicial do aluno
│   ├── (app)/            # área logada do aluno
│   ├── (workout)/        # execução de treino
│   └── (coach)/          # área do personal
├── src/
│   ├── entities/         # regras e modelos de domínio (Zod)
│   ├── features/         # casos de uso / fluxos
│   ├── shared/           # ui, lib, theme, helpers
│   └── types/            # tipos globais
├── tests/unit/           # testes unitários (Jest)
└── docs/                 # visão de produto, specs e arquitetura
```

**Regra de dependência:** imports fluem só "pra baixo" — `app → widgets → features → entities → shared`. Nunca o contrário (validado por `eslint-plugin-boundaries`).

---

<div align="center">

**IronForge** — _forjando treino de verdade._ 🔩

</div>
