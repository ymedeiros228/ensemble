# Documentação do Ensemble

Guia técnico e funcional do app. Para uma visão rápida e instruções de execução, veja o [README](../README.md).

## 1. Visão geral

O Ensemble ajuda estudantes a organizar estudos, agenda, finanças e bem-estar, com um perfil gamificado e um mascote (robô-pet) que incentiva o uso.

É uma **demo sem backend**: não há login, servidor nem banco de dados. Todo o estado fica no `localStorage` do navegador, na chave `ensemble-data-v1`.

## 2. Tecnologias

| Item | Uso |
|---|---|
| Next.js 16 (App Router) | Rotas e build |
| React 19 + TypeScript | Interface e tipagem |
| Tailwind CSS 4 | Estilos |
| Zustand + middleware `persist` | Estado global salvo no navegador |
| Framer Motion | Animações |
| Lucide React | Ícones |

> Esta versão do Next.js tem mudanças em relação às anteriores. Antes de alterar convenções do framework, consulte `node_modules/next/dist/docs/`.

## 3. Estrutura de pastas

```
src/
├─ app/                  uma pasta por módulo (cada uma com page.tsx)
│  ├─ page.tsx           Início
│  ├─ estudos/           Estudos
│  ├─ agenda/            Agenda
│  ├─ financeiro/        Financeiro
│  ├─ notas/             Notas
│  ├─ bem-estar/         Bem-estar
│  ├─ perfil/            Perfil
│  ├─ habilidades/       Habilidades
│  ├─ metas/             Metas
│  ├─ comunidade/        Comunidade
│  └─ configuracoes/     Configurações
├─ components/
│  ├─ AppShell.tsx       layout: menu lateral (desktop), barra inferior (mobile), busca, notificações
│  ├─ Mascot.tsx         mascote em SVG, por espécie
│  ├─ MoodModal.tsx      check-in de humor
│  ├─ ui.tsx, shared.tsx componentes reutilizáveis (Card, Button, Modal, ProgressBar...)
│  └─ study/             abas de Estudos (tarefas, resumos/fórmulas, questões/simulados, pomodoro)
└─ lib/
   ├─ store.ts           store Zustand: dados e ações
   ├─ types.ts           tipos de todo o domínio (AppData)
   ├─ seed.ts            dados de exemplo e estado vazio
   ├─ gamification.ts    XP, nível, streak e conquistas
   ├─ finance.ts         saldo, períodos, resumos e categorias
   ├─ dates.ts           utilitários de data e moeda (pt-BR)
   └─ ui-store.ts        estado só de interface (modal de humor, frase do mascote, toasts)
```

## 4. Módulos

- **Início**: saudação, mascote com frase motivacional (muda a cada acesso), card de humor, grade de 8 atalhos, agenda de hoje, resumo financeiro, tarefas pendentes e próximas provas.
- **Estudos**: abas Tarefas, Resumos, Fórmulas, Questões, Simulados e Pomodoro. Também tem card de progresso, atalhos rápidos, metas de estudo, cronograma semanal com checkbox, matérias com progresso e dicas.
- **Agenda**: calendário mensal com navegação e botão "Hoje", marcações por categoria, compromissos do dia, botão "+" para criar compromisso e lista de tarefas.
- **Financeiro**: conexão bancária **simulada**, saldo com opção de ocultar, resumo do mês (entradas, gastos, economizado), gráfico de gastos, categorias, transações, metas financeiras e relatórios.
- **Notas**: registro e acompanhamento de notas por matéria.
- **Bem-estar**: humor do dia, exercício de respiração e diário.
- **Perfil**: dados pessoais, nível/XP, sequência de estudos, conquistas, sobre mim, informações gerais, habilidades, experiência, educação, metas, interesses e troca da espécie do mascote.
- **Habilidades / Metas / Comunidade**: habilidades por categoria, metas pessoais e grupos e eventos de exemplo (entrar e sair).
- **Configurações**: tema claro/escuro, carregar dados de exemplo, apagar todos os dados.

## 5. Regras de domínio

Definidas em `src/lib/gamification.ts` e `src/lib/finance.ts`.

### XP e nível
Cada nível exige **500 XP**. Nível = `floor(xp / 500) + 1`.

| Ação | XP |
|---|---|
| Concluir tarefa | +10 |
| Concluir item do cronograma | +8 |
| Responder questão | +5 |
| Sessão Pomodoro | +15 |
| Registrar humor | +5 |
| Finalizar simulado | +30 |
| Concluir meta | +20 |

### Streak (sequência de estudos)
Conta os dias consecutivos com atividade. Se hoje ainda não teve atividade, a contagem parte de ontem, então a sequência não zera durante o dia.

### Conquistas
| Conquista | Regra |
|---|---|
| Primeiro passo | Concluir 1 tarefa |
| Mão na massa | Concluir 10 tarefas |
| Semana de fogo | 7 dias seguidos |
| Imparável | 14 dias seguidos |
| Foco total | 1 sessão Pomodoro |
| Mestre do foco | 10 sessões Pomodoro |
| Praticante | Responder 10 questões |
| Pronta para a prova | Finalizar um simulado |
| Cuidando de mim | Registrar o humor |
| Autoconhecimento | Humor em 7 dias diferentes |
| Poupadora | Criar uma meta financeira |
| Organizada | Criar um resumo |
| Conectada | Entrar em um grupo |
| Nível 5 | Alcançar o nível 5 |

### Finanças
- **Saldo** = saldo inicial + soma das transações (receitas positivas, gastos negativos).
- **Resumo**: entradas, gastos e economizado (`max(0, entradas − gastos)`).
- **Categorias de gasto**: Alimentação, Transporte, Estudos, Lazer e Outros.
- **Períodos dos relatórios**: últimos 30 dias, este mês e mês passado.
- A **conexão bancária é simulada**: escolher um banco apenas marca como conectado e registra o horário da sincronização.

## 6. Dados e persistência

- Todo o estado está tipado em `AppData` (`src/lib/types.ts`) e é salvo automaticamente pelo `persist` do Zustand na chave `ensemble-data-v1`.
- Os dados iniciais vêm de `seed.ts` (`buildSeed`). O estado vazio vem de `buildEmpty`.
- Em **Configurações** é possível voltar aos dados de exemplo ou apagar tudo.
- Os dados ficam só no navegador de cada pessoa. Limpar os dados do site apaga tudo. Não há sincronização entre dispositivos.
- Se o formato dos dados mudar de forma incompatível, aumente a versão da chave (`ensemble-data-v2`), para não quebrar quem já tem dados salvos.

## 7. Como evoluir

### Adicionar um módulo
1. Crie `src/app/<modulo>/page.tsx`.
2. Adicione os tipos em `types.ts`, o estado e as ações em `store.ts` e os dados de exemplo em `seed.ts`.
3. Inclua a rota no menu em `AppShell.tsx`.

### Trocar o `localStorage` por um backend (ex.: Supabase)
Toda leitura e escrita de dados passa por `src/lib/store.ts`. Para ter login e banco de dados:
1. Crie as tabelas equivalentes aos tipos de `AppData`.
2. Troque o `persist` por chamadas à API, mantendo as mesmas ações do store. As páginas não precisam mudar.
3. Adicione autenticação e políticas de acesso por usuário (RLS).

## 8. Desenvolvimento e deploy

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint     # ESLint
npm run build    # build de produção (também checa tipos)
```

O deploy de produção é feito na Vercel:

```bash
npx vercel deploy --prod
```

Produção: https://ensemble-chi-one.vercel.app

## 9. Limitações conhecidas

- Sem login e sem sincronização entre dispositivos.
- Banco, saldo e transações bancárias são simulados (não há Open Finance).
- Sem notificações push. As notificações exibidas são geradas a partir dos dados locais.
- O mascote é um SVG simples, mais básico que a arte dos mockups. Pode ser substituído por imagens em `src/components/Mascot.tsx`.
