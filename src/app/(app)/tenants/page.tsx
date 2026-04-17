import Link from "next/link";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { getTenantsDirectory } from "@/lib/data";
import { shortDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TenantsPage() {
  const tenants = await getTenantsDirectory();

  return (
    <div className="space-y-6">
      <section className="listing-hero overflow-hidden rounded-[32px] p-6 text-white shadow-[0_30px_90px_-40px_rgba(15,23,42,0.8)] sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Residents directory</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">People should feel like residents, not raw records.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">A cleaner directory of who is staying where, when they joined, and how to jump back into the unit.</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Residents</p>
            <p className="mt-2 text-2xl font-semibold text-white">{tenants.length}</p>
          </div>
        </div>
      </section>

      <PageHeader title="Residents" subtitle="Current and past occupancy, linked back to their live unit." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tenants.length ? tenants.map((tenant) => {
          const latest = tenant.tenancies[0];
          return (
            <Card key={tenant.id} className="unit-card rounded-[30px] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Resident</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{tenant.fullName}</h2>
                  <p className="mt-2 text-sm text-slate-500">{tenant.phone || "No phone added"}</p>
                </div>
                <Badge tone={latest?.isActive ? "green" : "neutral"}>{latest?.isActive ? "Active" : "History"}</Badge>
              </div>
              {latest ? (
                <div className="mt-5 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-medium text-slate-900">Latest stay</p>
                  <p className="mt-2">{latest.room.property.name} · Room {latest.room.roomNumber}</p>
                  <p className="mt-1">{shortDate(latest.startDate)} → {latest.endDate ? shortDate(latest.endDate) : "Present"}</p>
                  <Link href={`/rooms/${latest.room.id}`} className="mt-4 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                    Open unit
                  </Link>
                </div>
              ) : null}
            </Card>
          );
        }) : <EmptyState title="No tenants yet" text="Resident records will appear here after you start a tenancy." />}
      </div>
    </div>
  );
}
