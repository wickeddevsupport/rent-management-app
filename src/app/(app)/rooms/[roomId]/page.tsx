import Link from "next/link";
import { notFound } from "next/navigation";
import { archiveRoomAction, collectRoomAction, endTenancyAction, startTenancyAction } from "@/app/actions";
import { BsDateInput } from "@/components/bs-date-input";
import { Badge, Button, Card, EmptyState, Field, PageHeader, SectionTitle, StatCard, TextArea, TextInput, Select } from "@/components/ui";
import { isEditMode } from "@/lib/auth";
import { availableCreditForRoom, getRoomDetail, outstandingForRoom } from "@/lib/data";
import { bsDate, bsMonthLabelFromDate, bsMonthLabelFromMonthYear, money, shortDate } from "@/lib/format";

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
      <section className="listing-hero overflow-hidden rounded-[32px] p-6 text-white shadow-[0_30px_90px_-40px_rgba(15,23,42,0.8)] sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Unit detail</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{room.property.name} · Room {room.roomNumber}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
              {activeTenancy ? `${activeTenancy.tenant.fullName} · ${activeTenancy.tenant.phone || "No phone added"}` : "Vacant right now. Start a tenancy when someone moves in."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone={roomStatusTone(room.status)}>{room.status.toLowerCase()}</Badge>
              <Badge tone={totalDue > 0 ? "red" : "green"}>{totalDue > 0 ? "Needs collection" : "Account settled"}</Badge>
              <Badge tone="blue">{bsMonth}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Due now</p>
              <p className="mt-2 text-xl font-semibold text-white">{money(totalDue)}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Advance</p>
              <p className="mt-2 text-xl font-semibold text-white">{money(credit)}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Current number</p>
              <p className="mt-2 text-xl font-semibold text-white">{liveElectricityNumber}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Next</p>
              <p className="mt-2 text-sm font-semibold text-white">{nextRoomId ? "Next room ready" : "Back to building"}</p>
            </div>
          </div>
        </div>
      </section>

      <PageHeader
        title="Collection surface"
        subtitle="This room now behaves more like a real unit detail: resident, utility baseline, amount due, and one dominant collection action."
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link href={`/properties/${room.propertyId}`} className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold !text-slate-800 transition hover:bg-slate-50 hover:!text-slate-800">
              Back to units
            </Link>
            <Link href={nextRoomHref} className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold !text-white transition hover:bg-slate-800 hover:!text-white">
              {nextRoomId ? "Next room" : "Back to building"}
            </Link>
          </div>
        }
      />

      {query.saved === "1" ? (
        <Card className="listing-card border-emerald-200 bg-emerald-50/90">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-emerald-950">Collection saved</h2>
              <p className="mt-1 text-sm text-emerald-800">Everything for {bsMonth} is stored. You can open the receipt or move straight to the next room.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {query.receiptId ? (
                <Link href={`/receipts/${query.receiptId}`} className="inline-flex h-12 items-center justify-center rounded-2xl border border-emerald-200 bg-white px-4 text-sm font-semibold !text-emerald-900 transition hover:bg-emerald-100 hover:!text-emerald-900">
                  Open receipt
                </Link>
              ) : null}
              <Link href={nextRoomHref} className="inline-flex h-12 items-center justify-center rounded-2xl bg-emerald-700 px-4 text-sm font-semibold !text-white transition hover:bg-emerald-600 hover:!text-white">
                {nextRoomId ? "Continue to next room" : "Back to building"}
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
          <Card className="premium-panel overflow-hidden p-0">
            <div className="border-b border-slate-200/80 px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Collect for this unit</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">One clean action surface</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Meter, payment, correction, and notes stay together so the collector never has to hunt around.</p>
                </div>
                <div className="rounded-3xl bg-slate-950 px-4 py-3 !text-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.8)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Amount due</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{money(totalDue)}</p>
                  <p className="mt-1 text-sm text-slate-300">Advance already accounted for</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-5 sm:px-6">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Rent</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{money(rentAmount)}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Water</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{money(waterAmount)}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Electricity</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{money(electricityAmount)}</p>
                  <p className="mt-1 text-xs text-slate-500">{currentCycle ? "Latest saved charge" : "Will calculate on save"}</p>
                </div>
                <div className="rounded-3xl bg-indigo-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">Current number</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{liveElectricityNumber}</p>
                  <p className="mt-1 text-xs text-slate-600">Last saved baseline {lastSavedNumber}</p>
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
                    <div className="rounded-3xl border border-slate-200 bg-white p-4">
                      <h3 className="text-base font-semibold text-slate-950">Live collection</h3>
                      <div className="mt-4 grid gap-4">
                        <Field label="Current electricity number" hint={`Last saved number: ${lastSavedNumber}`}>
                          <TextInput name="currentMeterReading" type="number" step="0.01" defaultValue={liveElectricityNumber} required />
                        </Field>
                        <Field label="Amount received now" hint="Enter 0 if you want to save the bill first and collect later.">
                          <TextInput name="amountReceived" type="number" step="0.01" defaultValue={Math.max(amountReceivedDefault, 0)} required />
                        </Field>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-4">
                      <h3 className="text-base font-semibold text-slate-950">Payment details</h3>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <Field label="Payment date">
                          <BsDateInput name="paymentDate" defaultValue={new Date()} required />
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
                    <div className="rounded-3xl border border-slate-200 bg-white p-4">
                      <h3 className="text-base font-semibold text-slate-950">Adjustments and notes</h3>
                      <div className="mt-4 grid gap-4">
                        <Field label="Extra charge or discount" hint="Use + for extra charge, - for discount or correction.">
                          <TextInput name="adjustmentAmount" type="number" step="0.01" defaultValue="0" />
                        </Field>
                        <Field label="Reference">
                          <TextInput name="referenceNote" placeholder="Txn id / short note" />
                        </Field>
                        <Field label="Visit note">
                          <TextArea name="note" placeholder="Optional note for this visit" className="min-h-[104px]" />
                        </Field>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-950 p-4 !text-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.8)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Primary action</p>
                      <p className="mt-2 text-lg font-semibold text-white">Save collection for this unit</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">If payment is entered, a receipt is created immediately. If amount is 0, only the bill is saved.</p>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <Button type="submit" variant="inverse" className="flex-1">Save collection</Button>
                        <Link href={nextRoomHref} className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-700 px-4 text-sm font-semibold !text-white transition hover:bg-slate-900 hover:!text-white">
                          {nextRoomId ? "Skip to next room" : "Back to building"}
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

          <Card className="listing-card">
            <SectionTitle title="Recent payments" subtitle="Latest payment activity for this unit." />
            <div className="space-y-3">
              {room.payments.length ? (
                room.payments.map((payment) => (
                  <div key={payment.id} className="rounded-3xl border border-slate-200 bg-white p-4">
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
          <Card className="listing-card">
            <SectionTitle title="Resident snapshot" subtitle="Who is here and what baseline the unit currently follows." />
            {activeTenancy ? (
              <div className="grid gap-4 text-sm !text-slate-800 sm:grid-cols-2">
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Resident</span>{activeTenancy.tenant.fullName}</div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Phone</span>{activeTenancy.tenant.phone || "—"}</div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Joined on</span>{shortDate(activeTenancy.startDate)}</div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Meter label</span>{room.meterLabel || "—"}</div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Move-in number</span>{activeTenancy.startMeterReading}</div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Live number</span>{liveElectricityNumber}</div>
              </div>
            ) : (
              <EmptyState title="Vacant unit" text="Start a tenancy when a new resident moves in." />
            )}
          </Card>

          <Card className="listing-card">
            <SectionTitle title="Monthly history" subtitle="Every saved month stays attached to the unit." />
            <div className="space-y-3">
              {room.billingCycles.length ? (
                room.billingCycles.map((cycle) => (
                  <div key={cycle.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{bsMonthLabelFromMonthYear(cycle.month, cycle.year)}</p>
                        <p className="mt-1 text-sm text-slate-500">Number {cycle.previousMeterReading} → {cycle.currentMeterReading} · {cycle.electricityUnits} units</p>
                      </div>
                      <Badge tone={cycle.closingBalance > 0 ? "red" : "green"}>{money(cycle.closingBalance)}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="No monthly bills yet" text="The first saved collection will create the monthly history." />
              )}
            </div>
          </Card>

          <Card className="listing-card">
            <SectionTitle title={activeTenancy ? "End tenancy" : "Start tenancy"} subtitle={activeTenancy ? "Mark the unit vacant when someone moves out." : "Attach a resident and initialize this unit from its real current state."} />
            {editMode ? (
              activeTenancy ? (
                <form action={endTenancyAction} className="space-y-3">
                  <input type="hidden" name="roomId" value={room.id} />
                  <input type="hidden" name="tenancyId" value={activeTenancy.id} />
                  <Field label="End date"><BsDateInput name="endDate" defaultValue={new Date()} required /></Field>
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
                  <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                    <h3 className="text-base font-semibold text-slate-950">Current starting point</h3>
                    <p className="mt-1 text-sm text-slate-500">Use the resident’s live situation today so the app can continue from the real state.</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <Field label="Joined on"><BsDateInput name="startDate" defaultValue={new Date()} required /></Field>
                      <Field label="Current electricity number" hint="Use the live number today. Future collections continue from here.">
                        <TextInput name="startMeterReading" type="number" step="0.01" defaultValue={currentCycle?.currentMeterReading ?? 0} required />
                      </Field>
                      <Field label="Current due already pending" hint="Any unpaid amount that exists before the first collection in this app.">
                        <TextInput name="openingBalance" type="number" step="0.01" defaultValue={room.openingBalance} />
                      </Field>
                      <Field label="Advance already with us" hint="If the resident already has advance/credit, enter it here.">
                        <TextInput name="advanceBalance" type="number" step="0.01" defaultValue={room.creditBalance} />
                      </Field>
                    </div>
                  </div>
                  <Field label="Move in note"><TextArea name="moveInNotes" placeholder="Optional move-in note" /></Field>
                  <Field label="Tenant note"><TextArea name="tenantNotes" placeholder="Optional note about this resident" /></Field>
                  <Button type="submit" className="w-full">Start tenancy</Button>
                </form>
              )
            ) : (
              <EmptyState title="View mode is on" text="Switch to edit mode when you want to update tenancy details." />
            )}
          </Card>

          {editMode ? (
            <Card className="listing-card">
              <SectionTitle title="Archive unit" subtitle="No hard delete. History stays intact." />
              <form action={archiveRoomAction}>
                <input type="hidden" name="roomId" value={room.id} />
                <Button type="submit" variant="danger" className="w-full">Archive room</Button>
              </form>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
