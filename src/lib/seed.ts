import { addDays, daysInMonth, parseISO, toISO, todayISO, uid } from "./dates";
import type { AppData, CalEvent, Category, Question, Skill, Transaction } from "./types";

const SUBJECTS = [
  { id: "mat", name: "Matemática", color: "blue", icon: "pi", progress: 45 },
  { id: "fis", name: "Física", color: "purple", icon: "atom", progress: 32 },
  { id: "qui", name: "Química", color: "pink", icon: "flask", progress: 28 },
  { id: "bio", name: "Biologia", color: "green", icon: "leaf", progress: 60 },
  { id: "his", name: "História", color: "yellow", icon: "landmark", progress: 50 },
  { id: "geo", name: "Geografia", color: "teal", icon: "globe", progress: 38 },
  { id: "por", name: "Português", color: "pink", icon: "book", progress: 65 },
];

function q(subjectId: string, statement: string, options: string[], answer: number): Question {
  return { id: uid(), subjectId, statement, options, answer };
}

function buildQuestions(): Question[] {
  return [
    q("mat", "Qual é o valor de x na equação 2x + 6 = 18?", ["4", "6", "8", "12"], 1),
    q("mat", "Qual é a raiz quadrada de 144?", ["10", "11", "12", "14"], 2),
    q("mat", "Em uma PA com a1 = 3 e razão 4, qual é o 5º termo?", ["15", "19", "23", "20"], 1),
    q("fis", "A unidade de força no Sistema Internacional é:", ["Joule", "Newton", "Watt", "Pascal"], 1),
    q("fis", "Pela Lei de Ohm, se V = 12 V e R = 4 Ω, qual é a corrente?", ["2 A", "3 A", "4 A", "48 A"], 1),
    q("qui", "Qual é o símbolo químico do sódio?", ["S", "So", "Na", "N"], 2),
    q("qui", "Quantos mols há em 36 g de água (H₂O, 18 g/mol)?", ["1 mol", "2 mols", "3 mols", "18 mols"], 1),
    q("bio", "Qual organela é responsável pela respiração celular?", ["Ribossomo", "Mitocôndria", "Lisossomo", "Golgi"], 1),
    q("bio", "O processo pelo qual as plantas produzem glicose usando luz é:", ["Fotossíntese", "Respiração", "Fermentação", "Osmose"], 0),
    q("his", "A Era Vargas teve início em:", ["1889", "1930", "1945", "1964"], 1),
    q("his", "A Proclamação da República no Brasil ocorreu em:", ["1822", "1888", "1889", "1930"], 2),
    q("geo", "Qual é o maior bioma brasileiro em extensão?", ["Cerrado", "Mata Atlântica", "Amazônia", "Caatinga"], 2),
    q("por", "Qual alternativa contém uma metáfora?", ["Ele é rápido como o vento", "Seu sorriso é um sol", "O vento sopra forte", "Choveu muito ontem"], 1),
    q("por", "Assinale a frase com concordância correta:", ["Fazem dois anos que nos vimos", "Faz dois anos que nos vimos", "Haviam muitas pessoas", "Houveram problemas"], 1),
  ];
}

function buildEvents(today: string): CalEvent[] {
  const t = parseISO(today);
  const events: CalEvent[] = [];
  const add = (date: string, title: string, start: string, end: string, category: Category) =>
    events.push({ id: uid(), title, date, start, end, category });

  // Agenda de hoje
  add(today, "Aula de Matemática", "08:00", "09:00", "Estudos");
  add(today, "Estudar Física", "10:00", "11:00", "Estudos");
  add(today, "Estudar Matemática", "14:00", "15:30", "Estudos");
  add(today, "Trabalho de História", "16:00", "17:00", "Trabalho");
  add(today, "Revisar Química", "19:00", "20:00", "Estudos");

  // Padrão do mês: estudos seg/sex, trabalhos, prova e simulado
  const dim = daysInMonth(t.getFullYear(), t.getMonth());
  for (let d = 1; d <= dim; d++) {
    const date = toISO(new Date(t.getFullYear(), t.getMonth(), d));
    if (date === today) continue;
    const wd = new Date(t.getFullYear(), t.getMonth(), d).getDay();
    if (wd === 1 || wd === 5) add(date, "Sessão de estudos", "18:00", "19:30", "Estudos");
    if (d === 7 || d === 28) add(date, "Entrega de trabalho", "14:00", "15:00", "Trabalho");
    if (d === 14) add(date, "Prova de escola", "08:00", "10:00", "Prova da escola");
    if (d === 22) add(date, "Simulado ENEM", "09:00", "13:00", "Simulado");
  }
  return events;
}

function buildTransactions(today: string): Transaction[] {
  const tx: Transaction[] = [];
  const add = (daysAgo: number, title: string, note: string, amount: number, category: string) =>
    tx.push({ id: uid(), title, note, amount, category, date: addDays(today, -daysAgo) });

  // Hoje e ontem (para o mês corrente nunca ficar vazio)
  add(0, "Pix recebido", "Mãe", 150, "Receita");
  add(0, "Compra — alimentação", "Mercado", -86.4, "Alimentação");
  add(1, "Uber", "Corrida", -24.9, "Transporte");
  add(1, "Material escolar", "Papelaria", -62.3, "Estudos");

  // Últimos ~30 dias
  const rows: [number, string, string, number, string][] = [
    [3, "Lanche", "Cantina", -14.5, "Alimentação"],
    [4, "Ônibus", "Recarga cartão", -40, "Transporte"],
    [6, "Mesada", "Pai", 400, "Receita"],
    [7, "Cinema", "Com amigas", -38, "Lazer"],
    [8, "Almoço", "Restaurante", -32, "Alimentação"],
    [9, "Livro de redação", "Livraria", -58, "Estudos"],
    [11, "Uber", "Corrida", -21.7, "Transporte"],
    [12, "Pizza", "Delivery", -49.9, "Alimentação"],
    [14, "Assinatura de música", "Streaming", -21.9, "Lazer"],
    [15, "Aula particular", "Matemática", -70, "Estudos"],
    [16, "Mercado", "Compras do mês", -98, "Alimentação"],
    [18, "Ônibus", "Recarga cartão", -40, "Transporte"],
    [20, "Freela design", "Cartaz da escola", 280, "Receita"],
    [22, "Cafeteria", "Estudo em grupo", -24, "Alimentação"],
    [24, "Roupa", "Loja", -35, "Outros"],
    [26, "Uber", "Corrida", -26, "Transporte"],
    [28, "Presente", "Aniversário", -50, "Outros"],
    [29, "Material escolar", "Canetas e cadernos", -49.7, "Estudos"],
  ];
  rows.forEach((r) => add(...r));
  return tx;
}

function buildSkills(): Skill[] {
  const s = (group: Skill["group"], name: string, level: number): Skill => ({ id: uid(), group, name, level });
  return [
    s("Acadêmicas", "Matemática", 4), s("Acadêmicas", "Física", 4), s("Acadêmicas", "Química", 4),
    s("Acadêmicas", "Biologia", 4), s("Acadêmicas", "Português", 5), s("Acadêmicas", "Inglês", 3),
    s("Linguagens e Comunicação", "Interpretação de Texto", 5), s("Linguagens e Comunicação", "Redação", 4),
    s("Linguagens e Comunicação", "Literatura", 4),
    s("Pessoais", "Organização", 4), s("Pessoais", "Liderança", 4), s("Pessoais", "Trabalho em equipe", 5),
    s("Pessoais", "Resolução de problemas", 4), s("Pessoais", "Criatividade", 5), s("Pessoais", "Adaptabilidade", 5),
    s("Extras", "Informática", 3), s("Extras", "Edição de vídeo", 2), s("Extras", "Desenho / Artes", 3), s("Extras", "Música", 4),
  ];
}

export function buildSeed(): AppData {
  const today = todayISO();
  const tx = buildTransactions(today);
  const sum = tx.reduce((a, t) => a + t.amount, 0);

  const activityDates: string[] = [];
  for (let i = 0; i < 13; i++) activityDates.push(addDays(today, -i));

  const weekly = [1, 2, 3, 4, 5, 6].flatMap((wd) => [
    { id: uid(), weekday: wd, start: "14:00", end: "15:30", subjectId: "mat", title: "Lista de exercícios – funções", doneOn: [] as string[] },
    { id: uid(), weekday: wd, start: "16:00", end: "17:30", subjectId: "fis", title: "Teoria + exercícios – Lei de Ohm", doneOn: [] as string[] },
    { id: uid(), weekday: wd, start: "19:00", end: "20:00", subjectId: "his", title: "Resumo – Era Vargas", doneOn: [] as string[] },
    { id: uid(), weekday: wd, start: "20:30", end: "22:00", subjectId: "qui", title: "Exercícios – estequiometria", doneOn: [] as string[] },
  ]);

  return {
    tasks: [
      { id: uid(), title: "Finalizar trabalho de História", category: "Trabalho", due: today, done: false },
      { id: uid(), title: "Estudar Física (capítulo 3)", category: "Estudos", due: addDays(today, 1), done: false },
      { id: uid(), title: "Entregar atividade de Biologia", category: "Escola", due: addDays(today, 3), done: false },
      { id: uid(), title: "Revisar para o simulado", category: "Estudos", due: addDays(today, 4), done: false },
      { id: uid(), title: "Resolver 5 questões de Física", category: "Estudos", due: addDays(today, 1), done: false },
      { id: uid(), title: "Finalizar resumo de História", category: "Estudos", due: today, done: false },
    ],
    events: buildEvents(today),
    subjects: SUBJECTS,
    studyGoals: [
      { id: uid(), title: "ENEM", color: "pink", targetDate: addDays(today, 122), progress: 28 },
      { id: uid(), title: "Simulados", color: "blue", targetDate: addDays(today, 5), progress: 60, note: "Próximo simulado" },
      { id: uid(), title: "Provas da escola", color: "green", targetDate: addDays(today, 12), progress: 45, note: "Próxima prova" },
      { id: uid(), title: "Revisão geral", color: "purple", targetDate: addDays(today, 25), progress: 20, note: "Meta: concluir até" },
    ],
    exams: [
      { id: uid(), subject: "Matemática", date: addDays(today, 3), notes: "Funções e geometria plana" },
      { id: uid(), subject: "Física", date: addDays(today, 6), notes: "Leis de Newton e Ohm" },
      { id: uid(), subject: "Química", date: addDays(today, 13), notes: "Estequiometria" },
      { id: uid(), subject: "História", date: addDays(today, 18), notes: "Era Vargas" },
    ],
    summaries: [
      { id: uid(), subjectId: "his", title: "Era Vargas (1930–1945)", body: "Governo Provisório (1930–34), Governo Constitucional (1934–37) e Estado Novo (1937–45).\n\nPontos-chave: CLT, centralização do poder, propaganda do DIP, industrialização (CSN).", updatedAt: today },
      { id: uid(), subjectId: "fis", title: "Leis de Newton", body: "1ª Lei (inércia): sem força resultante, o corpo mantém seu estado.\n2ª Lei: F = m · a.\n3ª Lei: ação e reação têm mesma intensidade e sentidos opostos.", updatedAt: today },
    ],
    formulas: [
      { id: uid(), subjectId: "mat", title: "Bhaskara", expr: "x = (−b ± √(b² − 4ac)) / 2a" },
      { id: uid(), subjectId: "fis", title: "Lei de Ohm", expr: "V = R · i" },
      { id: uid(), subjectId: "fis", title: "Velocidade média", expr: "v = Δs / Δt" },
      { id: uid(), subjectId: "qui", title: "Número de mols", expr: "n = m / M" },
      { id: uid(), subjectId: "mat", title: "Área do círculo", expr: "A = π · r²" },
    ],
    questions: buildQuestions(),
    simulados: [
      { id: uid(), title: "Simulado ENEM — Ciências da Natureza", date: addDays(today, 5), total: 5, questionIds: [] },
      { id: uid(), title: "Simulado de Matemática", date: addDays(today, -6), total: 3, score: 2, questionIds: [] },
    ],
    schedule: [
      { id: uid(), weekday: 0, start: "14:00", end: "15:30", subjectId: "mat", title: "Lista de exercícios – funções", doneOn: [] },
      ...weekly,
    ],
    transactions: tx,
    finGoals: [{ id: uid(), title: "Guardar para faculdade", saved: 2000, target: 10000 }],
    moods: [],
    journal: [],
    grades: [
      { id: uid(), subjectId: "mat", title: "Prova 1º bimestre", value: 8.5, max: 10, date: addDays(today, -40) },
      { id: uid(), subjectId: "fis", title: "Prova 1º bimestre", value: 7.0, max: 10, date: addDays(today, -38) },
      { id: uid(), subjectId: "qui", title: "Trabalho em grupo", value: 9.0, max: 10, date: addDays(today, -30) },
      { id: uid(), subjectId: "bio", title: "Prova 1º bimestre", value: 9.5, max: 10, date: addDays(today, -35) },
      { id: uid(), subjectId: "his", title: "Seminário", value: 8.0, max: 10, date: addDays(today, -22) },
      { id: uid(), subjectId: "por", title: "Redação", value: 8.8, max: 10, date: addDays(today, -15) },
      { id: uid(), subjectId: "geo", title: "Prova 1º bimestre", value: 6.5, max: 10, date: addDays(today, -33) },
    ],
    groups: [
      { id: uid(), name: "Rumo ao ENEM 2026", description: "Cronogramas, simulados e dicas para quem vai fazer o ENEM.", members: 128, joined: true, emoji: "🎯", posts: [{ id: uid(), author: "Camila", text: "Alguém quer montar um simulado em grupo no sábado?", date: addDays(today, -1) }] },
      { id: uid(), name: "Clube de Redação", description: "Troca de temas, correção entre colegas e repertório sociocultural.", members: 86, joined: false, emoji: "✍️", posts: [] },
      { id: uid(), name: "Mulheres na Tecnologia", description: "Conversas sobre carreira, programação e projetos.", members: 54, joined: false, emoji: "💻", posts: [] },
      { id: uid(), name: "Física sem medo", description: "Resolvendo exercícios juntos, do básico ao avançado.", members: 73, joined: false, emoji: "⚛️", posts: [] },
      { id: uid(), name: "Leitura & Literatura", description: "Clube do livro com as obras cobradas nos vestibulares.", members: 61, joined: false, emoji: "📚", posts: [] },
      { id: uid(), name: "Voluntariado Jovem", description: "Ações sociais e projetos de impacto na comunidade.", members: 39, joined: false, emoji: "🤝", posts: [] },
    ],
    commEvents: [
      { id: uid(), title: "Aulão de revisão — Matemática", date: addDays(today, 4), place: "Online", joined: false },
      { id: uid(), title: "Oficina de Redação", date: addDays(today, 8), place: "Online", joined: false },
      { id: uid(), title: "Feira de Profissões", date: addDays(today, 11), place: "UNINASSAU Teresina", joined: false },
      { id: uid(), title: "Hackathon InovaTech", date: addDays(today, 20), place: "UNINASSAU Teresina", joined: false },
    ],
    skills: buildSkills(),
    experience: [
      { id: uid(), title: "Estudante do Ensino Médio", detail: "(Atual) – 2º ano" },
      { id: uid(), title: "Projetos escolares", detail: "Participação em trabalhos em grupo e apresentações." },
      { id: uid(), title: "Líder de turma (em andamento)", detail: "Organização e comunicação com professores e colegas." },
      { id: uid(), title: "Voluntária", detail: "Apoio em eventos e ações sociais." },
    ],
    personalGoals: [
      { id: uid(), title: "Tirar mais de 900 no ENEM", done: false },
      { id: uid(), title: "Entrar em uma universidade federal", done: false },
      { id: uid(), title: "Construir independência financeira", done: false },
      { id: uid(), title: "Viajar o mundo", done: false },
      { id: uid(), title: "Ser a melhor versão de mim", done: false },
    ],
    connections: [],
    profile: {
      name: "Usuário",
      age: 16,
      city: "Teresina, PI",
      civil: "Solteira",
      quote: "Disciplina hoje, liberdade amanhã.",
      about: "Sou uma pessoa determinada, esforçada e sonhadora. Gosto de aprender, ler, ouvir música e viver novas experiências. Quero construir o futuro que eu sempre sonhei e fazer a diferença no mundo.",
      tags: ["Estudante", "Criativa", "Determinada", "Empática", "Sonhadora"],
      interests: ["Música", "livros", "arte", "esportes", "viagens", "tecnologia"],
      projects: ["Estudos", "Leitura", "Música", "Arte", "Viagens", "Tecnologia", "Esportes"],
      education: { title: "Ensino Médio", detail: "2º ano (atual)" },
      species: "Cão Robô",
    },
    settings: {
      theme: "claro",
      monthlyBudget: 800,
      openingBalance: Math.round((245 - sum) * 100) / 100,
      hideBalance: false,
      bank: { connected: true, name: "Banco Digital Estrela", lastSync: new Date().toISOString() },
      seenNotifs: [],
    },
    stats: {
      xp: 1820,
      activityDates,
      pomodoros: 0,
      focusMinutes: 0,
      questionsAnswered: 0,
      questionsCorrect: 0,
      moodStreakBest: 0,
    },
  };
}

/** Versão vazia (sem dados de exemplo), mantendo o perfil e as comunidades. */
export function buildEmpty(): AppData {
  const seed = buildSeed();
  return {
    ...seed,
    tasks: [],
    events: [],
    subjects: [],
    studyGoals: [],
    exams: [],
    summaries: [],
    formulas: [],
    questions: [],
    simulados: [],
    schedule: [],
    transactions: [],
    finGoals: [],
    moods: [],
    journal: [],
    grades: [],
    groups: seed.groups.map((g) => ({ ...g, joined: false, posts: [] })),
    experience: [],
    personalGoals: [],
    settings: { ...seed.settings, openingBalance: 0 },
    stats: { xp: 0, activityDates: [], pomodoros: 0, focusMinutes: 0, questionsAnswered: 0, questionsCorrect: 0, moodStreakBest: 0 },
  };
}
