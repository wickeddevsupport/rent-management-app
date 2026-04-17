import { BillingStatus, RoomStatus } from "@prisma/client";
import { db } from "@/lib/db";

export function outstandingForRoom(room: {
  creditBalance: number;
  billingCycles: Array<{ closingBalance: number }>;
}) {
  const rawDue = room.billingCycles.reduce((sum, cycle) => sum + cycle.closingBalance, 0);
  return Math.max(rawDue - room.creditBalance, 0);
}

export function availableCreditForRoom(room: { creditBalance: number }) {
  return Math.max(room.creditBalance, 0);
}

export function billingStatusFromBalance(balance: number): BillingStatus {
  if (balance <= 0) return BillingStatus.PAID;
  return BillingStatus.PARTIAL;
}

export async function getDashboardData() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const monthStart = new Date(year, now.getMonth(), 1);

  const properties = await db.property.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      rooms: {
        where: { status: { not: RoomStatus.ARCHIVED } },
        include: {
          tenancies: { where: { isActive: true }, include: { tenant: true } },
          billingCycles: { orderBy: [{ year: "desc" }, { month: "desc" }] },
          payments: { where: { isArchived: false, paymentDate: { gte: monthStart } } },
        },
      },
    },
  });

  const recentPayments = await db.payment.findMany({
    where: { isArchived: false },
    orderBy: { paymentDate: "desc" },
    take: 8,
    include: {
      room: { include: { property: true } },
      tenancy: { include: { tenant: true } },
      receipt: true,
    },
  });

  const rooms = properties.flatMap((property) =>
    property.rooms.map((room) => {
      const activeTenancy = room.tenancies[0] || null;
      const currentCycle = room.billingCycles.find((cycle) => cycle.month === month && cycle.year === year) || room.billingCycles[0] || null;
      const totalDue = outstandingForRoom(room);
      const collectedThisMonth = room.payments.reduce((sum, payment) => sum + payment.amount, 0);
      return {
        ...room,
        property,
        activeTenancy,
        currentCycle,
        totalDue,
        collectedThisMonth,
        needsReading: room.status === RoomStatus.OCCUPIED && !room.billingCycles.some((cycle) => cycle.month === month && cycle.year === year),
      };
    })
  );

  const totalDue = rooms.reduce((sum, room) => sum + room.totalDue, 0);
  const totalCollectedThisMonth = recentPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalCredit = properties.reduce(
    (sum, property) => sum + property.rooms.reduce((inner, room) => inner + availableCreditForRoom(room), 0),
    0
  );

  return {
    month,
    year,
    totalDue,
    totalCollectedThisMonth,
    totalCredit,
    occupiedRooms: rooms.filter((room) => room.status === RoomStatus.OCCUPIED).length,
    totalRooms: rooms.length,
    overdueRooms: rooms.filter((room) => room.totalDue > 0).length,
    rooms,
    recentPayments,
    properties: properties.map((property) => {
      const propertyRooms = rooms.filter((room) => room.propertyId === property.id);
      return {
        ...property,
        roomCount: propertyRooms.length,
        occupiedCount: propertyRooms.filter((room) => room.status === RoomStatus.OCCUPIED).length,
        vacantCount: propertyRooms.filter((room) => room.status === RoomStatus.VACANT).length,
        totalDue: propertyRooms.reduce((sum, room) => sum + room.totalDue, 0),
        collectedThisMonth: propertyRooms.reduce((sum, room) => sum + room.collectedThisMonth, 0),
        pendingReadingCount: propertyRooms.filter((room) => room.needsReading).length,
        pendingPaymentCount: propertyRooms.filter((room) => room.totalDue > 0).length,
      };
    }),
  };
}

export async function getPropertyDetail(propertyId: string) {
  const property = await db.property.findUnique({
    where: { id: propertyId },
    include: {
      rooms: {
        where: { status: { not: RoomStatus.ARCHIVED } },
        orderBy: { roomNumber: "asc" },
        include: {
          tenancies: { where: { isActive: true }, include: { tenant: true } },
          billingCycles: { orderBy: [{ year: "desc" }, { month: "desc" }] },
          payments: { where: { isArchived: false }, orderBy: { paymentDate: "desc" }, take: 3 },
        },
      },
    },
  });
  if (!property) return null;
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  return {
    ...property,
    rooms: property.rooms.map((room) => ({
      ...room,
      activeTenancy: room.tenancies[0] || null,
      currentCycle: room.billingCycles.find((cycle) => cycle.month === month && cycle.year === year) || room.billingCycles[0] || null,
      totalDue: outstandingForRoom(room),
      latestPayment: room.payments[0] || null,
      needsReading: room.status === RoomStatus.OCCUPIED && !room.billingCycles.some((cycle) => cycle.month === month && cycle.year === year),
    })),
  };
}

export async function getRoomDetail(roomId: string) {
  return db.room.findUnique({
    where: { id: roomId },
    include: {
      property: true,
      tenancies: { orderBy: { startDate: "desc" }, include: { tenant: true } },
      billingCycles: {
        orderBy: [{ year: "desc" }, { month: "desc" }],
        include: { paymentAllocations: { include: { payment: { include: { receipt: true } } } } },
      },
      payments: { orderBy: { paymentDate: "desc" }, include: { receipt: true, enteredByUser: true } },
      ledgerEntries: { orderBy: { createdAt: "desc" }, take: 40 },
    },
  });
}

export async function getPropertiesList() {
  const dashboard = await getDashboardData();
  return dashboard.properties;
}

export async function getTenantsDirectory() {
  return db.tenant.findMany({
    where: { isActive: true },
    orderBy: { fullName: "asc" },
    include: {
      tenancies: {
        orderBy: { startDate: "desc" },
        include: { room: { include: { property: true } } },
      },
    },
  });
}

export async function getReceiptById(receiptId: string) {
  return db.receipt.findUnique({
    where: { id: receiptId },
    include: {
      payment: {
        include: {
          room: { include: { property: true } },
          tenancy: { include: { tenant: true } },
          enteredByUser: true,
        },
      },
    },
  });
}

export async function getReceiptByToken(token: string) {
  return db.receipt.findUnique({
    where: { shareToken: token },
    include: {
      payment: {
        include: {
          room: { include: { property: true } },
          tenancy: { include: { tenant: true } },
          enteredByUser: true,
        },
      },
    },
  });
}

export function nextReceiptNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RCPT-${stamp}-${random}`;
}
