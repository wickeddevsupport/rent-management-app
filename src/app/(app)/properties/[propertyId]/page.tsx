import Link from "next/link";
import { notFound } from "next/navigation";
import { createRoomAction } from "@/app/actions";
import { isEditMode } from "@/lib/auth";
import { getPropertyDetail } from "@/lib/data";
import { money, shortDate } from "@/lib/format";
import { Badge, Button, Card, EmptyState, Field, PageHeader, StatCard, TextArea, TextInput } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PropertyDetailPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  const property = await getPropertyDetail(propertyId);
  if (!property) notFound();
  const editMode = await isEditMode();

  const occupied = property.rooms.filter((room) => room.status === "OCCUPIED").length;
  const totalDue = property.rooms.reduce((sum, room) => sum + room.totalDue, 0);
  const collected = property.rooms.reduce((sum, room) => sum + room.payments.reduce((inner, payment) => inner + payment.amount, 0), 0);
  const pendingReadings = property.rooms.filter((room) => room.needsReading).length;

  return (
    <div className="space-y-6">
      <PageHeader title={property.name} subtitle={property.address || "Property detail and all rooms."} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total due" value={money(totalDue)} tone={totalDue > 0 ? "danger" : "success"} />
        <StatCard label="Collected" value={money(collected)} tone="success" />
        <StatCard label="Occupied rooms" value={String(occupied)} />
        <StatCard label="Need billing" value={String(pendingReadings)} tone={pendingReadings ? "info" : "default"} />
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Rooms</h2>
              <p className="text-sm text-slate-500">Room number is the main practical identifier.</p>
            </div>
            <Badge tone="blue">Electricity rate {money(property.defaultElectricityRate).replace("NPR", "")}</Badge>
          </div>
          <div className="space-y-3">
            {property.rooms.length ? (
              property.rooms.map((room) => (
                <Link key={room.id} href={`/rooms/${room.id}`} className="flex flex-col gap-3 rounded-3xl border border-slate-100 p-4 transition hover:border-slate-200 hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-900">Room {room.roomNumber}</h3>
                        <Badge tone={room.status === "OCCUPIED" ? "green" : room.status === "VACANT" ? "neutral" : "amber"}>{room.status.toLowerCase()}</Badge>
                        {room.needsReading ? <Badge tone="amber">needs bill</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{room.activeTenancy?.tenant.fullName || "No active tenant"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Due</p>
                      <p className="text-lg font-semibold text-slate-950">{money(room.totalDue)}</p>
                    </div>
                  </div>
                  <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                    <div><span className="block text-xs uppercase tracking-wide text-slate-400">Rent</span>{money(room.currentDefaultRent)}</div>
                    <div><span className="block text-xs uppercase tracking-wide text-slate-400">Water</span>{money(room.currentDefaultWater)}</div>
                    <div><span className="block text-xs uppercase tracking-wide text-slate-400">Last payment</span>{room.latestPayment ? shortDate(room.latestPayment.paymentDate) : "—"}</div>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState title="No rooms yet" text="Create the first room for this property in edit mode." />
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-950">Add room</h2>
          <p className="mt-1 text-sm text-slate-500">Use room number first so it matches how you already manage everything.</p>
          {editMode ? (
            <form action={createRoomAction} className="mt-4 space-y-3">
              <input type="hidden" name="propertyId" value={property.id} />
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Room number"><TextInput name="roomNumber" required placeholder="101" /></Field>
                <Field label="Label"><TextInput name="roomLabel" placeholder="Front room" /></Field>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Default rent"><TextInput name="currentDefaultRent" type="number" step="0.01" required /></Field>
                <Field label="Default water"><TextInput name="currentDefaultWater" type="number" step="0.01" required /></Field>
              </div>
              <Field label="Meter label"><TextInput name="meterLabel" placeholder="Meter A" /></Field>
              <Field label="Opening balance"><TextInput name="openingBalance" type="number" step="0.01" defaultValue="0" /></Field>
              <Field label="Notes"><TextArea name="notes" placeholder="Optional room notes" /></Field>
              <Button type="submit" className="w-full">Create room</Button>
            </form>
          ) : (
            <div className="mt-4"><EmptyState title="View mode is on" text="Switch to edit mode when you want to add rooms." /></div>
          )}
        </Card>
      </div>
    </div>
  );
}
