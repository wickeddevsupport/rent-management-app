import Link from "next/link";
import { notFound } from "next/navigation";
import { createRoomAction } from "@/app/actions";
import { isEditMode } from "@/lib/auth";
import { getPropertyDetail } from "@/lib/data";
import { bsMonthLabelFromDate, money, shortDate } from "@/lib/format";
import { Badge, Button, Card, EmptyState, Field, PageHeader, StatCard, TextArea, TextInput } from "@/components/ui";

export const dynamic = "force-dynamic";

type PropertyRoom = NonNullable<Awaited<ReturnType<typeof getPropertyDetail>>>["rooms"][number];

function roomStateLabel(room: PropertyRoom) {
  if (room.status === "VACANT") return { label: "Vacant", tone: "neutral" as const };
  if (room.status === "BLOCKED") return { label: "Blocked", tone: "amber" as const };
  if (room.needsReading) return { label: "Need reading", tone: "amber" as const };
  if (room.totalDue <= 0) return { label: "Paid", tone: "green" as const };
  if (room.currentCycle?.totalPaidAmount && room.currentCycle.totalPaidAmount > 0) return { label: "Partial", tone: "blue" as const };
  return { label: "Bill ready", tone: "red" as const };
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  const property = await getPropertyDetail(propertyId);
  if (!property) notFound();
  const editMode = await isEditMode();

  const occupied = property.rooms.filter((room) => room.status === "OCCUPIED").length;
  const totalDue = property.rooms.reduce((sum, room) => sum + room.totalDue, 0);
  const collected = property.rooms.reduce((sum, room) => sum + room.payments.reduce((inner, payment) => inner + payment.amount, 0), 0);
  const pendingReadings = property.rooms.filter((room) => room.needsReading).length;
  const bsMonth = bsMonthLabelFromDate(new Date());

  return (
    <div className="space-y-6">
      <PageHeader
        title={property.name}
        subtitle={`${property.address || "Property collection screen"} · ${bsMonth}`}
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link href={`/properties/${property.id}/meter-round`} className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
              Meter round
            </Link>
            <Link href="/properties" className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200">
              Back to properties
            </Link>
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Occupied rooms" value={String(occupied)} />
        <StatCard label="Need reading" value={String(pendingReadings)} tone={pendingReadings ? "info" : "default"} />
        <StatCard label="Due now" value={money(totalDue)} tone={totalDue > 0 ? "danger" : "success"} />
        <StatCard label="Collected" value={money(collected)} tone="success" />
      </section>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Rooms</h2>
            <p className="text-sm text-slate-500">Tap one room, collect, confirm, move to the next.</p>
          </div>
          <Badge tone="blue">Rate {property.defaultElectricityRate}/unit</Badge>
        </div>

        <div className="space-y-3">
          {property.rooms.length ? (
            property.rooms.map((room) => {
              const state = roomStateLabel(room);
              return (
                <Link key={room.id} href={`/rooms/${room.id}`} className="block rounded-3xl border border-slate-100 p-4 transition hover:border-slate-200 hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-900">Room {room.roomNumber}</h3>
                        <Badge tone={state.tone}>{state.label}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{room.activeTenancy?.tenant.fullName || "No active tenant"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Due</p>
                      <p className="text-lg font-semibold text-slate-950">{money(room.totalDue)}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-4">
                    <div><span className="block text-xs uppercase tracking-wide text-slate-400">Rent</span>{money(room.currentDefaultRent)}</div>
                    <div><span className="block text-xs uppercase tracking-wide text-slate-400">Water</span>{money(room.currentDefaultWater)}</div>
                    <div><span className="block text-xs uppercase tracking-wide text-slate-400">Meter</span>{room.currentCycle ? `${room.currentCycle.previousMeterReading} → ${room.currentCycle.currentMeterReading}` : "Not entered"}</div>
                    <div><span className="block text-xs uppercase tracking-wide text-slate-400">Last payment</span>{room.latestPayment ? shortDate(room.latestPayment.paymentDate) : "—"}</div>
                  </div>
                </Link>
              );
            })
          ) : (
            <EmptyState title="No rooms yet" text="Create the first room for this property in edit mode." />
          )}
        </div>
      </Card>

      {editMode ? (
        <Card>
          <h2 className="text-lg font-semibold text-slate-950">Add room</h2>
          <p className="mt-1 text-sm text-slate-500">Setup stays here, away from daily collection.</p>
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
        </Card>
      ) : null}
    </div>
  );
}
