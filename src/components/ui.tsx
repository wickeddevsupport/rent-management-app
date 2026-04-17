import Link from "next/link";
import { cn } from "@/lib/format";

type ButtonVariant = "primary" | "secondary" | "inverse" | "glass" | "danger";

type TabItem = {
  label: string;
  href: string;
  active?: boolean;
};

const buttonVariantClass: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  inverse: "btn-inverse",
  glass: "btn-glass",
  danger: "btn-danger",
};

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="premium-panel flex flex-col gap-4 rounded-[28px] p-6 sm:flex-row sm:items-end sm:justify-between">
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
  return <div className={cn("premium-panel rounded-[28px] p-5", className)}>{children}</div>;
}

export function StatCard({ label, value, help, tone = "default" }: { label: string; value: string; help?: string; tone?: "default" | "danger" | "success" | "info" }) {
  const toneClass = {
    default: "stat-card",
    danger: "stat-card stat-card-danger",
    success: "stat-card stat-card-success",
    info: "stat-card stat-card-info",
  }[tone];
  return (
    <Card className={toneClass}>
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

export function SegmentedTabs({ tabs, className }: { tabs: TabItem[]; className?: string }) {
  return (
    <div className={cn("segmented-tabs", className)}>
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.active ? "page" : undefined}
          className={cn("segmented-tab", tab.active && "is-active")}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "red" | "green" | "amber" | "blue" }) {
  return <span className={cn("badge", `badge-${tone}`)}>{children}</span>;
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

export function Button({ className, variant = "primary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button {...props} className={cn("btn inline-flex h-12 items-center justify-center rounded-2xl px-4 text-sm font-semibold transition disabled:opacity-50", buttonVariantClass[variant], className)} />;
}

export function SoftButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <Button {...props} variant="secondary" className={className} />;
}

export function LinkButton({ href, children, variant = "primary", className }: { href: string; children: React.ReactNode; variant?: ButtonVariant; className?: string }) {
  return (
    <Link href={href} className={cn("btn inline-flex h-12 items-center justify-center rounded-2xl px-4 text-sm font-semibold transition", buttonVariantClass[variant], className)}>
      {children}
    </Link>
  );
}
