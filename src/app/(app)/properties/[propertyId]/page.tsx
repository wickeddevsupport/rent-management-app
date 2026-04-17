import { notFound } from "next/navigation";
import { createRoomAction, updatePropertyAction } from "@/app/actions";
import { Badge, Button, Card, EmptyState, Field, LinkButton, PageHeader, SegmentedTabs, StatCard, TextArea, TextInput } from "@/components/ui";
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

export default async function PropertyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ propertyId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { propertyId } = await params;
  const query = await searchParams;
  const property = await getPropertyDetail(propertyId);
  if (!property) notFound();
  const editMode = await isEditMode();
  const view = query.view === "sheet" ? "sheet" : "cards";

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
        subtitle="Switch between card view and sheet view for this building."
        action={
          <div className="flex w-full flex-col gap-3 xl:w-auto xl:flex-row xl:items-center">
            <SegmentedTabs
              tabs={[
                { label: "Cards", href: `/properties/${property.id}?view=cards`, active: view === "cards" },
                { label: "Sheet", href: `/properties/${property.id}?view=sheet`, active: view === "sheet" },
              ]}
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <LinkButton href={`/properties/${property.id}/meter-round`} variant="primary">Meter round</LinkButton>
              <LinkButton href="/properties" variant="secondary">Back to portfolio</LinkButton>
            </div>
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Occupied units" value={String(occupied)} />
        <StatCard label="Readings pending" value={String(pendingReadings)} tone={pendingReadings ? "info" : "default"} />
        <StatCard label="Due now" value={money(totalDue)} tone={totalDue > 0 ? "danger" : "success"} />
        <StatCard label="Collected" value={money(collected)} tone="success" />
      </section>

      {view === "cards" ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {property.rooms.length ? (
            property.rooms.map((room) => {
              const state = roomStateLabel(room);
              return (
                <a key={room.id} href={`/rooms/${room.id}`} className="group block">
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
                      <div className="surface-subtle rounded-3xl p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Due now</p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">{money(room.totalDue)}</p>
                      </div>
                      <div className="surface-subtle rounded-3xl p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Rent + water</p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">{money(room.currentDefaultRent + room.currentDefaultWater)}</p>
                      </div>
                    </div>

                    <div className="surface-inset mt-5 rounded-3xl p-4 text-sm text-slate-600">
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
                </a>
              );
            })
          ) : (
            <div className="md:col-span-2 2xl:col-span-3">
              <EmptyState title="No rooms yet" text="Create the first room for this property in edit mode." />
            </div>
          )}
        </div>
      ) : (
        <Card className="listing-card overflow-hidden p-0">
          {property.rooms.length ? (
            <div className="overflow-x-auto">
              <table className="data-table min-w-[960px]">
                <thead>
                  <tr>
                    <th>Unit</th>
                    <th>Resident</th>
                    <th>Status</th>
                    <th>Due now</th>
                    <th>Number</th>
                    <th>Last payment</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {property.rooms.map((room) => {
                    const state = roomStateLabel(room);
                    return (
                      <tr key={room.id}>
                        <td>
                          <div>
                            <p className="font-semibold text-slate-950">Room {room.roomNumber}</p>
                            <p className="mt-1 text-sm text-slate-500">{room.roomLabel || room.status.toLowerCase()}</p>
                          </div>
                        </td>
                        <td>
                          <div>
                            <p className="font-medium text-slate-950">{room.activeTenancy?.tenant.fullName || "Vacant"}</p>
                            <p className="mt-1 text-sm text-slate-500">{room.activeTenancy?.tenant.phone || "No phone"}</p>
                          </div>
                        </td>
                        <td><Badge tone={state.tone}>{state.label}</Badge></td>
                        <td className="font-semibold text-slate-950">{money(room.totalDue)}</td>
                        <td>{room.currentCycle ? `${room.currentCycle.previousMeterReading} → ${room.currentCycle.currentMeterReading}` : "Not entered"}</td>
                        <td>{room.latestPayment ? shortDate(room.latestPayment.paymentDate) : "—"}</td>
                        <td>
                          <LinkButton href={`/rooms/${room.id}`} variant={room.totalDue > 0 ? "primary" : "secondary"} className="h-10 px-3 text-xs">
                            Open room
                          </LinkButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-5">
              <EmptyState title="No rooms yet" text="Create the first room for this property in edit mode." />
            </div>
          )}
        </Card>
      )}

      {editMode ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="listing-card rounded-[32px] p-6 sm:p-7">
            <h2 className="text-lg font-semibold text-slate-950">Edit building</h2>
            <p className="mt-1 text-sm text-slate-500">Update building details and defaults.</p>
            <form action={updatePropertyAction} className="mt-5 space-y-3">
              <input type="hidden" name="propertyId" value={property.id} />
              <Field label="Building name"><TextInput name="name" required defaultValue={property.name} /></Field>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Code"><TextInput name="code" defaultValue={property.code || ""} /></Field>
                <Field label="Electricity rate"><TextInput name="defaultElectricityRate" type="number" step="0.01" defaultValue={property.defaultElectricityRate} /></Field>
              </div>
              <Field label="Address"><TextInput name="address" defaultValue={property.address || ""} /></Field>
              <Field label="Notes"><TextArea name="notes" defaultValue={property.notes || ""} /></Field>
              <Button type="submit" className="w-full">Save building</Button>
            </form>
          </Card>

          <Card className="listing-card rounded-[32px] p-6 sm:p-7">
            <h2 className="text-lg font-semibold text-slate-950">Add room</h2>
            <p className="mt-1 text-sm text-slate-500">Add a new unit to this building.</p>
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
        </div>
      ) : null}
    </div>
  );
}
