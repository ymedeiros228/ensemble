"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Briefcase, Check, Sparkles, UserPlus, Users } from "lucide-react";
import { Button, Card, Chip, PageHeader, SectionTitle } from "@/components/ui";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/ui-store";

interface Student { id: string; name: string; course: string; skills: string[]; interests: string[] }

const STUDENTS: Student[] = [
  { id: "st-1", name: "Marina Souza", course: "Ciência da Computação", skills: ["Programação", "Lógica", "Inglês"], interests: ["Tecnologia", "Jogos", "Música"] },
  { id: "st-2", name: "Lucas Almeida", course: "Design", skills: ["Criatividade", "Comunicação", "Design"], interests: ["Arte", "Fotografia", "Cinema"] },
  { id: "st-3", name: "Beatriz Lima", course: "Medicina", skills: ["Biologia", "Química", "Organização"], interests: ["Saúde", "Leitura", "Voluntariado"] },
  { id: "st-4", name: "Rafael Costa", course: "Engenharia", skills: ["Matemática", "Física", "Liderança"], interests: ["Tecnologia", "Esportes", "Robótica"] },
  { id: "st-5", name: "Camila Rocha", course: "Letras", skills: ["Redação", "Inglês", "Comunicação"], interests: ["Leitura", "Música", "Viagens"] },
  { id: "st-6", name: "Pedro Nunes", course: "Administração", skills: ["Liderança", "Organização", "Finanças"], interests: ["Esportes", "Empreendedorismo", "Jogos"] },
];

const OPPORTUNITIES = [
  { title: "Monitoria de Matemática", detail: "Ajude calouros e ganhe horas complementares.", tone: "blue" },
  { title: "Estágio em Tecnologia", detail: "Vaga de estágio para estudantes a partir do 2º período.", tone: "green" },
  { title: "Projeto de Voluntariado", detail: "Aulas de reforço em escolas públicas aos sábados.", tone: "pink" },
  { title: "Hackathon InovaTech", detail: "Maratona de projetos em equipe. Inscrições abertas.", tone: "purple" },
];

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function HabilidadesPage() {
  const skills = useStore((s) => s.skills);
  const profile = useStore((s) => s.profile);
  const connections = useStore((s) => s.connections);
  const toggle = useStore((s) => s.toggleConnection);

  const mine = useMemo(() => new Set([...skills.map((s) => norm(s.name)), ...profile.interests.map(norm)]), [skills, profile.interests]);

  const ranked = useMemo(
    () => STUDENTS.map((st) => {
      const common = [...st.skills, ...st.interests].filter((x) => mine.has(norm(x)));
      return { st, common, score: Math.min(98, 55 + common.length * 15) };
    }).sort((a, b) => b.common.length - a.common.length),
    [mine],
  );

  return (
    <div>
      <PageHeader icon={Sparkles} title="Habilidades" subtitle="Conecte-se com quem combina com você." mood="feliz" quote="Cada habilidade abre uma porta!" />

      <Card className="mb-4">
        <SectionTitle icon={Sparkles} title="Suas habilidades" action="Editar no perfil" href="/perfil" />
        {skills.length === 0 ? (
          <p className="text-muted text-sm">Adicione habilidades no seu perfil para receber sugestões melhores.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => <Chip key={s.id} tone="blue">{s.name} · nível {s.level}</Chip>)}
          </div>
        )}
      </Card>

      <Card className="mb-4">
        <SectionTitle icon={Users} title="Estudantes sugeridos" />
        <ul className="grid md:grid-cols-2 gap-3">
          {ranked.map(({ st, common, score }) => {
            const connected = connections.includes(st.id);
            return (
              <li key={st.id} className="rounded-2xl bg-surface2 p-4 flex gap-3">
                <span className="grid place-items-center h-12 w-12 rounded-full bg-brand text-white font-extrabold shrink-0" aria-hidden>{st.name[0]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-extrabold text-ink truncate">{st.name}</h3>
                    <Chip tone={score >= 85 ? "green" : "yellow"}>{score}% compatível</Chip>
                  </div>
                  <p className="text-xs text-muted">{st.course}</p>
                  <p className="text-xs text-body mt-1">
                    {common.length > 0 ? `Em comum: ${common.join(", ")}` : `Habilidades: ${st.skills.join(", ")}`}
                  </p>
                  <Button variant={connected ? "ghost" : "soft"} className="mt-2 !py-1.5" onClick={() => { toggle(st.id); toast(connected ? "Conexão desfeita" : `Você se conectou com ${st.name.split(" ")[0]} 🤝`); }}>
                    {connected ? <><Check size={16} aria-hidden /> Conectada</> : <><UserPlus size={16} aria-hidden /> Conectar</>}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <SectionTitle icon={Briefcase} title="Oportunidades" />
        <ul className="grid sm:grid-cols-2 gap-3">
          {OPPORTUNITIES.map((o) => (
            <li key={o.title} className={`rounded-2xl p-4 tone-${o.tone}`}>
              <div className="font-extrabold">{o.title}</div>
              <p className="text-sm opacity-90">{o.detail}</p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted mt-3">Dados de demonstração. <Link href="/comunidade" className="text-brand font-bold hover:underline">Ver eventos da comunidade</Link></p>
      </Card>
    </div>
  );
}
