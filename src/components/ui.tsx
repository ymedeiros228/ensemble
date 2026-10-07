"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, type ReactNode } from "react";
import {
  ArrowRight, Atom, BookOpen, Check, ChevronLeft, FlaskConical, Globe, Landmark, Leaf, Pi, Plus, X,
  type LucideIcon,
} from "lucide-react";
import { Mascot, type MascotMood } from "./Mascot";
import { useStore } from "@/lib/store";

export type Tone = "blue" | "purple" | "pink" | "green" | "yellow" | "teal" | "orange";
export const TONES: Tone[] = ["blue", "purple", "pink", "green", "yellow", "teal", "orange"];

export const SUBJECT_ICONS: Record<string, LucideIcon> = {
  pi: Pi, atom: Atom, flask: FlaskConical, leaf: Leaf, landmark: Landmark, globe: Globe, book: BookOpen,
};

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function Card({ children, className = "", as: As = "section", ...rest }: { children: ReactNode; className?: string; as?: "section" | "div" | "article" } & React.HTMLAttributes<HTMLElement>) {
  return (
    <As className={cx("card p-4 sm:p-5", className)} {...rest}>
      {children}
    </As>
  );
}

export function IconBadge({ icon: Icon, tone = "blue", size = 44 }: { icon: LucideIcon; tone?: Tone | string; size?: number }) {
  return (
    <span className={cx("grid place-items-center rounded-2xl shrink-0", `tone-${tone}`)} style={{ width: size, height: size }}>
      <Icon size={size * 0.5} strokeWidth={2} aria-hidden />
    </span>
  );
}

export function SectionTitle({ icon: Icon, title, href, action, onAction }: { icon?: LucideIcon; title: string; href?: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-3">
      <h2 className="flex items-center gap-2 text-ink font-extrabold text-lg">
        {Icon && <Icon size={22} className="text-brand" aria-hidden />}
        {title}
      </h2>
      {action && href && (
        <Link href={href} className="text-brand text-sm font-bold inline-flex items-center gap-1 hover:underline">
          {action} <ArrowRight size={14} aria-hidden />
        </Link>
      )}
      {action && !href && onAction && (
        <button onClick={onAction} className="text-brand text-sm font-bold inline-flex items-center gap-1 hover:underline">
          {action} <ArrowRight size={14} aria-hidden />
        </button>
      )}
    </div>
  );
}

export function ProgressBar({ value, tone = "blue", height = 8, label }: { value: number; tone?: Tone | string; height?: number; label?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className="w-full rounded-full bg-brandsoft/70 overflow-hidden"
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={cx("h-full rounded-full transition-[width] duration-500", `fill-${tone}`)} style={{ width: `${v}%` }} />
    </div>
  );
}

export function Chip({ children, tone = "blue", className = "" }: { children: ReactNode; tone?: Tone | string; className?: string }) {
  return <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap", `tone-${tone}`, className)}>{children}</span>;
}

export function Button({
  children, variant = "primary", className = "", type = "button", ...rest
}: { children: ReactNode; variant?: "primary" | "soft" | "ghost" | "danger" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles = {
    primary: "bg-brand text-white shadow-[0_8px_18px_-8px_var(--brand)] hover:brightness-110",
    soft: "bg-brandsoft text-brand hover:brightness-95",
    ghost: "bg-transparent text-body border border-line hover:bg-surface2",
    danger: "bg-[var(--pink-bg)] text-[var(--pink-fg)] hover:brightness-95",
  }[variant];
  return (
    <button type={type} className={cx("inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none", styles, className)} {...rest}>
      {children}
    </button>
  );
}

export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cx("grid place-items-center h-6 w-6 shrink-0 rounded-full border-2 transition", checked ? "bg-brand border-brand text-white" : "border-brand2/60 bg-solid hover:border-brand")}
    >
      {checked && <Check size={14} strokeWidth={3} aria-hidden />}
    </button>
  );
}

export function EmptyState({ text, action, onAction }: { text: string; action?: string; onAction?: () => void }) {
  return (
    <div className="text-center py-6 text-muted text-sm">
      <p>{text}</p>
      {action && onAction && (
        <Button variant="soft" className="mt-3" onClick={onAction}>
          <Plus size={16} aria-hidden /> {action}
        </Button>
      )}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const first = ref.current?.querySelector<HTMLElement>("input, textarea, select, button[data-autofocus]");
    first?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" role="presentation">
      <div className="absolute inset-0 bg-[#0a1a4a]/45 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx("pop relative w-full bg-solid border border-line shadow-2xl rounded-t-[1.75rem] sm:rounded-[1.75rem] p-5 sm:p-6 max-h-[92dvh] overflow-y-auto", wide ? "sm:max-w-2xl" : "sm:max-w-md")}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <h2 id={titleId} className="text-ink font-extrabold text-xl">{title}</h2>
          <button onClick={onClose} aria-label="Fechar" className="grid place-items-center h-9 w-9 rounded-full bg-surface2 text-muted hover:text-ink">
            <X size={18} aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="field">{label}</label>
      {children}
    </div>
  );
}

/** Cabeçalho de página com voltar (mobile), título, subtítulo e mascote. */
export function PageHeader({ icon: Icon, title, subtitle, mood = "feliz", quote, back = true, children }: {
  icon: LucideIcon; title: string; subtitle: string; mood?: MascotMood; quote?: string; back?: boolean; children?: ReactNode;
}) {
  const router = useRouter();
  const species = useStore((s) => s.profile.species);
  return (
    <header className="relative flex items-end justify-between gap-2 mb-4 min-h-[120px]">
      <div className="pb-1 max-w-[65%] sm:max-w-none">
        <div className="flex items-center gap-2">
          {back && (
            <button onClick={() => router.back()} aria-label="Voltar" className="lg:hidden -ml-1 grid place-items-center h-9 w-9 rounded-full text-ink hover:bg-surface2">
              <ChevronLeft size={24} aria-hidden />
            </button>
          )}
          <Icon size={30} className="text-brand" aria-hidden />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink">{title}</h1>
        </div>
        <p className="mt-1 text-muted text-sm sm:text-base">{subtitle}</p>
        {children}
      </div>
      <div className="relative shrink-0 -mb-2 flex items-end">
        {quote && <p className="hand hidden sm:block text-brand text-xl leading-6 max-w-[170px] text-right mr-2 mb-8">{quote}</p>}
        <Mascot species={species} mood={mood} size={110} />
      </div>
    </header>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; icon?: LucideIcon }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="card p-2 flex gap-1.5 overflow-x-auto no-scrollbar mb-4">
      {tabs.map((t) => {
        const active = t.id === value;
        const I = t.icon;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={cx("shrink-0 inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition", active ? "bg-brand text-white shadow-[0_8px_18px_-8px_var(--brand)]" : "bg-surface2 text-body hover:bg-brandsoft")}
          >
            {I && <I size={18} aria-hidden />}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function Stat({ label, value, tone = "blue", icon: Icon }: { label: string; value: string; tone?: Tone; icon?: LucideIcon }) {
  return (
    <div className={cx("rounded-2xl p-3 text-center", `tone-${tone}`)}>
      {Icon && <Icon size={22} className="mx-auto mb-1" aria-hidden />}
      <div className="text-xs font-semibold opacity-90">{label}</div>
      <div className="font-extrabold text-base sm:text-lg">{value}</div>
    </div>
  );
}
