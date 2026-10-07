# Ensemble — Design (web app)

## Objetivo
Web app responsivo do projeto "Ensemble" (UNINASSAU / InovaTech): organização de estudos, agenda, finanças, bem-estar e perfil gamificado para estudantes. Demo 100% funcional, sem login, dados salvos no navegador.

## Decisões aprovadas
- Next.js (App Router) + TypeScript + Tailwind + Zustand (persist em localStorage) + Framer Motion.
- Sem backend/login. Camada de dados isolada (store) para trocar por Supabase depois.
- Visual do mockup: azul-claro, cards arredondados, mascote robô-pet. Modo escuro opcional.
- Mobile: barra inferior com 5 abas. Desktop: menu lateral + busca no topo.
- Todos os módulos funcionais: Início, Estudos (tarefas, resumos, fórmulas, questões, simulados, pomodoro, matérias, metas, cronograma), Agenda, Financeiro (conexão bancária SIMULADA), Perfil (XP, nível, streak, conquistas, habilidades, metas, trocar espécie do mascote), Notas, Bem-estar (humor, respiração, diário), Comunidade (grupos/eventos de exemplo, entrar/sair), Configurações (resetar dados, tema).
- Dados iniciais de exemplo vindos dos mockups; botão para limpar.

## Regras de domínio
- Concluir tarefa = +10 XP; 500 XP por nível; streak = dias consecutivos com atividade de estudo.
- Saldo = entradas − gastos; gráfico e categorias derivados das transações.
- Conquistas desbloqueiam por regras (ex.: 1ª tarefa, 7 dias de streak, 1ª meta).

## Fora do escopo
Login, servidor, banco real, Open Finance real, push notifications.
