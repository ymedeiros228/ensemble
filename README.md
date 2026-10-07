# Ensemble

Web app do projeto **Ensemble** (UNINASSAU / InovaTech): organização de estudos, agenda, finanças, bem-estar e perfil gamificado para estudantes.

É uma demo 100% funcional, sem login e sem servidor. Todos os dados ficam salvos no navegador (`localStorage`).

## Funcionalidades

- **Início**: resumo do dia, agenda, tarefas pendentes, finanças e próximas provas.
- **Estudos**: tarefas, resumos, fórmulas, questões, simulados, pomodoro, matérias, metas e cronograma.
- **Agenda**: compromissos e lembretes.
- **Financeiro**: receitas, gastos, metas e gráficos (conexão bancária simulada).
- **Notas**: acompanhamento de desempenho.
- **Bem-estar**: humor do dia, respiração guiada e diário.
- **Perfil**: XP, nível, streak, conquistas e troca de espécie do mascote.
- **Habilidades, Metas e Comunidade**: grupos e eventos de exemplo.
- **Configurações**: tema claro/escuro, dados de exemplo e reset.

## Regras de gamificação

- Concluir uma tarefa dá **+10 XP**; cada nível exige **500 XP**.
- O streak conta os dias consecutivos com atividade de estudo.
- As conquistas são desbloqueadas por regras (1ª tarefa, 7 dias de streak, 1ª meta etc.).

## Tecnologias

Next.js (App Router) · TypeScript · Tailwind CSS 4 · Zustand (persist) · Framer Motion · Lucide.

## Como rodar

```bash
npm install
npm run dev      # desenvolvimento em http://localhost:3000
npm run build    # build de produção
npm start        # serve o build
```

## Estrutura

```
src/app          páginas (uma pasta por módulo)
src/components   interface e componentes compartilhados
src/lib          store (Zustand), tipos, dados de exemplo, regras de domínio
```

A camada de dados fica isolada em `src/lib/store.ts`, o que facilita trocar o `localStorage` por um backend (ex.: Supabase) no futuro.

## Fora do escopo da demo

Login, servidor, banco de dados real, Open Finance real e notificações push.
