import Link from "next/link";
import { notFound } from "next/navigation";
import { addPaymentAction, archiveRoomAction, createBillingCycleAction, endTenancyAction, startTenancyAction } from "@/app/actions";
import { isEditMode } from "@/lib/auth";
import { availableCreditForRoom, getRoomDetail, outstandingForRoom } from "@/lib/data";
import { money, monthLabel, shortDate } from "@/lib/format";
import { Badge, Button, Card, EmptyState, Field, PageHeader, SectionTitle, StatCard, TextArea, TextInput, Select } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function RoomDetailPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const room = await getRoomDetail(roomId);
  if (!room) notFound();
  const editMode = await isEditMode();
  const activeTenancy = room.tenancies.find((tenancy) => tenancy.isActive) || null;
  const totalDue = outstandingForRoom(room);
  const credit = availableCreditForRoom(room);
  const currentCycle = room.billingCycles[0] || null;
  const now = new Date();

  return (
    <div className="space-y-6">
      <PageHeader title={`${room.property.name} · Room ${room.roomNumber}`} subtitle={activeTenancy ? `${activeTenancy.tenant.fullName} · ${activeTenancy.tenant.phone || "No phone added"}` : "No active tenant in this room right now."} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total due" value={money(totalDue)} tone={totalDue > 0 ? "danger" : "success"} />
        <StatCard label="Advance credit" value={money(credit)} tone="info" />
        <StatCard label="Current rent" value={money(activeTenancy?.startRent ?? room.currentDefaultRent)} />
        <StatCard label="Current water" value={money(activeTenancy?.startWater ?? room.currentDefaultWater)} />
      </section>

      {currentCycle ? (
        <Card>
          <SectionTitle title={`Current month · ${monthLabel(currentCycle.month, currentCycle.year)}`} subtitle="Manual electricity entry, payment progress, and closing balance." />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 text-sm text-slate-700">
            <div><span className="block text-xs uppercase tracking-wide text-slate-400">Opening balance</span>{money(currentCycle.openingBalance)}</div>
            <div><span className="block text-xs uppercase tracking-wide text-slate-400">Room rent</span>{money(currentCycle.roomRentAmount)}</div>
            <div><span className="block text-xs uppercase tracking-wide text-slate-400">Water</span>{money(currentCycle.waterAmount)}</div>
            <div><span className="block text-xs uppercase tracking-wide text-slate-400">Electricity</span>{money(currentCycle.electricityAmount)}</div>
            <div><span className="block text-xs uppercase tracking-wide text-slate-400">Meter readings</span>{currentCycle.previousMeterReading} → {currentCycle.currentMeterReading}</div>
            <div><span className="block text-xs uppercase tracking-wide text-slate-400">Units</span>{currentCycle.electricityUnits}</div>
            <div><span className="block text-xs uppercase tracking-wide text-slate-400">Paid so far</span>{money(currentCycle.totalPaidAmount)}</div>
            <div><span className="block text-xs uppercase tracking-wide text-slate-400">Closing balance</span>{money(currentCycle.closingBalance)}</div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-6">
          <Card>
            <SectionTitle title="Tenant + room" subtitle="Current tenant details and quick room facts." />
            {activeTenancy ? (
              <div className="grid gap-4 md:grid-cols-2 text-sm text-slate-700">
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
            <SectionTitle title="Monthly bills" subtitle="Every billing cycle stays in the ledger and can be inspected later." />
            <div className="space-y-3">
              {room.billingCycles.length ? room.billingCycles.map((cycle) => (
                <div key={cycle.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{monthLabel(cycle.month, cycle.year)}</p>
                      <p className="text-sm text-slate-500">Meter {cycle.previousMeterReading} → {cycle.currentMeterReading} · {cycle.electricityUnits} units</p>
                    </div>
                    <Badge tone={cycle.closingBalance > 0 ? "red" : "green"}>{money(cycle.closingBalance)}</Badge>
                  </div>
                </div>
              )) : <EmptyState title="No monthly bills yet" text="Create the first monthly bill after you enter the meter reading." />}
            </div>
          </Card>

          <Card>
            <SectionTitle title="Payments + receipts" subtitle="Each payment creates a shareable receipt page." />
            <div className="space-y-3">
              {room.payments.length ? room.payments.map((payment) => (
                <div key={payment.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{money(payment.amount)} · {payment.paymentMode.toLowerCase()}</p>
                      <p className="text-sm text-slate-500">{shortDate(payment.paymentDate)} · recorded by {payment.enteredByUser.name}</p>
                    </div>
                    {payment.receipt ? <Link href={`/receipts/${payment.receipt.id}`} className="text-sm font-medium text-indigo-600">Open receipt</Link> : null}
                  </div>
                </div>
              )) : <EmptyState title="No payments yet" text="Once you add a payment, the receipt link will appear here." />}
            </div>
          </Card>

          <Card>
            <SectionTitle title="Tenancy history" subtitle="Room stays stable while tenants can change over time." />
            <div className="space-y-3">
              {room.tenancies.length ? room.tenancies.map((tenancy) => (
                <div key={tenancy.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{tenancy.tenant.fullName}</p>
                      <p className="text-sm text-slate-500">{shortDate(tenancy.startDate)} → {tenancy.endDate ? shortDate(tenancy.endDate) : "Present"}</p>
                    </div>
                    <Badge tone={tenancy.isActive ? "green" : "neutral"}>{tenancy.isActive ? "active" : "past"}</Badge>
                  </div>
                </div>
              )) : <EmptyState title="No tenancy history yet" text="This room hasn’t had any tenant records yet." />}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle title="Add monthly bill" subtitle="Manual electricity reading for the selected month." />
            {editMode && activeTenancy ? (
              <form action={createBillingCycleAction} className="space-y-3">
                <input type="hidden" name="roomId" value={room.id} />
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Month"><TextInput name="month" type="number" min="1" max="12" defaultValue={now.getMonth() + 1} required /></Field>
                  <Field label="Year"><TextInput name="year" type="number" defaultValue={now.getFullYear()} required /></Field>
                </div>
                <Field label="Current meter reading"><TextInput name="currentMeterReading" type="number" step="0.01" required /></Field>
                <Field label="Manual adjustment"><TextInput name="adjustmentAmount" type="number" step="0.01" defaultValue="0" /></Field>
                <Field label="Note"><TextArea name="note" placeholder="Optional monthly note" /></Field>
                <Button type="submit" className="w-full">Create bill</Button>
              </form>
            ) : (
              <EmptyState title="No active tenant or edit mode is off" text="You need an active tenant and edit mode to create a monthly bill." />
            )}
          </Card>

          <Card>
            <SectionTitle title="Add payment" subtitle="Payment auto-clears oldest due first, then stores extra as advance credit." />
            {editMode && activeTenancy ? (
              <form action={addPaymentAction} className="space-y-3">
                <input type="hidden" name="roomId" value={room.id} />
                <Field label="Amount"><TextInput name="amount" type="number" step="0.01" required /></Field>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Payment date"><TextInput name="paymentDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></Field>
                  <Field label="Mode">
                    <Select name="paymentMode" defaultValue="CASH">
                      <option value="CASH">Cash</option>
                      <option value="BANK">Bank</option>
                      <option value="ESEWA">eSewa</option>
                      <option value="KHALTI">Khalti</option>
                      <option value="OTHER">Other</option>
                    </Select>
                  </Field>
                </div>
                <Field label="Apply to specific month (optional)">
                  <Select name="billingCycleId" defaultValue="">
                    <option value="">Auto apply oldest due first</option>
                    {room.billingCycles.filter((cycle) => cycle.closingBalance > 0).map((cycle) => (
                      <option key={cycle.id} value={cycle.id}>{monthLabel(cycle.month, cycle.year)} · {money(cycle.closingBalance)}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Reference"><TextInput name="referenceNote" placeholder="Transaction id / note" /></Field>
                <Field label="Notes"><TextArea name="notes" placeholder="Optional payment note" /></Field>
                <Button type="submit" className="w-full">Save payment + receipt</Button>
              </form>
            ) : (
              <EmptyState title="No active tenant or edit mode is off" text="You need an active tenant and edit mode to record payments." />
            )}
          </Card>

          <Card>
            <SectionTitle title={activeTenancy ? "End tenancy" : "Start tenancy"} subtitle={activeTenancy ? "Archive the current stay and mark the room vacant." : "Add the tenant details and attach them to this room."} />
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
                    <Field label="Starting meter"><TextInput name="startMeterReading" type="number" step="0.01" defaultValue="0" /></Field>
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
              <SectionTitle title="Archive room" subtitle="No hard delete. Room history stays intact and can be restored later if needed." />
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
