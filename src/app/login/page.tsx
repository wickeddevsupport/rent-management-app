import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions";
import { Button, Card, Field, TextInput } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <section className="listing-hero flex min-h-[420px] flex-col justify-between rounded-[36px] p-8 text-white sm:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Private property operations</p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">A cleaner rent collection surface for real buildings, real units, and real residents.</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">Built for monthly collection, utility tracking, receipts, and tenancy follow-through without the usual clunky admin-panel feel.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Collector-first</p>
              <p className="mt-2 text-sm font-semibold text-white">Fast room-by-room flow</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">BS-first</p>
              <p className="mt-2 text-sm font-semibold text-white">Visible dates stay Nepali</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Mobile-ready</p>
              <p className="mt-2 text-sm font-semibold text-white">Built for field collection</p>
            </div>
          </div>
        </section>

        <Card className="flex flex-col justify-center rounded-[36px] p-7 sm:p-9">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Sign in</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Rent Management</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Private access for monthly collection, residents, bills, and receipts.</p>
          </div>

          <form action={loginAction} className="mt-8 space-y-4">
            <Field label="Email">
              <TextInput name="email" type="email" required placeholder="admin@rent.local" />
            </Field>
            <Field label="Password">
              <TextInput name="password" type="password" required placeholder="••••••••" />
            </Field>
            {params.error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">Wrong email or password.</p> : null}
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
