import Link from "next/link";
import { logoutAction, toggleModeAction } from "@/app/actions";
import { isEditMode, requireUser } from "@/lib/auth";
import { Badge, Button, SoftButton } from "@/components/ui";

export const dynamic = "force-dynamic";

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950">
      {label}
    </Link>
  );
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const editMode = await isEditMode();

  return (
    <main className="min-h-screen py-6">
      <div className="page-shell space-y-6">
        <header className={`rounded-3xl border p-4 shadow-sm backdrop-blur ${editMode ? "border-amber-200 bg-amber-50/85" : "border-white/70 bg-white/80"}`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-slate-950">Rent Management</h1>
                {editMode ? <Badge tone="amber">Edit mode</Badge> : <Badge>View mode</Badge>}
              </div>
              <p className="mt-1 text-sm text-slate-600">Clear property overview, room ledgers, monthly bills, and shareable receipts.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <NavLink href="/dashboard" label="Dashboard" />
              <NavLink href="/properties" label="Properties" />
              <NavLink href="/tenants" label="Tenants" />
              <NavLink href="/settings" label="Settings" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
                <span className="font-medium">{user.name}</span> · {user.role.toLowerCase()}
              </div>
              {user.role === "ADMIN" ? (
                <form action={toggleModeAction}>
                  <input type="hidden" name="mode" value={editMode ? "view" : "edit"} />
                  <input type="hidden" name="redirectTo" value="/dashboard" />
                  {editMode ? <SoftButton type="submit">Switch to view</SoftButton> : <Button type="submit">Enable edit</Button>}
                </form>
              ) : null}
              <form action={logoutAction}>
                <SoftButton type="submit">Log out</SoftButton>
              </form>
            </div>
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}
