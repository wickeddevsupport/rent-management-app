import Link from "next/link";
import { notFound } from "next/navigation";
import { createRoomAction } from "@/app/actions";
import { Badge, Button, Card, EmptyState, Field, PageHeader, StatCard, TextArea, TextInput } from "@/components/ui";
import { isEditMode } from "@/lib/auth";
import { getPropertyDetail } from "@/lib/data";
import { bsMonthLabelFromDate, money, shortDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type PropertyRoom = NonNullable<Awaited<ReturnType<typeof getPropertyDetail>>>["rooms"][number];

function roomStateLabel(room: PropertyRoom) {
  if (room.status === "VACANT") return { label: "Vacant", tone: "neutral" as const };
  if (room.status === "BLOCKED") return { label: "Blocked", tone: "amber" as const };
  if (room.needsReading) return { label: "Need reading", tone: "amber" as const };
  if (room.totalDue <= 0) return { label: "Paid", tone: "green" as const };
  if (room.currentCycle?.totalPaidAmount && room.currentCycle.totalPaidAmount > 0) return { label: "Partial", tone: "blue" as const };
  return { label: "Ready for collection", tone: "red" as const };
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
      <section className="listing-hero overflow-hidden rounded-[36px] p-6 text-white sm:p-8 lg:p-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Building view</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{property.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{property.address || "Property address not added yet"}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge tone="blue">{bsMonth}</Badge>
              <Badge tone={pendingReadings > 0 ? "amber" : totalDue > 0 ? "red" : "green"}>
                {pendingReadings > 0 ? `${pendingReadings} readings pending` : totalDue > 0 ? "Collection pending" : "Month under control"}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[520px]">
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Units</p>
              <p className="mt-2 text-xl font-semibold text-white">{property.rooms.length}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Occupied</p>
              <p className="mt-2 text-xl font-semibold text-white">{occupied}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Due now</p>
              <p className="mt-2 text-xl font-semibold text-white">{money(totalDue)}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Collected</p>
              <p className="mt-2 text-xl font-semibold text-white">{money(collected)}</p>
            </div>
          </div>
        </div>
      </section>

      <PageHeader
        title="Units"
        subtitle="A cleaner building view for occupancy, due amounts, readings, and current resident state."
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link href={`/properties/${property.id}/meter-round`} className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-950/90 bg-slate-950 px-4 text-sm font-semibold !text-white transition hover:bg-slate-800 hover:!text-white">
              Meter round
            </Link>
            <Link href="/properties" className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold !text-slate-900 transition hover:bg-slate-50 hover:!text-slate-900">
              Back to portfolio
            </Link>
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Occupied units" value={String(occupied)} />
        <StatCard label="Readings pending" value={String(pendingReadings)} tone={pendingReadings ? "info" : "default"} />
        <StatCard label="Due now" value={money(totalDue)} tone={totalDue > 0 ? "danger" : "success"} />
        <StatCard label="Collected" value={money(collected)} tone="success" />
      </section>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {property.rooms.length ? (
          property.rooms.map((room) => {
            const state = roomStateLabel(room);
            return (
              <Link key={room.id} href={`/rooms/${room.id}`} className="group block">
                <article className="unit-card rounded-[32px] p-5 transition duration-200 group-hover:-translate-y-0.5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Unit</p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Room {room.roomNumber}</h3>
                      <p className="mt-2 text-sm text-slate-500">{room.activeTenancy?.tenant.fullName || "Vacant right now"}</p>
                    </div>
                    <Badge tone={state.tone}>{state.label}</Badge>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Due now</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">{money(room.totalDue)}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Rent + water</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">{money(room.currentDefaultRent + room.currentDefaultWater)}</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-3xl border border-slate-200/80 bg-white/70 p-4 text-sm text-slate-600">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Electricity number</span>
                      <span className="font-medium text-slate-900">{room.currentCycle ? `${room.currentCycle.previousMeterReading} → ${room.currentCycle.currentMeterReading}` : "Not entered"}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-slate-500">Last payment</span>
                      <span className="font-medium text-slate-900">{room.latestPayment ? shortDate(room.latestPayment.paymentDate) : "—"}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-slate-500">Status</span>
                      <span className="font-medium uppercase tracking-[0.12em] text-slate-900">{room.status}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm">
                    <span className="text-slate-500">Open unit</span>
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-950 transition group-hover:border-slate-300">View room</span>
                  </div>
                </article>
              </Link>
            );
          })
        ) : (
          <div className="md:col-span-2 2xl:col-span-3">
            <EmptyState title="No rooms yet" text="Create the first room for this property in edit mode." />
          </div>
        )}
      </div>

      {editMode ? (
        <Card className="listing-card rounded-[32px] p-6 sm:p-7">
          <h2 className="text-lg font-semibold text-slate-950">Add room</h2>
          <p className="mt-1 text-sm text-slate-500">New units stay in setup, away from the live monthly flow.</p>
          <form action={createRoomAction} className="mt-5 space-y-3">
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
