"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BillingStatus, PaymentMode, RoomStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { nextReceiptNumber } from "@/lib/data";
import { requireAdminUser, setEditMode, signInWithPassword, signOut } from "@/lib/auth";

function toNumber(value: FormDataEntryValue | null, fallback = 0) {
  const text = String(value ?? "").trim();
  if (!text) return fallback;
  const num = Number(text);
  return Number.isFinite(num) ? num : fallback;
}

function requireNumber(value: FormDataEntryValue | null, fieldName: string) {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new Error(`${fieldName} is required`);
  }
  const num = Number(text);
  if (!Number.isFinite(num)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  return num;
}

function toDate(value: FormDataEntryValue | null, fallback = new Date()) {
  const text = String(value ?? "").trim();
  if (!text) return fallback;
  const d = new Date(text);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

function cycleStatus(balance: number) {
  if (balance <= 0) return BillingStatus.PAID;
  return BillingStatus.PARTIAL;
}

async function buildBillingCycleForRoom({
  roomId,
  month,
  year,
  currentMeterReading,
  adjustmentAmount,
  note,
  userId,
}: {
  roomId: string;
  month: number;
  year: number;
  currentMeterReading: number;
  adjustmentAmount: number;
  note: string | null;
  userId: string;
}) {
  const room = await db.room.findUnique({
    where: { id: roomId },
    include: {
      property: true,
      tenancies: { where: { isActive: true } },
      billingCycles: { orderBy: [{ year: "desc" }, { month: "desc" }] },
    },
  });
  if (!room) return null;

  const exists = room.billingCycles.find((cycle) => cycle.month === month && cycle.year === year);
  if (exists) {
    return { room, cycle: exists, created: false };
  }

  const activeTenancy = room.tenancies[0] || null;
  const lastCycle = room.billingCycles[0] || null;
  const previousMeterReading = lastCycle ? lastCycle.currentMeterReading : activeTenancy?.startMeterReading || 0;
  const openingBalance = lastCycle ? lastCycle.closingBalance : room.openingBalance;
  const roomRentAmount = activeTenancy?.startRent ?? room.currentDefaultRent;
  const waterAmount = activeTenancy?.startWater ?? room.currentDefaultWater;
  const electricityUnits = Math.max(currentMeterReading - previousMeterReading, 0);
  const electricityRate = room.property.defaultElectricityRate;
  const electricityAmount = electricityUnits * electricityRate;
  const grossTotal = openingBalance + roomRentAmount + waterAmount + electricityAmount + adjustmentAmount;
  const creditAppliedAmount = Math.min(room.creditBalance, grossTotal);
  const closingBalance = grossTotal - creditAppliedAmount;

  const cycle = await db.billingCycle.create({
    data: {
      roomId,
      tenancyId: activeTenancy?.id || null,
      month,
      year,
      openingBalance,
      roomRentAmount,
      waterAmount,
      previousMeterReading,
      currentMeterReading,
      electricityUnits,
      electricityRate,
      electricityAmount,
      adjustmentAmount,
      totalChargeAmount: grossTotal,
      totalPaidAmount: 0,
      closingBalance,
      creditAppliedAmount,
      status: cycleStatus(closingBalance),
      notes: note,
    },
  });

  if (creditAppliedAmount > 0) {
    await db.room.update({ where: { id: roomId }, data: { creditBalance: room.creditBalance - creditAppliedAmount } });
  }

  await db.ledgerEntry.createMany({
    data: [
      { roomId, billingCycleId: cycle.id, createdByUserId: userId, entryType: "monthly_rent", amount: roomRentAmount, direction: "debit", description: `Room rent added for ${month}/${year}` },
      { roomId, billingCycleId: cycle.id, createdByUserId: userId, entryType: "water_charge", amount: waterAmount, direction: "debit", description: `Water charge added for ${month}/${year}` },
      { roomId, billingCycleId: cycle.id, createdByUserId: userId, entryType: "electricity_charge", amount: electricityAmount, direction: "debit", description: `${electricityUnits} units x ${electricityRate}` },
      ...(creditAppliedAmount > 0 ? [{ roomId, billingCycleId: cycle.id, createdByUserId: userId, entryType: "credit_applied", amount: creditAppliedAmount, direction: "credit", description: "Advance credit applied" }] : []),
    ],
  });

  return { room, cycle, created: true };
}

async function recordPaymentForRoom({
  roomId,
  amount,
  paymentDate,
  paymentMode,
  referenceNote,
  notes,
  targetedCycleId,
  userId,
}: {
  roomId: string;
  amount: number;
  paymentDate: Date;
  paymentMode: PaymentMode;
  referenceNote: string | null;
  notes: string | null;
  targetedCycleId?: string | null;
  userId: string;
}) {
  const room = await db.room.findUnique({
    where: { id: roomId },
    include: {
      tenancies: { where: { isActive: true } },
      billingCycles: { where: { closingBalance: { gt: 0 } }, orderBy: [{ year: "asc" }, { month: "asc" }] },
    },
  });
  if (!room) return null;

  const payment = await db.payment.create({
    data: {
      roomId,
      tenancyId: room.tenancies[0]?.id || null,
      paymentDate,
      amount,
      paymentMode,
      referenceNote,
      notes,
      enteredByUserId: userId,
    },
  });

  const orderedCycles = [...room.billingCycles];
  if (targetedCycleId) {
    orderedCycles.sort((a, b) => {
      if (a.id === targetedCycleId) return -1;
      if (b.id === targetedCycleId) return 1;
      return 0;
    });
  }

  let remaining = amount;
  let order = 1;
  for (const cycle of orderedCycles) {
    if (remaining <= 0) break;
    const allocatable = Math.min(cycle.closingBalance, remaining);
    if (allocatable <= 0) continue;
    await db.paymentAllocation.create({
      data: {
        paymentId: payment.id,
        billingCycleId: cycle.id,
        allocatedAmount: allocatable,
        allocationOrder: order++,
      },
    });
    const newPaid = cycle.totalPaidAmount + allocatable;
    const newClosing = Math.max(cycle.totalChargeAmount - cycle.creditAppliedAmount - newPaid, 0);
    await db.billingCycle.update({
      where: { id: cycle.id },
      data: {
        totalPaidAmount: newPaid,
        closingBalance: newClosing,
        status: newClosing <= 0 ? BillingStatus.PAID : BillingStatus.PARTIAL,
      },
    });
    await db.ledgerEntry.create({
      data: {
        roomId,
        billingCycleId: cycle.id,
        paymentId: payment.id,
        createdByUserId: userId,
        entryType: "payment_allocation",
        amount: allocatable,
        direction: "credit",
        description: `Payment allocated to ${cycle.month}/${cycle.year}`,
      },
    });
    remaining -= allocatable;
  }

  if (remaining > 0) {
    await db.room.update({ where: { id: roomId }, data: { creditBalance: room.creditBalance + remaining } });
    await db.ledgerEntry.create({
      data: {
        roomId,
        paymentId: payment.id,
        createdByUserId: userId,
        entryType: "advance_credit",
        amount: remaining,
        direction: "credit",
        description: "Remaining payment stored as advance credit",
      },
    });
  }

  await db.ledgerEntry.create({
    data: {
      roomId,
      paymentId: payment.id,
      createdByUserId: userId,
      entryType: "payment_received",
      amount,
      direction: "credit",
      description: `Payment received via ${paymentMode}`,
    },
  });

  const receipt = await db.receipt.create({
    data: {
      paymentId: payment.id,
      receiptNumber: nextReceiptNumber(),
      shareToken: randomUUID(),
    },
  });

  return { room, payment, receipt };
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const ok = await signInWithPassword(email, password);
  if (!ok) redirect("/login?error=invalid");
  redirect("/dashboard");
}

export async function logoutAction() {
  await signOut();
  redirect("/login");
}

export async function toggleModeAction(formData: FormData) {
  await requireAdminUser();
  const mode = String(formData.get("mode") || "view");
  await setEditMode(mode === "edit");
  redirect(String(formData.get("redirectTo") || "/dashboard"));
}

export async function createPropertyAction(formData: FormData) {
  await requireAdminUser();
  await db.property.create({
    data: {
      name: String(formData.get("name") || "").trim(),
      code: String(formData.get("code") || "").trim() || null,
      address: String(formData.get("address") || "").trim() || null,
      defaultElectricityRate: toNumber(formData.get("defaultElectricityRate")),
      notes: String(formData.get("notes") || "").trim() || null,
    },
  });
  revalidatePath("/dashboard");
  revalidatePath("/properties");
  redirect("/properties");
}

export async function createRoomAction(formData: FormData) {
  await requireAdminUser();
  const propertyId = String(formData.get("propertyId") || "");
  await db.room.create({
    data: {
      propertyId,
      roomNumber: String(formData.get("roomNumber") || "").trim(),
      roomLabel: String(formData.get("roomLabel") || "").trim() || null,
      currentDefaultRent: toNumber(formData.get("currentDefaultRent")),
      currentDefaultWater: toNumber(formData.get("currentDefaultWater")),
      meterLabel: String(formData.get("meterLabel") || "").trim() || null,
      openingBalance: toNumber(formData.get("openingBalance")),
      notes: String(formData.get("notes") || "").trim() || null,
    },
  });
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/dashboard");
  redirect(`/properties/${propertyId}`);
}

export async function startTenancyAction(formData: FormData) {
  await requireAdminUser();
  const roomId = String(formData.get("roomId") || "");
  const room = await db.room.findUnique({ where: { id: roomId }, include: { tenancies: { where: { isActive: true } } } });
  if (!room || room.tenancies.length) redirect(`/rooms/${roomId}`);
  const startMeterReading = requireNumber(formData.get("startMeterReading"), "Starting meter reading");

  const tenant = await db.tenant.create({
    data: {
      fullName: String(formData.get("fullName") || "").trim(),
      phone: String(formData.get("phone") || "").trim() || null,
      idNumber: String(formData.get("idNumber") || "").trim() || null,
      permanentAddress: String(formData.get("permanentAddress") || "").trim() || null,
      emergencyContact: String(formData.get("emergencyContact") || "").trim() || null,
      notes: String(formData.get("tenantNotes") || "").trim() || null,
    },
  });

  await db.tenancy.create({
    data: {
      roomId,
      tenantId: tenant.id,
      startDate: toDate(formData.get("startDate")),
      startRent: toNumber(formData.get("startRent"), room.currentDefaultRent),
      startWater: toNumber(formData.get("startWater"), room.currentDefaultWater),
      startMeterReading,
      moveInNotes: String(formData.get("moveInNotes") || "").trim() || null,
      isActive: true,
    },
  });

  await db.room.update({
    where: { id: roomId },
    data: {
      status: RoomStatus.OCCUPIED,
      currentDefaultRent: toNumber(formData.get("startRent"), room.currentDefaultRent),
      currentDefaultWater: toNumber(formData.get("startWater"), room.currentDefaultWater),
    },
  });

  revalidatePath(`/rooms/${roomId}`);
  revalidatePath("/dashboard");
  redirect(`/rooms/${roomId}`);
}

export async function endTenancyAction(formData: FormData) {
  await requireAdminUser();
  const roomId = String(formData.get("roomId") || "");
  const tenancyId = String(formData.get("tenancyId") || "");
  await db.tenancy.update({
    where: { id: tenancyId },
    data: {
      isActive: false,
      endDate: toDate(formData.get("endDate")),
      moveOutNotes: String(formData.get("moveOutNotes") || "").trim() || null,
    },
  });
  await db.room.update({ where: { id: roomId }, data: { status: RoomStatus.VACANT } });
  revalidatePath(`/rooms/${roomId}`);
  revalidatePath("/dashboard");
  redirect(`/rooms/${roomId}`);
}

export async function createBillingCycleAction(formData: FormData) {
  const user = await requireAdminUser();
  const roomId = String(formData.get("roomId") || "");
  const month = toNumber(formData.get("month"));
  const year = toNumber(formData.get("year"));
  const currentMeterReading = toNumber(formData.get("currentMeterReading"));
  const adjustmentAmount = toNumber(formData.get("adjustmentAmount"));
  const note = String(formData.get("note") || "").trim() || null;

  const result = await buildBillingCycleForRoom({ roomId, month, year, currentMeterReading, adjustmentAmount, note, userId: user.id });
  if (!result) redirect("/dashboard");

  revalidatePath(`/rooms/${roomId}`);
  revalidatePath(`/properties/${result.room.propertyId}`);
  revalidatePath("/dashboard");
  const redirectTo = String(formData.get("redirectTo") || "").trim();
  redirect(redirectTo || `/rooms/${roomId}`);
}

export async function addPaymentAction(formData: FormData) {
  const user = await requireAdminUser();
  const roomId = String(formData.get("roomId") || "");
  const targetedCycleId = String(formData.get("billingCycleId") || "").trim() || null;
  const amount = toNumber(formData.get("amount"));
  const paymentDate = toDate(formData.get("paymentDate"));
  const paymentMode = (String(formData.get("paymentMode") || "CASH").toUpperCase() as PaymentMode);
  const referenceNote = String(formData.get("referenceNote") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;

  const result = await recordPaymentForRoom({
    roomId,
    amount,
    paymentDate,
    paymentMode,
    referenceNote,
    notes,
    targetedCycleId,
    userId: user.id,
  });
  if (!result) redirect("/dashboard");

  revalidatePath(`/rooms/${roomId}`);
  revalidatePath("/dashboard");
  revalidatePath(`/receipts/${result.receipt.id}`);
  redirect(`/receipts/${result.receipt.id}`);
}

export async function collectRoomAction(formData: FormData) {
  const user = await requireAdminUser();
  const roomId = String(formData.get("roomId") || "");
  const month = toNumber(formData.get("month"));
  const year = toNumber(formData.get("year"));
  const currentMeterReading = toNumber(formData.get("currentMeterReading"));
  const adjustmentAmount = toNumber(formData.get("adjustmentAmount"));
  const amountReceived = toNumber(formData.get("amountReceived"));
  const paymentDate = toDate(formData.get("paymentDate"));
  const paymentMode = (String(formData.get("paymentMode") || "CASH").toUpperCase() as PaymentMode);
  const referenceNote = String(formData.get("referenceNote") || "").trim() || null;
  const note = String(formData.get("note") || "").trim() || null;

  const billingResult = await buildBillingCycleForRoom({
    roomId,
    month,
    year,
    currentMeterReading,
    adjustmentAmount,
    note,
    userId: user.id,
  });
  if (!billingResult) redirect("/dashboard");

  let receiptId: string | null = null;
  if (amountReceived > 0) {
    const paymentResult = await recordPaymentForRoom({
      roomId,
      amount: amountReceived,
      paymentDate,
      paymentMode,
      referenceNote,
      notes: note,
      targetedCycleId: billingResult.cycle.id,
      userId: user.id,
    });
    receiptId = paymentResult?.receipt.id || null;
    if (receiptId) {
      revalidatePath(`/receipts/${receiptId}`);
    }
  }

  revalidatePath(`/rooms/${roomId}`);
  revalidatePath(`/properties/${billingResult.room.propertyId}`);
  revalidatePath("/properties");
  revalidatePath("/dashboard");
  redirect(`/rooms/${roomId}?saved=1${receiptId ? `&receiptId=${receiptId}` : ""}`);
}

export async function archiveRoomAction(formData: FormData) {
  await requireAdminUser();
  const roomId = String(formData.get("roomId") || "");
  const room = await db.room.findUnique({ where: { id: roomId } });
  if (!room) redirect("/dashboard");
  await db.room.update({ where: { id: roomId }, data: { status: RoomStatus.ARCHIVED } });
  revalidatePath(`/properties/${room.propertyId}`);
  revalidatePath("/dashboard");
  redirect(`/properties/${room.propertyId}`);
}
