import Link from "next/link";
import { logoutAction, toggleModeAction } from "@/app/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge, Button } from "@/components/ui";
import { isEditMode, requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded-2xl px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white">
      {label}
    </Link>
  );
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const editMode = await isEditMode();

  return (
    <main className="min-h-screen py-4 sm:py-6">
      <div className="page-shell space-y-6">
        <header className="topbar-shell overflow-hidden rounded-[32px] p-4 text-white backdrop-blur sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight text-white">Property Collections</h1>
                {editMode ? <Badge tone="amber">Edit mode</Badge> : <Badge tone="blue">Live view</Badge>}
              </div>
              <p className="mt-1 text-sm text-slate-300">A sharper operating surface for properties, units, residents, and collection — less dashboard sludge, more real product feel.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <NavLink href="/properties" label="Portfolio" />
              <NavLink href="/tenants" label="Residents" />
              <NavLink href="/settings" label="Settings" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ThemeToggle />
              <div className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-sm text-slate-100">
                <span className="font-medium text-white">{user.name}</span> · {user.role.toLowerCase()}
              </div>
              {user.role === "ADMIN" ? (
                <form action={toggleModeAction}>
                  <input type="hidden" name="mode" value={editMode ? "view" : "edit"} />
                  <input type="hidden" name="redirectTo" value="/properties" />
                  {editMode ? <Button type="submit" variant="glass">Switch to view</Button> : <Button type="submit" variant="inverse">Enable edit</Button>}
                </form>
              ) : null}
              <form action={logoutAction}>
                <Button type="submit" variant="glass">Log out</Button>
              </form>
            </div>
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}
