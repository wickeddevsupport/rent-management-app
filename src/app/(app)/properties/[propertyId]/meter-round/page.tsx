import Link from "next/link";
import { notFound } from "next/navigation";
import { createBillingCycleAction } from "@/app/actions";
import { Badge, Button, Card, EmptyState, Field, PageHeader, TextInput } from "@/components/ui";
import { getPropertyDetail } from "@/lib/data";
import { bsMonthLabelFromDate, money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MeterRoundPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  const property = await getPropertyDetail(propertyId);
  if (!property) notFound();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const bsMonth = bsMonthLabelFromDate(now);
  const occupiedRooms = property.rooms.filter((room) => room.status === "OCCUPIED");
  const pendingCount = occupiedRooms.filter((room) => !room.billingCycles.some((cycle) => cycle.month === month && cycle.year === year)).length;

  return (
    <div className="space-y-6">
      <section className="listing-hero overflow-hidden rounded-[32px] p-6 text-white shadow-[0_30px_90px_-40px_rgba(15,23,42,0.8)] sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Operational mode</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{property.name} · Meter round</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">Walk the meters in order, enter the live numbers, save fast, then come back later for payment if needed.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Month</p>
              <p className="mt-2 text-xl font-semibold text-white">{bsMonth}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Occupied</p>
              <p className="mt-2 text-xl font-semibold text-white">{occupiedRooms.length}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur sm:col-span-1 col-span-2">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Still pending</p>
              <p className="mt-2 text-xl font-semibold text-white">{pendingCount}</p>
            </div>
          </div>
        </div>
      </section>

      <PageHeader
        title="Fast reading entry"
        subtitle="This view is built for speed: room identity, previous number, current number, save. Nothing noisy."
        action={<Link href={`/properties/${property.id}`} className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-100 px-4 text-sm font-medium !text-slate-800 transition hover:bg-slate-200">Back to building</Link>}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {occupiedRooms.length ? (
          occupiedRooms.map((room) => {
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
                  <input type="hidden" name="redirectTo" value={`/properties/${property.id}/meter-round`} />

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Unit</p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Room {room.roomNumber}</h2>
                      <p className="mt-2 text-sm text-slate-500">{room.activeTenancy?.tenant.fullName || "No active tenant"}</p>
                    </div>
                    <Badge tone={currentCycle ? "green" : "amber"}>{currentCycle ? "Saved" : "Pending"}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Due now</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">{money(room.totalDue)}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Previous number</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">{lastReading}</p>
                    </div>
                  </div>

                  <Field label="Current electricity number">
                    <TextInput name="currentMeterReading" type="number" step="0.01" defaultValue={lastReading} required />
                  </Field>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="submit" className="flex-1">Save reading</Button>
                    <Link href={`/rooms/${room.id}`} className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-100 px-4 text-sm font-semibold !text-slate-800 transition hover:bg-slate-200">
                      Open unit
                    </Link>
                  </div>
                </form>
              </Card>
            );
          })
        ) : (
          <div className="xl:col-span-2">
            <EmptyState title="No occupied rooms" text="When a room has an active resident, it will show up here for meter entry." />
          </div>
        )}
      </div>
    </div>
  );
}
