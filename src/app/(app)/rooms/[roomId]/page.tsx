import { notFound } from "next/navigation";
import { archiveRoomAction, collectRoomAction, endTenancyAction, startTenancyAction, updateRoomAction, updateTenantAction } from "@/app/actions";
import { BsDateInput } from "@/components/bs-date-input";
import { Badge, Button, Card, EmptyState, Field, LinkButton, PageHeader, SectionTitle, SegmentedTabs, Select, StatCard, TextArea, TextInput } from "@/components/ui";
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
  searchParams: Promise<{ saved?: string; receiptId?: string; tab?: string }>;
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
  const currentIndex = propertyRoomIds.findIndex((id: string) => id === room.id);
  const nextRoomId = currentIndex >= 0 ? propertyRoomIds[currentIndex + 1] : null;
  const nextRoomHref = nextRoomId ? `/rooms/${nextRoomId}` : `/properties/${room.propertyId}`;
  const bsMonth = bsMonthLabelFromDate(now);
  const liveElectricityNumber = currentCycle?.currentMeterReading ?? activeTenancy?.startMeterReading ?? 0;
  const lastSavedNumber = currentCycle?.previousMeterReading ?? activeTenancy?.startMeterReading ?? 0;
  const rentAmount = activeTenancy?.startRent ?? room.currentDefaultRent;
  const waterAmount = activeTenancy?.startWater ?? room.currentDefaultWater;
  const electricityAmount = currentCycle?.electricityAmount ?? 0;
  const amountReceivedDefault = totalDue > 0 ? totalDue : currentCycle?.closingBalance ?? 0;
  const currentTab = ["collect", "history", "resident", "manage"].includes(query.tab || "") ? (query.tab as "collect" | "history" | "resident" | "manage") : "collect";

  return (
    <div className="space-y-6">
      <section className="listing-hero overflow-hidden rounded-[36px] p-6 text-white sm:p-8 lg:p-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Unit detail</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{room.property.name} · Room {room.roomNumber}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              {activeTenancy ? `${activeTenancy.tenant.fullName} · ${activeTenancy.tenant.phone || "No phone added"}` : "Vacant right now. Start a tenancy when someone moves in."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge tone={roomStatusTone(room.status)}>{room.status.toLowerCase()}</Badge>
              <Badge tone={totalDue > 0 ? "red" : "green"}>{totalDue > 0 ? "Needs collection" : "Account settled"}</Badge>
              <Badge tone="blue">{bsMonth}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[520px]">
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Due now</p>
              <p className="mt-2 text-xl font-semibold text-white">{money(totalDue)}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Advance</p>
              <p className="mt-2 text-xl font-semibold text-white">{money(credit)}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Current number</p>
              <p className="mt-2 text-xl font-semibold text-white">{liveElectricityNumber}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Next</p>
              <p className="mt-2 text-sm font-semibold text-white">{nextRoomId ? "Next room ready" : "Back to building"}</p>
            </div>
          </div>
        </div>
      </section>

      <PageHeader
        title="Room collection"
        subtitle="Use tabs for collection, history, resident details, and management." 
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <LinkButton href={`/properties/${room.propertyId}`} variant="secondary">Back to units</LinkButton>
            <LinkButton href={nextRoomHref} variant="primary">{nextRoomId ? "Next room" : "Back to building"}</LinkButton>
          </div>
        }
      />

      <SegmentedTabs
        tabs={[
          { label: "Collect", href: `/rooms/${room.id}?tab=collect`, active: currentTab === "collect" },
          { label: "History", href: `/rooms/${room.id}?tab=history`, active: currentTab === "history" },
          { label: "Resident", href: `/rooms/${room.id}?tab=resident`, active: currentTab === "resident" },
          { label: "Manage", href: `/rooms/${room.id}?tab=manage`, active: currentTab === "manage" },
        ]}
      />

      {query.saved === "1" ? (
        <Card className="listing-card border-emerald-200 bg-emerald-50/90">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-emerald-950">Collection saved</h2>
              <p className="mt-1 text-sm text-emerald-800">Saved for {bsMonth}. Open the receipt or continue to the next room.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {query.receiptId ? <LinkButton href={`/receipts/${query.receiptId}`} variant="secondary">Open receipt</LinkButton> : null}
              <LinkButton href={nextRoomHref} variant="primary">{nextRoomId ? "Continue to next room" : "Back to building"}</LinkButton>
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

      {currentTab === "collect" ? (
        <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
          <Card className="premium-panel overflow-hidden p-0">
            <div className="border-b border-slate-200/80 px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Collection</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Current month entry</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Enter meter reading, payment, adjustment, and visit note.</p>
                </div>
                <div className="surface-dark rounded-3xl px-4 py-3 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.8)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Amount due</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{money(totalDue)}</p>
                  <p className="mt-1 text-sm text-slate-300">After advance credit</p>
                </div>
              </div>
            </div>

            {editMode && activeTenancy ? (
              <form action={collectRoomAction} className="px-5 py-5 sm:px-6">
                <input type="hidden" name="roomId" value={room.id} />
                <input type="hidden" name="month" value={month} />
                <input type="hidden" name="year" value={year} />

                <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
                  <div className="space-y-4">
                    <div className="surface-subtle rounded-3xl p-4">
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

                    <div className="surface-subtle rounded-3xl p-4">
                      <h3 className="text-base font-semibold text-slate-950">Payment details</h3>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <Field label="Payment date"><BsDateInput name="paymentDate" defaultValue={new Date()} required /></Field>
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
                    <div className="surface-subtle rounded-3xl p-4">
                      <h3 className="text-base font-semibold text-slate-950">Adjustments and notes</h3>
                      <div className="mt-4 grid gap-4">
                        <Field label="Extra charge or discount" hint="Use + for extra charge, - for discount or correction.">
                          <TextInput name="adjustmentAmount" type="number" step="0.01" defaultValue="0" />
                        </Field>
                        <Field label="Reference"><TextInput name="referenceNote" placeholder="Txn id / short note" /></Field>
                        <Field label="Visit note"><TextArea name="note" placeholder="Optional note for this visit" className="min-h-[104px]" /></Field>
                      </div>
                    </div>

                    <div className="surface-dark rounded-3xl p-4 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.8)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Primary action</p>
                      <p className="mt-2 text-lg font-semibold text-white">Save collection for this unit</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">Add payment to create a receipt immediately. Enter 0 to save the bill first and collect later.</p>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <Button type="submit" variant="inverse" className="flex-1">Save collection</Button>
                        <LinkButton href={nextRoomHref} variant="glass" className="flex-1">{nextRoomId ? "Skip to next room" : "Back to building"}</LinkButton>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="px-5 py-5 sm:px-6">
                <EmptyState title="No active tenant or edit mode is off" text="You need an active tenant and edit mode to record collection." />
              </div>
            )}
          </Card>

          <div className="space-y-6">
            <Card className="listing-card">
              <SectionTitle title="Collection summary" subtitle="Current amounts for this room." />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="surface-subtle rounded-3xl p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Rent</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{money(rentAmount)}</p>
                </div>
                <div className="surface-subtle rounded-3xl p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Water</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{money(waterAmount)}</p>
                </div>
                <div className="surface-subtle rounded-3xl p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Electricity charge</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{money(electricityAmount)}</p>
                  <p className="mt-1 text-xs text-slate-500">{currentCycle ? "Latest saved charge" : "Will calculate on save"}</p>
                </div>
                <div className="surface-subtle rounded-3xl p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Current number</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{liveElectricityNumber}</p>
                  <p className="mt-1 text-xs text-slate-500">Baseline {lastSavedNumber}</p>
                </div>
              </div>
            </Card>

            <Card className="listing-card">
              <SectionTitle title="Resident summary" subtitle="Current resident and room details." />
              {activeTenancy ? (
                <div className="grid gap-4 text-sm sm:grid-cols-2">
                  <div><span className="block text-xs uppercase tracking-wide text-slate-400">Resident</span><span className="text-slate-950">{activeTenancy.tenant.fullName}</span></div>
                  <div><span className="block text-xs uppercase tracking-wide text-slate-400">Phone</span><span className="text-slate-950">{activeTenancy.tenant.phone || "—"}</span></div>
                  <div><span className="block text-xs uppercase tracking-wide text-slate-400">Joined on</span><span className="text-slate-950">{shortDate(activeTenancy.startDate)}</span></div>
                  <div><span className="block text-xs uppercase tracking-wide text-slate-400">Meter label</span><span className="text-slate-950">{room.meterLabel || "—"}</span></div>
                </div>
              ) : (
                <EmptyState title="Vacant unit" text="Start a tenancy when a new resident moves in." />
              )}
            </Card>
          </div>
        </div>
      ) : null}

      {currentTab === "history" ? (
        <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
          <Card className="listing-card">
            <SectionTitle title="Recent payments" subtitle="Latest payment activity for this unit." />
            <div className="space-y-3">
              {room.payments.length ? (
                room.payments.map((payment) => (
                  <div key={payment.id} className="surface-subtle rounded-3xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{money(payment.amount)} · {payment.paymentMode.toLowerCase()}</p>
                        <p className="mt-1 text-sm text-slate-500">{bsDate(payment.paymentDate)}</p>
                      </div>
                      {payment.receipt ? <LinkButton href={`/receipts/${payment.receipt.id}`} variant="secondary" className="h-10 px-3 text-xs">Receipt</LinkButton> : null}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="No payments yet" text="Receipts will appear here after collection starts." />
              )}
            </div>
          </Card>

          <Card className="listing-card">
            <SectionTitle title="Monthly history" subtitle="Every saved month stays attached to the unit." />
            <div className="space-y-3">
              {room.billingCycles.length ? (
                room.billingCycles.map((cycle) => (
                  <div key={cycle.id} className="surface-subtle rounded-3xl p-4">
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
        </div>
      ) : null}

      {currentTab === "resident" ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
          <Card className="listing-card">
            <SectionTitle title="Resident details" subtitle="Current resident and billing baseline." />
            {activeTenancy ? (
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Resident</span><span className="text-slate-950">{activeTenancy.tenant.fullName}</span></div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Phone</span><span className="text-slate-950">{activeTenancy.tenant.phone || "—"}</span></div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Joined on</span><span className="text-slate-950">{shortDate(activeTenancy.startDate)}</span></div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Meter label</span><span className="text-slate-950">{room.meterLabel || "—"}</span></div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Move-in number</span><span className="text-slate-950">{activeTenancy.startMeterReading}</span></div>
                <div><span className="block text-xs uppercase tracking-wide text-slate-400">Live number</span><span className="text-slate-950">{liveElectricityNumber}</span></div>
              </div>
            ) : (
              <EmptyState title="Vacant unit" text="Start a tenancy when a new resident moves in." />
            )}
          </Card>

          <Card className="listing-card">
            <SectionTitle title="Room details" subtitle="Current room status and latest billing state." />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="surface-subtle rounded-3xl p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">{room.status}</p>
              </div>
              <div className="surface-subtle rounded-3xl p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Current due</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">{money(totalDue)}</p>
              </div>
              <div className="surface-subtle rounded-3xl p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Advance credit</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">{money(credit)}</p>
              </div>
              <div className="surface-subtle rounded-3xl p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Latest month</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">{currentCycle ? bsMonthLabelFromMonthYear(currentCycle.month, currentCycle.year) : "Not saved"}</p>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {currentTab === "manage" ? (
        <div className="grid gap-6 xl:grid-cols-[1fr,0.78fr]">
          <div className="space-y-6">
            <Card className="listing-card">
              <SectionTitle
                title={activeTenancy ? "Edit resident" : "Start tenancy"}
                subtitle={activeTenancy ? "Update resident details and current tenancy baseline." : "Attach a resident and initialize this unit from its real current state."}
              />
              {editMode ? (
                activeTenancy ? (
                  <form action={updateTenantAction} className="space-y-3">
                    <input type="hidden" name="roomId" value={room.id} />
                    <input type="hidden" name="tenantId" value={activeTenancy.tenant.id} />
                    <input type="hidden" name="tenancyId" value={activeTenancy.id} />
                    <Field label="Tenant name"><TextInput name="fullName" required defaultValue={activeTenancy.tenant.fullName} /></Field>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field label="Phone"><TextInput name="phone" defaultValue={activeTenancy.tenant.phone || ""} /></Field>
                      <Field label="ID / citizenship"><TextInput name="idNumber" defaultValue={activeTenancy.tenant.idNumber || ""} /></Field>
                    </div>
                    <Field label="Permanent address"><TextInput name="permanentAddress" defaultValue={activeTenancy.tenant.permanentAddress || ""} /></Field>
                    <Field label="Emergency contact"><TextInput name="emergencyContact" defaultValue={activeTenancy.tenant.emergencyContact || ""} /></Field>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field label="Rent"><TextInput name="startRent" type="number" step="0.01" defaultValue={activeTenancy.startRent} required /></Field>
                      <Field label="Water"><TextInput name="startWater" type="number" step="0.01" defaultValue={activeTenancy.startWater} required /></Field>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field label="Joined on"><BsDateInput name="startDate" defaultValue={activeTenancy.startDate} required /></Field>
                      <Field label="Move-in meter number"><TextInput name="startMeterReading" type="number" step="0.01" defaultValue={activeTenancy.startMeterReading} required /></Field>
                    </div>
                    <Field label="Move in note"><TextArea name="moveInNotes" defaultValue={activeTenancy.moveInNotes || ""} placeholder="Optional move-in note" /></Field>
                    <Field label="Tenant note"><TextArea name="tenantNotes" defaultValue={activeTenancy.tenant.notes || ""} placeholder="Optional note about this resident" /></Field>
                    <Button type="submit" className="w-full">Save resident</Button>
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
                    <div className="surface-subtle rounded-3xl p-4">
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

            {activeTenancy && editMode ? (
              <Card className="listing-card">
                <SectionTitle title="End tenancy" subtitle="Mark the unit vacant when someone moves out." />
                <form action={endTenancyAction} className="space-y-3">
                  <input type="hidden" name="roomId" value={room.id} />
                  <input type="hidden" name="tenancyId" value={activeTenancy.id} />
                  <Field label="End date"><BsDateInput name="endDate" defaultValue={new Date()} required /></Field>
                  <Field label="Move out note"><TextArea name="moveOutNotes" placeholder="Optional closing note" /></Field>
                  <Button type="submit" className="w-full">End tenancy</Button>
                </form>
              </Card>
            ) : null}
          </div>

          <div className="space-y-6">
            <Card className="listing-card">
              <SectionTitle title="Edit room" subtitle="Update unit defaults and display details." />
              {editMode ? (
                <form action={updateRoomAction} className="space-y-3">
                  <input type="hidden" name="roomId" value={room.id} />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Room number"><TextInput name="roomNumber" required defaultValue={room.roomNumber} /></Field>
                    <Field label="Label"><TextInput name="roomLabel" defaultValue={room.roomLabel || ""} /></Field>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Default rent"><TextInput name="currentDefaultRent" type="number" step="0.01" required defaultValue={room.currentDefaultRent} /></Field>
                    <Field label="Default water"><TextInput name="currentDefaultWater" type="number" step="0.01" required defaultValue={room.currentDefaultWater} /></Field>
                  </div>
                  <Field label="Meter label"><TextInput name="meterLabel" defaultValue={room.meterLabel || ""} /></Field>
                  <Field label="Notes"><TextArea name="notes" defaultValue={room.notes || ""} placeholder="Optional room notes" /></Field>
                  <Button type="submit" className="w-full">Save room</Button>
                </form>
              ) : (
                <EmptyState title="Edit mode is off" text="Turn on edit mode to update room details." />
              )}
            </Card>

            <Card className="listing-card">
              <SectionTitle title="Actions" subtitle="Archive and tenancy changes." />
              {editMode ? (
                <form action={archiveRoomAction}>
                  <input type="hidden" name="roomId" value={room.id} />
                  <Button type="submit" variant="danger" className="w-full">Archive room</Button>
                </form>
              ) : (
                <EmptyState title="Edit mode is off" text="Turn on edit mode to archive or change tenancy state." />
              )}
            </Card>

            <Card className="listing-card">
              <SectionTitle title="Current room state" subtitle="Due amount and latest meter number." />
              <div className="grid gap-3">
                <div className="surface-subtle rounded-3xl p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Due now</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">{money(totalDue)}</p>
                </div>
                <div className="surface-subtle rounded-3xl p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Current number</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">{liveElectricityNumber}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
