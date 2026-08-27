## 📝 Descrição

### <Nome da entrega> - <branch>

<!--
Prosa, não bullet. O que passa a funcionar do ponto de vista de quem usa —
o personal, o aluno. Escreva como se estivesse contando para alguém que vai
abrir a tela agora. Cite o comportamento, não o arquivo.
-->

## 📖 Motivação e contexto

<!--
O que existia antes e por que estava errado. Seja concreto: "os quatro cards
mostravam `-` fixo", "o botão salvava e só fechava o modal".

Depois: o card que descreve o comportamento esperado (SPA-XX), as decisões de
contrato tomadas aqui, o que ficou como dívida para quando outra peça subir, e
o que foi apagado no caminho.
-->

Cards:

## 📦 Tipo de mudança

- [ ] Correção de bug (mudança que corrige um problema sem quebrar o que já existe)
- [ ] Nova funcionalidade (mudança que adiciona comportamento sem quebrar o que já existe)
- [ ] Mudança incompatível (correção ou funcionalidade que faz o comportamento atual parar de funcionar)
- [ ] Atualização de documentação

## 🔒 Segurança

<!--
Requisito número um do projeto. Responda, não marque no automático.
Se a entrega não toca nenhum destes pontos, escreva "não se aplica" e por quê.
-->

- [ ] Nenhum segredo, senha, chave ou token como literal — tudo por variável de ambiente, e a variável nova entrou no `.env.example`
- [ ] Rota nova deriva o escopo do JWT, nunca de id vindo da URL
- [ ] Tenant errado recebe **404, nunca 403** — com teste provando
- [ ] Schema de resposta não vaza `passwordHash`, `tokenHash`, `storageKey` cru nem id de outro tenant
- [ ] Nada de PII, token ou corpo com senha em log
- [ ] Entrada validada com Zod na borda, com limite de tamanho em texto livre e upload
- [ ] Tabela nova com política de RLS tem `FORCE ROW LEVEL SECURITY`
- [ ] Dado de saúde (medida, lesão, peso, foto de corpo) com URL assinada de TTL curto e bucket privado

## 🧪 Testes

```
$ npm run typecheck

$ npm run lint

$ npm test

```

<!-- Cole a saída real dos comandos acima, não um resumo. -->

| Arquivo | Cobre |
| --- | --- |
|  |  |

**Cobertura** (variação em relação à `developer`):

| Métrica | Cobertura | Coberto/Total | Variação |
| --- | --- | --- | --- |
| Statements |  |  |  |
| Branches |  |  |  |
| Functions |  |  |  |
| Lines |  |  |  |

## 📸 Evidências

<!--
Prova de que rodou, não de que compila.

Web: screenshot numerado de cada tela e estado relevante, incluindo erro e vazio.
API: saída de `curl` da requisição e da resposta, incluindo o caminho de erro.
Mobile: screenshot do simulador ou do device.

Se não foi possível gerar evidência de alguma ponta, diga aqui qual e por quê —
não deixe a seção vazia dando a entender que foi verificado.
-->

## ⚠️ Riscos e o que ficou de fora

<!--
O que esta entrega conscientemente não resolve, e o card que cobre. Migração,
quebra de contrato, passo manual no deploy, ou algo que exige atenção de quem
mergear.
-->
