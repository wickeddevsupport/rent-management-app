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
            <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">Rent collection, meter readings, receipts, and tenancies.</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">Private access for monthly billing, payment entry, resident records, and receipt sharing.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Collections</p>
              <p className="mt-2 text-sm font-semibold text-white">Room-by-room entry</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">BS dates</p>
              <p className="mt-2 text-sm font-semibold text-white">Dates shown in Bikram Sambat</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Receipts</p>
              <p className="mt-2 text-sm font-semibold text-white">Share from phone</p>
            </div>
          </div>
        </section>

        <Card className="flex flex-col justify-center rounded-[36px] p-7 sm:p-9">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Sign in</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Rent Management</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Sign in to manage buildings, units, residents, bills, and receipts.</p>
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
