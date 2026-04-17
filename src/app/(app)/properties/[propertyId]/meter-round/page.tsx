import Link from "next/link";
import { notFound } from "next/navigation";
import { createBillingCycleAction } from "@/app/actions";
import { getPropertyDetail } from "@/lib/data";
import { bsMonthLabelFromDate, money } from "@/lib/format";
import { Badge, Button, Card, EmptyState, Field, PageHeader, TextInput } from "@/components/ui";

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

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${property.name} · Meter round`}
        subtitle={`${bsMonth}. Enter reading, save, move to the next room.`}
        action={<Link href={`/properties/${property.id}`} className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-100 px-4 text-sm font-medium !text-slate-800 transition hover:bg-slate-200">Back to property</Link>}
      />

      <div className="space-y-3">
        {occupiedRooms.length ? (
          occupiedRooms.map((room) => {
            const currentCycle = room.billingCycles.find((cycle) => cycle.month === month && cycle.year === year) || null;
            const lastReading = currentCycle?.currentMeterReading ?? room.billingCycles[0]?.currentMeterReading ?? room.activeTenancy?.startMeterReading ?? 0;

            return (
              <Card key={room.id}>
                <form action={createBillingCycleAction} className="space-y-4">
                  <input type="hidden" name="roomId" value={room.id} />
                  <input type="hidden" name="month" value={month} />
                  <input type="hidden" name="year" value={year} />
                  <input type="hidden" name="adjustmentAmount" value="0" />
                  <input type="hidden" name="note" value="" />
                  <input type="hidden" name="redirectTo" value={`/properties/${property.id}/meter-round`} />

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-slate-950">Room {room.roomNumber}</h2>
                        <Badge tone={currentCycle ? "green" : "amber"}>{currentCycle ? "Saved" : "Pending"}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{room.activeTenancy?.tenant.fullName || "No active tenant"}</p>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      <p>Due {money(room.totalDue)}</p>
                      <p className="text-xs text-slate-400">Last reading {lastReading}</p>
                    </div>
                  </div>

                  <Field label="Current meter reading">
                    <TextInput name="currentMeterReading" type="number" step="0.01" defaultValue={lastReading} required />
                  </Field>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="submit" className="flex-1">Save reading</Button>
                    <Link href={`/rooms/${room.id}`} className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-100 px-4 text-sm font-medium !text-slate-800 transition hover:bg-slate-200">
                      Open room
                    </Link>
                  </div>
                </form>
              </Card>
            );
          })
        ) : (
          <EmptyState title="No occupied rooms" text="When a room has an active tenant, it will show up here for meter entry." />
        )}
      </div>
    </div>
  );
}
