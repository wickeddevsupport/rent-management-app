import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";
import { Button, Card, Field, TextInput } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const params = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Rajan family tool</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Rent Management</h1>
          <p className="mt-3 text-sm text-slate-600">Simple, room-wise rent tracking with bills, payments, balances, and shareable receipts.</p>
        </div>
        <Card className="p-6">
          <form action={loginAction} className="space-y-4">
            <Field label="Email">
              <TextInput name="email" type="email" required placeholder="admin@rent.local" />
            </Field>
            <Field label="Password">
              <TextInput name="password" type="password" required placeholder="••••••••" />
            </Field>
            {params.error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">Wrong email or password.</p> : null}
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
