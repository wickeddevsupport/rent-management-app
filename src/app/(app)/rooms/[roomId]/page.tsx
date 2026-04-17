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
  const liveElectricityNumber = currentCycle?.currentMeterReading ?? activeTenancy?.startMeterReading ?? 0;
  const lastSavedNumber = currentCycle?.previousMeterReading ?? activeTenancy?.startMeterReading ?? 0;
  const rentAmount = activeTenancy?.startRent ?? room.currentDefaultRent;
  const waterAmount = activeTenancy?.startWater ?? room.currentDefaultWater;
  const electricityAmount = currentCycle?.electricityAmount ?? 0;
  const amountReceivedDefault = totalDue > 0 ? totalDue : currentCycle?.closingBalance ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${room.property.name} · Room ${room.roomNumber}`}
        subtitle={activeTenancy ? `${activeTenancy.tenant.fullName} · ${activeTenancy.tenant.phone || "No phone added"}` : "No active tenant in this room right now."}
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link href={`/properties/${room.propertyId}`} className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Back to rooms
            </Link>
            <Badge tone={roomStatusTone(room.status)}>{room.status.toLowerCase()}</Badge>
          </div>
        }
      />

      {query.saved === "1" ? (
        <Card className="border-emerald-200 bg-emerald-50/90">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-emerald-950">Saved successfully</h2>
              <p className="mt-1 text-sm text-emerald-800">Collection saved for {bsMonth}. You can move straight to the next room.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {query.receiptId ? (
                <Link href={`/receipts/${query.receiptId}`} className="inline-flex h-12 items-center justify-center rounded-2xl border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100">
                  Open receipt
                </Link>
              ) : null}
              <Link href={nextRoomHref} className="inline-flex h-12 items-center justify-center rounded-2xl bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-600">
                {nextRoomId ? "Next room" : "Back to property"}
              </Link>
            </div>
          </div>
        </Card>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Due now" value={money(totalDue)} tone={totalDue > 0 ? "danger" : "success"} />
        <StatCard label="Advance credit" value={money(credit)} tone="info" />
        <StatCard label="Rent" value={money(rentAmount)} />
        <StatCard label="Water" value={money(waterAmount)} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-6">
          <Card className="premium-panel collection-hero overflow-hidden p-0">
            <div className="border-b border-slate-200/80 px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Collection card</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Everything needed for this room, in one place</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Clear charges, clear due amount, and one save action. No extra admin-looking clutter.</p>
                </div>
                <div className="rounded-3xl bg-slate-950 px-4 py-3 text-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.8)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Current month</p>
                  <p className="mt-1 text-lg font-semibold">{bsMonth}</p>
                  <p className="mt-1 text-sm text-slate-300">Due {money(totalDue)}</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-5 sm:px-6">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Rent</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{money(rentAmount)}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Water</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{money(waterAmount)}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Electricity</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{money(electricityAmount)}</p>
                  <p className="mt-1 text-xs text-slate-500">{currentCycle ? "Latest saved charge" : "Will update after save"}</p>
                </div>
                <div className="rounded-3xl border border-indigo-200 bg-indigo-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">Amount due</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{money(totalDue)}</p>
                  <p className="mt-1 text-xs text-slate-600">Advance credit already accounted for</p>
                </div>
              </div>
            </div>

            {editMode && activeTenancy ? (
              <form action={collectRoomAction} className="border-t border-slate-200/80 px-5 py-5 sm:px-6">
                <input type="hidden" name="roomId" value={room.id} />
                <input type="hidden" name="month" value={month} />
                <input type="hidden" name="year" value={year} />

                <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
                  <div className="space-y-4">
                    <div className="rounded-3xl border border-slate-200 bg-white/92 p-4">
                      <h3 className="text-base font-semibold text-slate-950">Collection details</h3>
                      <div className="mt-4 grid gap-4">
                        <Field label="Current electricity number" hint={`Last saved number: ${lastSavedNumber}`}>
                          <TextInput name="currentMeterReading" type="number" step="0.01" defaultValue={liveElectricityNumber} required />
                        </Field>
                        <Field label="Amount received now" hint="Enter 0 if the bill is being saved without payment today.">
                          <TextInput name="amountReceived" type="number" step="0.01" defaultValue={Math.max(amountReceivedDefault, 0)} required />
                        </Field>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white/92 p-4">
                      <h3 className="text-base font-semibold text-slate-950">Payment details</h3>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
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
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl border border-slate-200 bg-white/92 p-4">
                      <h3 className="text-base font-semibold text-slate-950">Optional corrections</h3>
                      <div className="mt-4 grid gap-4">
                        <Field label="Extra charge or discount" hint="Use + for extra charge, - for discount or correction.">
                          <TextInput name="adjustmentAmount" type="number" step="0.01" defaultValue="0" />
                        </Field>
                        <Field label="Reference">
                          <TextInput name="referenceNote" placeholder="Txn id / short note" />
                        </Field>
                        <Field label="Notes">
                          <TextArea name="note" placeholder="Optional note for this visit" className="min-h-[104px]" />
                        </Field>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-950 p-4 text-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.8)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Ready to save</p>
                      <p className="mt-2 text-lg font-semibold">Bill and collection will be recorded together.</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">If payment is entered, a receipt is created immediately. If amount is 0, only the bill is saved.</p>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <Button type="submit" className="flex-1 bg-white text-slate-950 hover:bg-slate-100">Save collection</Button>
                        <Link href={nextRoomHref} className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-700 px-4 text-sm font-semibold text-white transition hover:bg-slate-900">
                          {nextRoomId ? "Skip to next room" : "Back to property"}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="border-t border-slate-200/80 px-5 py-5 sm:px-6">
                <EmptyState title="No active tenant or edit mode is off" text="You need an active tenant and edit mode to record collection." />
              </div>
            )}
          </Card>

          <Card>
            <SectionTitle title="Recent payments" subtitle="Most recent receipts for this room." />
            <div className="space-y-3">
              {room.payments.length ? (
                room.payments.map((payment) => (
                  <div key={payment.id} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{money(payment.amount)} · {payment.paymentMode.toLowerCase()}</p>
                        <p className="mt-1 text-sm text-slate-500">{bsDate(payment.paymentDate)}</p>
                      </div>
                      {payment.receipt ? <Link href={`/receipts/${payment.receipt.id}`} className="text-sm font-semibold text-indigo-700">Receipt</Link> : null}
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
            <SectionTitle title="Room snapshot" subtitle="Current tenant and latest collection baseline." />
            {activeTenancy ? (
              <div className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Tenant</span>{activeTenancy.tenant.fullName}</div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Phone</span>{activeTenancy.tenant.phone || "—"}</div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Move in date</span>{shortDate(activeTenancy.startDate)}</div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Meter label</span>{room.meterLabel || "—"}</div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Move-in electricity number</span>{activeTenancy.startMeterReading}</div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Latest saved number</span>{liveElectricityNumber}</div>
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
                  <div key={cycle.id} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{cycle.month}/{cycle.year}</p>
                        <p className="mt-1 text-sm text-slate-500">Number {cycle.previousMeterReading} → {cycle.currentMeterReading} · {cycle.electricityUnits} units</p>
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
                    <Field label="Electricity number at move-in" hint="Enter the live number when the tenant enters.">
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
                <Button type="submit" className="w-full bg-rose-600 text-white hover:bg-rose-500">Archive room</Button>
              </form>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
