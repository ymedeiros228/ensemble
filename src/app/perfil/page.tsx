"use client";

import { useMemo, useRef, useState } from "react";
import {
  Award, Brain, Briefcase, Check, Flame, GraduationCap, Heart, Lightbulb, MapPin, Minus, Pencil, Plus, Shuffle, Star, Target, Trash2, User, X,
} from "lucide-react";
import { Button, Card, Checkbox, Chip, Field, Modal, ProgressBar, SectionTitle, cx } from "@/components/ui";
import { Mascot } from "@/components/Mascot";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/ui-store";
import { computeAchievements, computeStreak, levelInfo } from "@/lib/gamification";
import { addDays, todayISO } from "@/lib/dates";
import { SPECIES, type Profile, type Skill, type Species } from "@/lib/types";

const GROUPS: { id: Skill["group"]; icon: typeof Brain; tone: string }[] = [
  { id: "Acadêmicas", icon: GraduationCap, tone: "blue" },
  { id: "Linguagens e Comunicação", icon: Pencil, tone: "purple" },
  { id: "Pessoais", icon: User, tone: "pink" },
  { id: "Extras", icon: Star, tone: "yellow" },
];

/** Reduz a foto para 256px e devolve como data URL (cabe no localStorage). */
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler a imagem"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Imagem inválida"));
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Sem suporte a canvas"));
        const side = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function PerfilPage() {
  const profile = useStore((s) => s.profile);
  const stats = useStore((s) => s.stats);
  const skills = useStore((s) => s.skills);
  const experience = useStore((s) => s.experience);
  const goals = useStore((s) => s.personalGoals);
  const data = useStore();
  const update = useStore((s) => s.updateProfile);
  const setLevel = useStore((s) => s.setSkillLevel);
  const addSkill = useStore((s) => s.addSkill);
  const removeSkill = useStore((s) => s.removeSkill);
  const addExp = useStore((s) => s.addExperience);
  const removeExp = useStore((s) => s.removeExperience);
  const addGoal = useStore((s) => s.addPersonalGoal);
  const toggleGoal = useStore((s) => s.togglePersonalGoal);
  const removeGoal = useStore((s) => s.removePersonalGoal);

  const [editing, setEditing] = useState(false);
  const [achOpen, setAchOpen] = useState(false);
  const [skillEdit, setSkillEdit] = useState(false);
  const [expOpen, setExpOpen] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newSkill, setNewSkill] = useState<{ group: Skill["group"]; name: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const lv = levelInfo(stats.xp);
  const streak = computeStreak(stats.activityDates);
  const achievements = useMemo(() => computeAchievements(data), [data]);
  const unlocked = achievements.filter((a) => a.unlocked).length;
  const today = todayISO();
  const dots = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13));

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      update({ avatar: await resizeImage(f) });
      toast("Foto atualizada 📸");
    } catch {
      toast("Não foi possível usar essa imagem");
    }
    e.target.value = "";
  };

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-4 pt-2">
      {/* Cabeçalho do perfil */}
      <Card className="lg:col-span-2 !p-5">
        <div className="flex flex-wrap items-center gap-5">
          <div className="relative">
            <span className="grid h-32 w-32 place-items-center overflow-hidden rounded-full bg-brandsoft text-brand ring-4 ring-solid shadow-lg">
              {profile.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar} alt="Sua foto de perfil" className="h-full w-full object-cover" />
              ) : <User size={64} aria-hidden />}
            </span>
            <button onClick={() => fileRef.current?.click()} aria-label="Trocar foto" className="absolute bottom-1 right-1 grid h-9 w-9 place-items-center rounded-full bg-brand text-white shadow-lg"><Pencil size={16} /></button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} aria-label="Escolher foto de perfil" />
          </div>
          <div className="flex-1 min-w-[220px]">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-ink">{profile.name}</h1>
            <p className="text-muted mt-1 flex items-center gap-2">{profile.age} anos <span aria-hidden>•</span> <MapPin size={14} aria-hidden /> {profile.city}</p>
            <p className="text-xl text-ink mt-2 italic">“{profile.quote}” <Heart size={16} className="inline text-brand fill-brand" aria-hidden /></p>
          </div>
          <Button variant="ghost" className="!bg-solid self-start" onClick={() => setEditing(true)}><Pencil size={16} aria-hidden /> Editar perfil</Button>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-5">
          <div className="rounded-2xl border border-line bg-solid p-4 flex items-center gap-3">
            <span className="tone-blue grid h-12 w-12 place-items-center rounded-2xl"><Star aria-hidden /></span>
            <div className="flex-1">
              <div className="text-sm font-bold text-ink">Nível</div><div className="text-2xl font-extrabold text-ink leading-6">{lv.level}</div>
              <ProgressBar value={lv.pct} label={`Nível ${lv.level}, ${lv.current} de ${lv.max} XP`} /><div className="text-xs text-muted mt-1">{lv.current} / {lv.max} XP</div>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-solid p-4">
            <div className="flex items-center gap-3">
              <span className="tone-orange grid h-12 w-12 place-items-center rounded-2xl"><Flame aria-hidden /></span>
              <div><div className="text-sm font-bold text-ink">Sequência de estudos</div><div className="text-2xl font-extrabold text-ink leading-6">{streak} {streak === 1 ? "dia" : "dias"}</div></div>
            </div>
            <div className="flex gap-1.5 mt-3" aria-label="Últimos 14 dias">
              {dots.map((d) => <span key={d} title={d} className={cx("h-2.5 flex-1 rounded-full", stats.activityDates.includes(d) ? "fill-blue" : "bg-brandsoft")} />)}
            </div>
          </div>
          <button onClick={() => setAchOpen(true)} className="rounded-2xl border border-line bg-solid p-4 flex items-center gap-3 text-left hover:border-brand2">
            <span className="tone-purple grid h-12 w-12 place-items-center rounded-2xl"><Award aria-hidden /></span>
            <div className="flex-1"><div className="text-sm font-bold text-ink">Conquistas</div><div className="text-2xl font-extrabold text-ink leading-6">{unlocked} <span className="text-sm text-muted font-semibold">de {achievements.length}</span></div></div>
          </button>
        </div>
      </Card>

      {/* Coluna principal */}
      <div className="space-y-4">
        <Card>
          <SectionTitle icon={User} title="Sobre mim" />
          <p className="text-body leading-relaxed">{profile.about}</p>
          <div className="flex flex-wrap gap-2 mt-3">{profile.tags.map((t) => <Chip key={t} tone="blue" className="!px-3 !py-1">{t}</Chip>)}</div>
        </Card>

        <Card id="habilidades">
          <SectionTitle icon={Brain} title="Habilidades" action={skillEdit ? "Concluir" : "Editar"} onAction={() => setSkillEdit((v) => !v)} />
          <p className="text-sm text-muted -mt-2 mb-3">Minhas principais áreas de conhecimento e competências.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {GROUPS.map((g) => (
              <div key={g.id} className="rounded-2xl border border-line bg-solid/60 p-3">
                <h3 className="font-extrabold text-ink flex items-center gap-2 mb-2"><g.icon size={18} className="text-brand" aria-hidden /> {g.id}</h3>
                <ul className="space-y-2.5">
                  {skills.filter((s) => s.group === g.id).map((s) => (
                    <li key={s.id}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-ink">{s.name}</span>
                        <span className="flex items-center gap-1 text-xs text-muted">
                          {skillEdit && <>
                            <button onClick={() => setLevel(s.id, s.level - 1)} aria-label={`Diminuir ${s.name}`} className="grid h-5 w-5 place-items-center rounded bg-brandsoft text-brand"><Minus size={12} /></button>
                            <button onClick={() => setLevel(s.id, s.level + 1)} aria-label={`Aumentar ${s.name}`} className="grid h-5 w-5 place-items-center rounded bg-brandsoft text-brand"><Plus size={12} /></button>
                            <button onClick={() => removeSkill(s.id)} aria-label={`Remover ${s.name}`} className="grid h-5 w-5 place-items-center rounded text-danger"><Trash2 size={12} /></button>
                          </>}
                          Nível {s.level}
                        </span>
                      </div>
                      <ProgressBar value={s.level * 20} tone={g.tone} label={`${s.name}: nível ${s.level} de 5`} />
                    </li>
                  ))}
                </ul>
                {skillEdit && (
                  newSkill?.group === g.id ? (
                    <form className="flex gap-2 mt-3" onSubmit={(e) => { e.preventDefault(); if (newSkill.name.trim()) { addSkill(g.id, newSkill.name.trim()); setNewSkill(null); } }}>
                      <input autoFocus value={newSkill.name} onChange={(e) => setNewSkill({ group: g.id, name: e.target.value })} placeholder="Nova habilidade" aria-label="Nome da habilidade" />
                      <Button type="submit"><Check size={16} aria-hidden /></Button>
                    </form>
                  ) : <button onClick={() => setNewSkill({ group: g.id, name: "" })} className="mt-3 text-sm font-bold text-brand inline-flex items-center gap-1"><Plus size={14} aria-hidden /> Adicionar</button>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Lightbulb} title="Projetos e interesses" />
          <div className="flex flex-wrap gap-2 items-center">
            {profile.projects.map((p) => (
              <span key={p} className="inline-flex items-center gap-1 rounded-full bg-brandsoft text-brand px-3 py-1 text-sm font-bold">
                {p}<button onClick={() => update({ projects: profile.projects.filter((x) => x !== p) })} aria-label={`Remover ${p}`}><X size={13} /></button>
              </span>
            ))}
            <form className="flex gap-1" onSubmit={(e) => { e.preventDefault(); const t = newTag.trim(); if (t && !profile.projects.includes(t)) update({ projects: [...profile.projects, t] }); setNewTag(""); }}>
              <input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="+ interesse" aria-label="Novo interesse" className="!w-32 !py-1.5 !rounded-full !text-sm" />
            </form>
          </div>
        </Card>
      </div>

      {/* Coluna lateral */}
      <div className="space-y-4">
        <Card>
          <SectionTitle icon={Briefcase} title="Informações gerais" />
          <dl className="space-y-3 text-sm">
            <div><dt className="text-muted">Idade</dt><dd className="font-bold text-ink">{profile.age} anos</dd></div>
            <div><dt className="text-muted">Localização</dt><dd className="font-bold text-ink">{profile.city}</dd></div>
            <div><dt className="text-muted">Estado civil</dt><dd className="font-bold text-ink">{profile.civil}</dd></div>
            <div><dt className="text-muted">Interesses</dt><dd className="font-bold text-ink">{profile.interests.join(", ")}</dd></div>
          </dl>
        </Card>

        <Card>
          <SectionTitle icon={Briefcase} title="Experiência" action="Adicionar" onAction={() => setExpOpen(true)} />
          <ul className="space-y-3">
            {experience.map((x) => (
              <li key={x.id} className="flex gap-2 items-start">
                <div className="flex-1"><div className="font-bold text-ink text-sm">{x.title}</div><div className="text-xs text-muted">{x.detail}</div></div>
                <button onClick={() => removeExp(x.id)} aria-label={`Remover ${x.title}`} className="text-muted hover:text-danger"><Trash2 size={14} /></button>
              </li>
            ))}
            {experience.length === 0 && <li className="text-sm text-muted">Adicione suas atividades e responsabilidades.</li>}
          </ul>
        </Card>

        <Card>
          <SectionTitle icon={GraduationCap} title="Educação" />
          <div className="font-bold text-ink">{profile.education.title}</div>
          <div className="text-sm text-muted">{profile.education.detail}</div>
          <Chip tone="blue" className="mt-2">+ Em andamento</Chip>
        </Card>

        <Card>
          <SectionTitle icon={Target} title="Metas" />
          <ul className="space-y-2">
            {goals.map((g) => (
              <li key={g.id} className="flex items-center gap-3">
                <Checkbox checked={g.done} onChange={() => { toggleGoal(g.id); if (!g.done) toast("Meta pessoal concluída! +20 XP 🏆"); }} label={g.title} />
                <span className={cx("flex-1 text-sm", g.done ? "line-through text-muted" : "text-ink")}>{g.title}</span>
                <button onClick={() => removeGoal(g.id)} aria-label={`Remover ${g.title}`} className="text-muted hover:text-danger"><Trash2 size={14} /></button>
              </li>
            ))}
          </ul>
          <form className="flex gap-2 mt-3" onSubmit={(e) => { e.preventDefault(); if (newGoal.trim()) { addGoal(newGoal.trim()); setNewGoal(""); } }}>
            <input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Nova meta pessoal" aria-label="Nova meta pessoal" />
            <Button type="submit" aria-label="Adicionar meta"><Plus size={16} aria-hidden /></Button>
          </form>
        </Card>

        <MascotCard species={profile.species} onChange={(sp) => { update({ species: sp }); toast(`Agora seu mascote é ${sp} 🤖`); }} />
      </div>

      {editing && <EditProfile profile={profile} onClose={() => setEditing(false)} onSave={(p) => { update(p); toast("Perfil atualizado ✓"); setEditing(false); }} />}
      <Modal open={achOpen} onClose={() => setAchOpen(false)} title={`Conquistas (${unlocked}/${achievements.length})`} wide>
        <ul className="grid sm:grid-cols-2 gap-3">
          {achievements.map((a) => (
            <li key={a.id} className={cx("rounded-2xl border p-3 flex items-center gap-3", a.unlocked ? "border-brand2 bg-brandsoft/60" : "border-line opacity-60")}>
              <span className={cx("grid h-12 w-12 place-items-center rounded-2xl text-2xl", a.unlocked ? "bg-solid" : "bg-surface2 grayscale")}>{a.emoji}</span>
              <div><div className="font-extrabold text-ink">{a.title}</div><div className="text-xs text-muted">{a.description}</div></div>
              {a.unlocked && <Check className="ml-auto text-[var(--green-fg)]" aria-label="Desbloqueada" />}
            </li>
          ))}
        </ul>
      </Modal>
      <ExpModal open={expOpen} onClose={() => setExpOpen(false)} onAdd={(t, d) => { addExp({ title: t, detail: d }); toast("Experiência adicionada"); setExpOpen(false); }} />
    </div>
  );
}

function MascotCard({ species, onChange }: { species: Species; onChange: (s: Species) => void }) {
  return (
    <Card className="flex flex-col items-center text-center">
      <Mascot species={species} size={150} />
      <div className="w-full mt-2">
        <label className="field" htmlFor="species">Espécie do robô</label>
        <select id="species" value={species} onChange={(e) => onChange(e.target.value as Species)}>{SPECIES.map((s) => <option key={s}>{s}</option>)}</select>
        <Button variant="soft" className="w-full mt-3" onClick={() => onChange(SPECIES[(SPECIES.indexOf(species) + 1) % SPECIES.length])}><Shuffle size={16} aria-hidden /> Trocar espécie</Button>
      </div>
    </Card>
  );
}

function ExpModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (t: string, d: string) => void }) {
  const [t, setT] = useState("");
  const [d, setD] = useState("");
  return (
    <Modal open={open} onClose={onClose} title="Nova experiência">
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (t.trim()) { onAdd(t.trim(), d.trim()); setT(""); setD(""); } }}>
        <Field label="Título"><input value={t} onChange={(e) => setT(e.target.value)} required placeholder="Ex.: Monitora de Matemática" /></Field>
        <Field label="Descrição"><textarea rows={2} value={d} onChange={(e) => setD(e.target.value)} /></Field>
        <Button type="submit" className="w-full">Adicionar</Button>
      </form>
    </Modal>
  );
}

function EditProfile({ profile, onClose, onSave }: { profile: Profile; onClose: () => void; onSave: (p: Partial<Profile>) => void }) {
  const [f, setF] = useState({
    name: profile.name, age: String(profile.age), city: profile.city, civil: profile.civil, quote: profile.quote, about: profile.about,
    tags: profile.tags.join(", "), interests: profile.interests.join(", "), eduTitle: profile.education.title, eduDetail: profile.education.detail,
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

  return (
    <Modal open onClose={onClose} title="Editar perfil" wide>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const age = Number(f.age);
          if (!f.name.trim() || !(age > 0 && age < 120)) { toast("Confira nome e idade"); return; }
          onSave({
            name: f.name.trim(), age, city: f.city.trim(), civil: f.civil.trim(), quote: f.quote.trim(), about: f.about.trim(),
            tags: list(f.tags), interests: list(f.interests), education: { title: f.eduTitle.trim(), detail: f.eduDetail.trim() },
          });
        }}
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Nome"><input value={f.name} onChange={set("name")} required /></Field>
          <Field label="Idade"><input type="number" min={5} max={110} value={f.age} onChange={set("age")} required /></Field>
          <Field label="Cidade"><input value={f.city} onChange={set("city")} /></Field>
          <Field label="Estado civil"><input value={f.civil} onChange={set("civil")} /></Field>
        </div>
        <Field label="Frase pessoal"><input value={f.quote} onChange={set("quote")} /></Field>
        <Field label="Sobre mim"><textarea rows={4} value={f.about} onChange={set("about")} /></Field>
        <Field label="Etiquetas (separadas por vírgula)"><input value={f.tags} onChange={set("tags")} /></Field>
        <Field label="Interesses (separados por vírgula)"><input value={f.interests} onChange={set("interests")} /></Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Educação"><input value={f.eduTitle} onChange={set("eduTitle")} /></Field>
          <Field label="Situação"><input value={f.eduDetail} onChange={set("eduDetail")} /></Field>
        </div>
        <Button type="submit" className="w-full">Salvar perfil</Button>
      </form>
    </Modal>
  );
}
