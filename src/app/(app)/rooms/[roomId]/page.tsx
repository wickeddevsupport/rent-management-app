import Link from "next/link";
import { notFound } from "next/navigation";
import { archiveRoomAction, collectRoomAction, endTenancyAction, startTenancyAction } from "@/app/actions";
import { isEditMode } from "@/lib/auth";
import { availableCreditForRoom, getRoomDetail, outstandingForRoom } from "@/lib/data";
import { bsDate, bsMonthLabelFromDate, money, shortDate } from "@/lib/format";
import { Badge, Button, Card, EmptyState, Field, PageHeader, SectionTitle, StatCard, TextArea, TextInput, Select } from "@/components/ui";

export const dynamic = "force-dynamic";

function roomStatusTone(status: string) {
  if (status === "VACANT") return "neutral" as const;
  if (status === "BLOCKED") return "amber" as const;
  return "green" as const;
}

export default async function RoomDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ saved?: string; receiptId?: string }>;
}) {
  const { roomId } = await params;
  const query = await searchParams;
  const room = await getRoomDetail(roomId);
  if (!room) notFound();

  const editMode = await isEditMode();
  const activeTenancy = room.tenancies.find((tenancy) => tenancy.isActive) || null;
  const totalDue = outstandingForRoom(room);
  const credit = availableCreditForRoom(room);
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const currentCycle = room.billingCycles.find((cycle) => cycle.month === month && cycle.year === year) || room.billingCycles[0] || null;
  const propertyRoomIds = room.property.rooms?.map?.((item: { id: string }) => item.id) || [];
  const roomIds = propertyRoomIds.length ? propertyRoomIds : [];
  const currentIndex = roomIds.findIndex((id: string) => id === room.id);
  const nextRoomId = currentIndex >= 0 ? roomIds[currentIndex + 1] : null;
  const nextRoomHref = nextRoomId ? `/rooms/${nextRoomId}` : `/properties/${room.propertyId}`;
  const bsMonth = bsMonthLabelFromDate(now);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${room.property.name} · Room ${room.roomNumber}`}
        subtitle={activeTenancy ? `${activeTenancy.tenant.fullName} · ${activeTenancy.tenant.phone || "No phone added"}` : "No active tenant in this room right now."}
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link href={`/properties/${room.propertyId}`} className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200">
              Back to rooms
            </Link>
            <Badge tone={roomStatusTone(room.status)}>{room.status.toLowerCase()}</Badge>
          </div>
        }
      />

      {query.saved === "1" ? (
        <Card className="border-emerald-200 bg-emerald-50/80">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-emerald-950">Saved successfully</h2>
              <p className="mt-1 text-sm text-emerald-800">Collection saved for {bsMonth}. You can move straight to the next room.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {query.receiptId ? (
                <Link href={`/receipts/${query.receiptId}`} className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-medium text-emerald-900 transition hover:bg-emerald-100">
                  Open receipt
                </Link>
              ) : null}
              <Link href={nextRoomHref} className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-700 px-4 text-sm font-medium text-white transition hover:bg-emerald-600">
                {nextRoomId ? "Next room" : "Back to property"}
              </Link>
            </div>
          </div>
        </Card>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Due now" value={money(totalDue)} tone={totalDue > 0 ? "danger" : "success"} />
        <StatCard label="Advance credit" value={money(credit)} tone="info" />
        <StatCard label="Rent" value={money(activeTenancy?.startRent ?? room.currentDefaultRent)} />
        <StatCard label="Water" value={money(activeTenancy?.startWater ?? room.currentDefaultWater)} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="space-y-6">
          <Card>
            <SectionTitle title="Collect this room" subtitle={`${bsMonth} bill and payment in one screen.`} />
            {editMode && activeTenancy ? (
              <form action={collectRoomAction} className="space-y-4">
                <input type="hidden" name="roomId" value={room.id} />
                <input type="hidden" name="month" value={month} />
                <input type="hidden" name="year" value={year} />

                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Current meter reading" hint={`Last reading: ${currentCycle?.currentMeterReading ?? activeTenancy.startMeterReading ?? 0}`}>
                    <TextInput name="currentMeterReading" type="number" step="0.01" defaultValue={currentCycle?.currentMeterReading ?? activeTenancy.startMeterReading ?? 0} required />
                  </Field>
                  <Field label="Amount received now" hint="Enter 0 if you only want to create the bill first.">
                    <TextInput name="amountReceived" type="number" step="0.01" defaultValue={Math.max(totalDue, 0)} required />
                  </Field>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Payment date">
                    <TextInput name="paymentDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
                  </Field>
                  <Field label="Payment mode">
                    <Select name="paymentMode" defaultValue="CASH">
                      <option value="CASH">Cash</option>
                      <option value="BANK">Bank</option>
                      <option value="ESEWA">eSewa</option>
                      <option value="KHALTI">Khalti</option>
                      <option value="OTHER">Other</option>
                    </Select>
                  </Field>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Extra charge or discount" hint="Use + for extra charge, - for discount or correction.">
                    <TextInput name="adjustmentAmount" type="number" step="0.01" defaultValue="0" />
                  </Field>
                  <Field label="Reference"><TextInput name="referenceNote" placeholder="Txn id / note" /></Field>
                </div>

                <Field label="Notes"><TextArea name="note" placeholder="Optional note for this visit" className="min-h-[88px]" /></Field>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="submit" className="flex-1">Save collection</Button>
                  <Link href={nextRoomHref} className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200">
                    {nextRoomId ? "Skip to next room" : "Back to property"}
                  </Link>
                </div>
              </form>
            ) : (
              <EmptyState title="No active tenant or edit mode is off" text="You need an active tenant and edit mode to record collection." />
            )}
          </Card>

          <Card>
            <SectionTitle title="This month summary" subtitle="Simple breakdown before you save." />
            {currentCycle ? (
              <div className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Month</span>{bsMonth} · {currentCycle.month}/{currentCycle.year}</div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Meter</span>{currentCycle.previousMeterReading} → {currentCycle.currentMeterReading}</div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Electricity</span>{money(currentCycle.electricityAmount)}</div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Paid so far</span>{money(currentCycle.totalPaidAmount)}</div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Closing balance</span>{money(currentCycle.closingBalance)}</div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Credit used</span>{money(currentCycle.creditAppliedAmount)}</div>
              </div>
            ) : (
              <EmptyState title="No bill yet for this month" text="Enter the current meter reading above and save. The monthly bill will be created automatically." />
            )}
          </Card>

          <Card>
            <SectionTitle title="Recent payments" subtitle="Most recent receipts for this room." />
            <div className="space-y-3">
              {room.payments.length ? (
                room.payments.map((payment) => (
                  <div key={payment.id} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{money(payment.amount)} · {payment.paymentMode.toLowerCase()}</p>
                        <p className="text-sm text-slate-500">{bsDate(payment.paymentDate)}</p>
                      </div>
                      {payment.receipt ? <Link href={`/receipts/${payment.receipt.id}`} className="text-sm font-medium text-indigo-600">Receipt</Link> : null}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="No payments yet" text="Receipts will appear here after collection starts." />
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle title="Tenant + room" subtitle="Current tenant details and room facts." />
            {activeTenancy ? (
              <div className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Tenant</span>{activeTenancy.tenant.fullName}</div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Phone</span>{activeTenancy.tenant.phone || "—"}</div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Move in date</span>{shortDate(activeTenancy.startDate)}</div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Meter label</span>{room.meterLabel || "—"}</div>
              </div>
            ) : (
              <EmptyState title="Vacant room" text="Start a tenancy when a new tenant moves in." />
            )}
          </Card>

          <Card>
            <SectionTitle title="Billing history" subtitle="All months stay in the ledger." />
            <div className="space-y-3">
              {room.billingCycles.length ? (
                room.billingCycles.map((cycle) => (
                  <div key={cycle.id} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{cycle.month}/{cycle.year}</p>
                        <p className="text-sm text-slate-500">Meter {cycle.previousMeterReading} → {cycle.currentMeterReading} · {cycle.electricityUnits} units</p>
                      </div>
                      <Badge tone={cycle.closingBalance > 0 ? "red" : "green"}>{money(cycle.closingBalance)}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="No monthly bills yet" text="The first saved collection will create the billing history." />
              )}
            </div>
          </Card>

          <Card>
            <SectionTitle title={activeTenancy ? "End tenancy" : "Start tenancy"} subtitle={activeTenancy ? "Mark the room vacant when someone moves out." : "Attach a tenant to start collecting from this room."} />
            {editMode ? (
              activeTenancy ? (
                <form action={endTenancyAction} className="space-y-3">
                  <input type="hidden" name="roomId" value={room.id} />
                  <input type="hidden" name="tenancyId" value={activeTenancy.id} />
                  <Field label="End date"><TextInput name="endDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></Field>
                  <Field label="Move out note"><TextArea name="moveOutNotes" placeholder="Optional closing note" /></Field>
                  <Button type="submit" className="w-full">End tenancy</Button>
                </form>
              ) : (
                <form action={startTenancyAction} className="space-y-3">
                  <input type="hidden" name="roomId" value={room.id} />
                  <Field label="Tenant name"><TextInput name="fullName" required /></Field>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Phone"><TextInput name="phone" /></Field>
                    <Field label="ID / citizenship"><TextInput name="idNumber" /></Field>
                  </div>
                  <Field label="Permanent address"><TextInput name="permanentAddress" /></Field>
                  <Field label="Emergency contact"><TextInput name="emergencyContact" /></Field>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Rent"><TextInput name="startRent" type="number" step="0.01" defaultValue={room.currentDefaultRent} required /></Field>
                    <Field label="Water"><TextInput name="startWater" type="number" step="0.01" defaultValue={room.currentDefaultWater} required /></Field>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Start date"><TextInput name="startDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></Field>
                    <Field label="Meter reading at move-in" hint="Enter the live meter reading when the tenant enters.">
                      <TextInput name="startMeterReading" type="number" step="0.01" required />
                    </Field>
                  </div>
                  <Field label="Move in note"><TextArea name="moveInNotes" placeholder="Optional move-in note" /></Field>
                  <Field label="Tenant note"><TextArea name="tenantNotes" placeholder="Optional note about this tenant" /></Field>
                  <Button type="submit" className="w-full">Start tenancy</Button>
                </form>
              )
            ) : (
              <EmptyState title="View mode is on" text="Switch to edit mode when you want to update tenancy details." />
            )}
          </Card>

          {editMode ? (
            <Card>
              <SectionTitle title="Archive room" subtitle="No hard delete. History stays intact." />
              <form action={archiveRoomAction}>
                <input type="hidden" name="roomId" value={room.id} />
                <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-500">Archive room</Button>
              </form>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
