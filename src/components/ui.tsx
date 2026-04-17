import Link from "next/link";
import { cn } from "@/lib/format";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200/80 bg-white/92 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Rent management</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-[28px] border border-slate-200/80 bg-white/94 p-5 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)]", className)}>{children}</div>;
}

export function StatCard({ label, value, help, tone = "default" }: { label: string; value: string; help?: string; tone?: "default" | "danger" | "success" | "info" }) {
  const toneClass = {
    default: "from-white to-slate-50",
    danger: "from-rose-50 to-white",
    success: "from-emerald-50 to-white",
    info: "from-blue-50 to-white",
  }[tone];
  return (
    <Card className={`bg-gradient-to-br ${toneClass}`}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      {help ? <p className="mt-2 text-xs leading-5 text-slate-500">{help}</p> : null}
    </Card>
  );
}

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "red" | "green" | "amber" | "blue" }) {
  const map = {
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    red: "bg-rose-100 text-rose-700 border-rose-200",
    green: "bg-emerald-100 text-emerald-700 border-emerald-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
  };
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", map[tone])}>{children}</span>;
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <Card className="border-dashed text-center">
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </Card>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs font-medium leading-5 text-slate-500">{hint}</span> : null}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("h-12 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-950 outline-none ring-0 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100", props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("min-h-[110px] rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("h-12 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100", props.className)} />;
}

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={cn("inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.9)] transition hover:bg-slate-800 disabled:opacity-50", className)} />;
}

export function SoftButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={cn("inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50", className)} />;
}

export function LinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.9)] transition hover:bg-slate-800">
      {children}
    </Link>
  );
}
