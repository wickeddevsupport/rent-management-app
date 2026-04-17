import Link from "next/link";
import { getDashboardData } from "@/lib/data";
import { isEditMode } from "@/lib/auth";
import { createPropertyAction } from "@/app/actions";
import { money, monthLabel, shortDate } from "@/lib/format";
import { Badge, Button, Card, EmptyState, Field, PageHeader, SectionTitle, StatCard, TextArea, TextInput } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const editMode = await isEditMode();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview dashboard"
        subtitle={`Everything across your properties for ${monthLabel(data.month, data.year)} — due, collected, pending, and rooms that need action.`}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total due now" value={money(data.totalDue)} tone={data.totalDue > 0 ? "danger" : "success"} />
        <StatCard label="Collected this month" value={money(data.totalCollectedThisMonth)} tone="success" />
        <StatCard label="Overdue rooms" value={String(data.overdueRooms)} tone={data.overdueRooms > 0 ? "danger" : "default"} />
        <StatCard label="Advance credit" value={money(data.totalCredit)} tone="info" />
        <StatCard label="Occupied / total" value={`${data.occupiedRooms}/${data.totalRooms}`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr,0.7fr]">
        <Card>
          <SectionTitle title="Property snapshot" subtitle="Quick summary of all active properties." />
          <div className="grid gap-4 lg:grid-cols-2">
            {data.properties.length ? (
              data.properties.map((property) => (
                <Link key={property.id} href={`/properties/${property.id}`} className="rounded-3xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200 hover:bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{property.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{property.address || "No address added yet"}</p>
                    </div>
                    <Badge tone={property.totalDue > 0 ? "red" : "green"}>{money(property.totalDue)}</Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <div><span className="block text-xs uppercase tracking-wide text-slate-400">Rooms</span>{property.roomCount}</div>
                    <div><span className="block text-xs uppercase tracking-wide text-slate-400">Occupied</span>{property.occupiedCount}</div>
                    <div><span className="block text-xs uppercase tracking-wide text-slate-400">Collected</span>{money(property.collectedThisMonth)}</div>
                    <div><span className="block text-xs uppercase tracking-wide text-slate-400">Need readings</span>{property.pendingReadingCount}</div>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState title="No properties yet" text="Add your first property and the dashboard will start filling up." />
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Quick add property" subtitle="Only shown in edit mode for safety." />
          {editMode ? (
            <form action={createPropertyAction} className="space-y-3">
              <Field label="Property name"><TextInput name="name" required placeholder="Sunrise Home" /></Field>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Short code"><TextInput name="code" placeholder="SH" /></Field>
                <Field label="Electricity rate"><TextInput name="defaultElectricityRate" type="number" step="0.01" placeholder="14" /></Field>
              </div>
              <Field label="Address"><TextInput name="address" placeholder="Location or short note" /></Field>
              <Field label="Notes"><TextArea name="notes" placeholder="Optional note for this property" /></Field>
              <Button type="submit" className="w-full">Create property</Button>
            </form>
          ) : (
            <EmptyState title="View mode is on" text="Switch to edit mode if you want to add or change anything." />
          )}
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <Card>
          <SectionTitle title="Rooms needing attention" subtitle="Bills due, partial payments, or rooms missing this month’s reading." />
          <div className="space-y-3">
            {data.rooms.filter((room) => room.totalDue > 0 || room.needsReading).slice(0, 10).map((room) => (
              <Link key={room.id} href={`/rooms/${room.id}`} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 transition hover:border-slate-200 hover:bg-slate-50">
                <div>
                  <p className="font-medium text-slate-900">{room.property.name} · Room {room.roomNumber}</p>
                  <p className="text-sm text-slate-500">{room.activeTenancy?.tenant.fullName || "No active tenant"}</p>
                </div>
                <div className="text-right">
                  {room.needsReading ? <Badge tone="amber">Needs bill</Badge> : null}
                  <p className="mt-1 text-sm font-medium text-slate-900">{money(room.totalDue)}</p>
                </div>
              </Link>
            ))}
            {!data.rooms.some((room) => room.totalDue > 0 || room.needsReading) ? <EmptyState title="Nothing urgent" text="No rooms need attention right now." /> : null}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Recent payments" subtitle="Latest collections and their receipt links." />
          <div className="space-y-3">
            {data.recentPayments.length ? (
              data.recentPayments.map((payment) => (
                <div key={payment.id} className="rounded-2xl border border-slate-100 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{payment.room.property.name} · Room {payment.room.roomNumber}</p>
                      <p className="text-sm text-slate-500">{payment.tenancy?.tenant.fullName || "Tenant not linked"} · {shortDate(payment.paymentDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{money(payment.amount)}</p>
                      {payment.receipt ? <Link href={`/receipts/${payment.receipt.id}`} className="text-xs text-indigo-600">Open receipt</Link> : null}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No payments yet" text="Receipts and recent payments will show up here after collection starts." />
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
