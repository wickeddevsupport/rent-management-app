import Link from "next/link";
import { getTenantsDirectory } from "@/lib/data";
import { shortDate } from "@/lib/format";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TenantsPage() {
  const tenants = await getTenantsDirectory();
  return (
    <div className="space-y-6">
      <PageHeader title="Tenants" subtitle="Current and past tenant history, linked back to their rooms." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tenants.length ? tenants.map((tenant) => {
          const latest = tenant.tenancies[0];
          return (
            <Card key={tenant.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">{tenant.fullName}</h2>
                  <p className="mt-1 text-sm text-slate-500">{tenant.phone || "No phone"}</p>
                </div>
                <Badge tone={latest?.isActive ? "green" : "neutral"}>{latest?.isActive ? "active" : "history"}</Badge>
              </div>
              {latest ? (
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-medium text-slate-900">Latest stay</p>
                  <p className="mt-1">{latest.room.property.name} · Room {latest.room.roomNumber}</p>
                  <p className="mt-1">{shortDate(latest.startDate)} → {latest.endDate ? shortDate(latest.endDate) : "Present"}</p>
                  <Link href={`/rooms/${latest.room.id}`} className="mt-3 inline-block text-sm font-medium text-indigo-600">Open room</Link>
                </div>
              ) : null}
            </Card>
          );
        }) : <EmptyState title="No tenants yet" text="Tenant records will appear here after you start a tenancy." />}
      </div>
    </div>
  );
}
