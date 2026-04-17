import { notFound } from "next/navigation";
import { createBillingCycleAction } from "@/app/actions";
import { Badge, Button, Card, EmptyState, Field, LinkButton, PageHeader, SegmentedTabs, TextInput } from "@/components/ui";
import { getPropertyDetail } from "@/lib/data";
import { bsMonthLabelFromDate, money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MeterRoundPage({
  params,
  searchParams,
}: {
  params: Promise<{ propertyId: string }>;
  searchParams: Promise<{ layout?: string }>;
}) {
  const { propertyId } = await params;
  const query = await searchParams;
  const property = await getPropertyDetail(propertyId);
  if (!property) notFound();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const bsMonth = bsMonthLabelFromDate(now);
  const occupiedRooms = property.rooms.filter((room) => room.status === "OCCUPIED");
  const pendingCount = occupiedRooms.filter((room) => !room.billingCycles.some((cycle) => cycle.month === month && cycle.year === year)).length;
  const layout = query.layout === "cards" ? "cards" : "sheet";

  return (
    <div className="space-y-6">
      <section className="listing-hero overflow-hidden rounded-[36px] p-6 text-white sm:p-8 lg:p-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Operational mode</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{property.name} · Meter round</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">The sheet view is the fast lane: denser entry, less vertical scrolling, and a clearer pass through the building.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Month</p>
              <p className="mt-2 text-xl font-semibold text-white">{bsMonth}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Occupied</p>
              <p className="mt-2 text-xl font-semibold text-white">{occupiedRooms.length}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur col-span-2 sm:col-span-1">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Still pending</p>
              <p className="mt-2 text-xl font-semibold text-white">{pendingCount}</p>
            </div>
          </div>
        </div>
      </section>

      <PageHeader
        title="Fast reading entry"
        subtitle="Switch between a denser sheet and a larger card layout depending on whether you are moving fast or reviewing one unit at a time."
        action={
          <div className="flex w-full flex-col gap-3 xl:w-auto xl:flex-row xl:items-center">
            <SegmentedTabs
              tabs={[
                { label: "Sheet", href: `/properties/${property.id}/meter-round?layout=sheet`, active: layout === "sheet" },
                { label: "Cards", href: `/properties/${property.id}/meter-round?layout=cards`, active: layout === "cards" },
              ]}
            />
            <LinkButton href={`/properties/${property.id}`} variant="secondary">Back to building</LinkButton>
          </div>
        }
      />

      {occupiedRooms.length ? (
        layout === "sheet" ? (
          <Card className="listing-card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="data-table min-w-[1080px]">
                <thead>
                  <tr>
                    <th>Unit</th>
                    <th>Resident</th>
                    <th>Due now</th>
                    <th>Previous</th>
                    <th>Status</th>
                    <th>Entry</th>
                  </tr>
                </thead>
                <tbody>
                  {occupiedRooms.map((room) => {
                    const currentCycle = room.billingCycles.find((cycle) => cycle.month === month && cycle.year === year) || null;
                    const lastReading = currentCycle?.currentMeterReading ?? room.billingCycles[0]?.currentMeterReading ?? room.activeTenancy?.startMeterReading ?? 0;
                    return (
                      <tr key={room.id}>
                        <td>
                          <p className="font-semibold text-slate-950">Room {room.roomNumber}</p>
                          <p className="mt-1 text-sm text-slate-500">{room.roomLabel || "Occupied unit"}</p>
                        </td>
                        <td>
                          <p className="font-medium text-slate-950">{room.activeTenancy?.tenant.fullName || "No active tenant"}</p>
                          <p className="mt-1 text-sm text-slate-500">{room.activeTenancy?.tenant.phone || "No phone"}</p>
                        </td>
                        <td className="font-semibold text-slate-950">{money(room.totalDue)}</td>
                        <td>{lastReading}</td>
                        <td><Badge tone={currentCycle ? "green" : "amber"}>{currentCycle ? "Saved" : "Pending"}</Badge></td>
                        <td>
                          <form action={createBillingCycleAction} className="flex items-center gap-2">
                            <input type="hidden" name="roomId" value={room.id} />
                            <input type="hidden" name="month" value={month} />
                            <input type="hidden" name="year" value={year} />
                            <input type="hidden" name="adjustmentAmount" value="0" />
                            <input type="hidden" name="note" value="" />
                            <input type="hidden" name="redirectTo" value={`/properties/${property.id}/meter-round?layout=sheet`} />
                            <TextInput name="currentMeterReading" type="number" step="0.01" defaultValue={lastReading} required className="h-10 w-28 min-w-[7rem]" />
                            <Button type="submit" className="h-10 px-3 text-xs">Save</Button>
                            <LinkButton href={`/rooms/${room.id}`} variant="secondary" className="h-10 px-3 text-xs">Open</LinkButton>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {occupiedRooms.map((room) => {
              const currentCycle = room.billingCycles.find((cycle) => cycle.month === month && cycle.year === year) || null;
              const lastReading = currentCycle?.currentMeterReading ?? room.billingCycles[0]?.currentMeterReading ?? room.activeTenancy?.startMeterReading ?? 0;

              return (
                <Card key={room.id} className="unit-card rounded-[30px] p-5 sm:p-6">
                  <form action={createBillingCycleAction} className="space-y-4">
                    <input type="hidden" name="roomId" value={room.id} />
                    <input type="hidden" name="month" value={month} />
                    <input type="hidden" name="year" value={year} />
                    <input type="hidden" name="adjustmentAmount" value="0" />
                    <input type="hidden" name="note" value="" />
                    <input type="hidden" name="redirectTo" value={`/properties/${property.id}/meter-round?layout=cards`} />

                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Unit</p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Room {room.roomNumber}</h2>
                        <p className="mt-2 text-sm text-slate-500">{room.activeTenancy?.tenant.fullName || "No active tenant"}</p>
                      </div>
                      <Badge tone={currentCycle ? "green" : "amber"}>{currentCycle ? "Saved" : "Pending"}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="surface-subtle rounded-3xl p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Due now</p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">{money(room.totalDue)}</p>
                      </div>
                      <div className="surface-subtle rounded-3xl p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Previous number</p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">{lastReading}</p>
                      </div>
                    </div>

                    <Field label="Current electricity number">
                      <TextInput name="currentMeterReading" type="number" step="0.01" defaultValue={lastReading} required />
                    </Field>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button type="submit" className="flex-1">Save reading</Button>
                      <LinkButton href={`/rooms/${room.id}`} variant="secondary" className="flex-1">Open unit</LinkButton>
                    </div>
                  </form>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        <EmptyState title="No occupied rooms" text="When a room has an active resident, it will show up here for meter entry." />
      )}
    </div>
  );
}
