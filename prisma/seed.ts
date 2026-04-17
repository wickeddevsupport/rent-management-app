import bcrypt from 'bcryptjs';
import { PrismaClient, BillingStatus, PaymentMode, RoomStatus, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRoomCollection({
  roomId,
  tenancyId,
  enteredByUserId,
  month,
  year,
  previousMeterReading,
  currentMeterReading,
  roomRentAmount,
  waterAmount,
  electricityRate,
  amountPaid,
  paymentMode,
  paymentDate,
  referenceNote,
  receiptNumber,
  shareToken,
  note,
}: {
  roomId: string;
  tenancyId: string;
  enteredByUserId: string;
  month: number;
  year: number;
  previousMeterReading: number;
  currentMeterReading: number;
  roomRentAmount: number;
  waterAmount: number;
  electricityRate: number;
  amountPaid: number;
  paymentMode: PaymentMode;
  paymentDate: Date;
  referenceNote: string;
  receiptNumber: string;
  shareToken: string;
  note?: string;
}) {
  const electricityUnits = Math.max(currentMeterReading - previousMeterReading, 0);
  const electricityAmount = electricityUnits * electricityRate;
  const totalChargeAmount = roomRentAmount + waterAmount + electricityAmount;
  const closingBalance = Math.max(totalChargeAmount - amountPaid, 0);

  const cycle = await prisma.billingCycle.create({
    data: {
      roomId,
      tenancyId,
      month,
      year,
      openingBalance: 0,
      roomRentAmount,
      waterAmount,
      previousMeterReading,
      currentMeterReading,
      electricityUnits,
      electricityRate,
      electricityAmount,
      totalChargeAmount,
      totalPaidAmount: amountPaid,
      closingBalance,
      status: closingBalance <= 0 ? BillingStatus.PAID : BillingStatus.PARTIAL,
      notes: note || null,
    },
  });

  await prisma.ledgerEntry.createMany({
    data: [
      { roomId, billingCycleId: cycle.id, createdByUserId: enteredByUserId, entryType: 'monthly_rent', amount: roomRentAmount, direction: 'debit', description: `Room rent added for ${month}/${year}` },
      { roomId, billingCycleId: cycle.id, createdByUserId: enteredByUserId, entryType: 'water_charge', amount: waterAmount, direction: 'debit', description: `Water charge added for ${month}/${year}` },
      { roomId, billingCycleId: cycle.id, createdByUserId: enteredByUserId, entryType: 'electricity_charge', amount: electricityAmount, direction: 'debit', description: `${electricityUnits} units x ${electricityRate}` },
    ],
  });

  if (amountPaid > 0) {
    const payment = await prisma.payment.create({
      data: {
        roomId,
        tenancyId,
        paymentDate,
        amount: amountPaid,
        paymentMode,
        enteredByUserId,
        referenceNote,
        notes: note || null,
      },
    });

    await prisma.paymentAllocation.create({
      data: {
        paymentId: payment.id,
        billingCycleId: cycle.id,
        allocatedAmount: amountPaid,
        allocationOrder: 1,
      },
    });

    await prisma.receipt.create({
      data: {
        paymentId: payment.id,
        receiptNumber,
        shareToken,
      },
    });

    await prisma.ledgerEntry.createMany({
      data: [
        { roomId, billingCycleId: cycle.id, paymentId: payment.id, createdByUserId: enteredByUserId, entryType: 'payment_received', amount: amountPaid, direction: 'credit', description: `Payment received via ${paymentMode}` },
        { roomId, billingCycleId: cycle.id, paymentId: payment.id, createdByUserId: enteredByUserId, entryType: 'payment_allocation', amount: amountPaid, direction: 'credit', description: `Payment allocated to ${month}/${year}` },
      ],
    });
  }
}

async function main() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@rent.local';
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || 'rent12345';
  const name = process.env.BOOTSTRAP_ADMIN_NAME || 'Rajan';

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: UserRole.ADMIN, isActive: true },
    create: { name, email, passwordHash, role: UserRole.ADMIN, isActive: true },
  });

  if (process.env.SEED_DEMO_DATA !== 'true') return;
  if (await prisma.property.count()) return;

  const sunrise = await prisma.property.create({
    data: {
      name: 'Sunrise Home',
      code: 'SH',
      address: 'Maitidevi, Kathmandu',
      defaultElectricityRate: 14,
      notes: 'Demo property for mobile collection flow',
      rooms: {
        create: [
          { roomNumber: '101', currentDefaultRent: 12000, currentDefaultWater: 500, meterLabel: 'Meter 101', status: RoomStatus.OCCUPIED },
          { roomNumber: '102', currentDefaultRent: 13000, currentDefaultWater: 500, meterLabel: 'Meter 102', status: RoomStatus.OCCUPIED },
          { roomNumber: '103', currentDefaultRent: 11000, currentDefaultWater: 400, meterLabel: 'Meter 103', status: RoomStatus.VACANT },
          { roomNumber: '104', currentDefaultRent: 9000, currentDefaultWater: 350, meterLabel: 'Meter 104', status: RoomStatus.OCCUPIED },
        ],
      },
    },
    include: { rooms: true },
  });

  const moonlight = await prisma.property.create({
    data: {
      name: 'Moonlight Residency',
      code: 'MR',
      address: 'Baneshwor, Kathmandu',
      defaultElectricityRate: 15,
      rooms: {
        create: [
          { roomNumber: '201', currentDefaultRent: 15000, currentDefaultWater: 600, meterLabel: 'Meter 201', status: RoomStatus.OCCUPIED },
          { roomNumber: '202', currentDefaultRent: 14500, currentDefaultWater: 550, meterLabel: 'Meter 202', status: RoomStatus.VACANT },
        ],
      },
    },
    include: { rooms: true },
  });

  const tenants = await Promise.all([
    prisma.tenant.create({ data: { fullName: 'Suman Shrestha', phone: '9800000001', permanentAddress: 'Bhaktapur' } }),
    prisma.tenant.create({ data: { fullName: 'Mina Karki', phone: '9800000002', permanentAddress: 'Lalitpur' } }),
    prisma.tenant.create({ data: { fullName: 'Arjun Rai', phone: '9800000003', permanentAddress: 'Dharan' } }),
    prisma.tenant.create({ data: { fullName: 'Puja Thapa', phone: '9800000004', permanentAddress: 'Pokhara' } }),
  ]);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const tenancy101 = await prisma.tenancy.create({
    data: {
      roomId: sunrise.rooms.find((room) => room.roomNumber === '101')!.id,
      tenantId: tenants[0].id,
      startDate: new Date(year, Math.max(now.getMonth() - 3, 0), 3),
      startRent: 12000,
      startWater: 500,
      startMeterReading: 412,
      isActive: true,
      moveInNotes: 'Moved in with live meter already running at 412.',
    },
  });

  const tenancy102 = await prisma.tenancy.create({
    data: {
      roomId: sunrise.rooms.find((room) => room.roomNumber === '102')!.id,
      tenantId: tenants[1].id,
      startDate: new Date(year, Math.max(now.getMonth() - 2, 0), 10),
      startRent: 13000,
      startWater: 500,
      startMeterReading: 892,
      isActive: true,
      moveInNotes: 'Meter was already at 892 on move-in.',
    },
  });

  const tenancy104 = await prisma.tenancy.create({
    data: {
      roomId: sunrise.rooms.find((room) => room.roomNumber === '104')!.id,
      tenantId: tenants[2].id,
      startDate: new Date(year, Math.max(now.getMonth() - 1, 0), 1),
      startRent: 9000,
      startWater: 350,
      startMeterReading: 1265,
      isActive: true,
    },
  });

  const tenancy201 = await prisma.tenancy.create({
    data: {
      roomId: moonlight.rooms.find((room) => room.roomNumber === '201')!.id,
      tenantId: tenants[3].id,
      startDate: new Date(year, Math.max(now.getMonth() - 4, 0), 15),
      startRent: 15000,
      startWater: 600,
      startMeterReading: 2210,
      isActive: true,
    },
  });

  await seedRoomCollection({
    roomId: sunrise.rooms.find((room) => room.roomNumber === '101')!.id,
    tenancyId: tenancy101.id,
    enteredByUserId: admin.id,
    month,
    year,
    previousMeterReading: 458,
    currentMeterReading: 476,
    roomRentAmount: 12000,
    waterAmount: 500,
    electricityRate: 14,
    amountPaid: 12000,
    paymentMode: PaymentMode.CASH,
    paymentDate: new Date(year, now.getMonth(), 5),
    referenceNote: 'cash-demo-101',
    receiptNumber: 'RCPT-DEMO-0101',
    shareToken: 'demo-receipt-0101',
    note: 'Paid in full during field collection.',
  });

  await seedRoomCollection({
    roomId: sunrise.rooms.find((room) => room.roomNumber === '102')!.id,
    tenancyId: tenancy102.id,
    enteredByUserId: admin.id,
    month,
    year,
    previousMeterReading: 921,
    currentMeterReading: 944,
    roomRentAmount: 13000,
    waterAmount: 500,
    electricityRate: 14,
    amountPaid: 7000,
    paymentMode: PaymentMode.ESEWA,
    paymentDate: new Date(year, now.getMonth(), 7),
    referenceNote: 'esewa-demo-102',
    receiptNumber: 'RCPT-DEMO-0102',
    shareToken: 'demo-receipt-0102',
    note: 'Partial payment, balance remains.',
  });

  await seedRoomCollection({
    roomId: sunrise.rooms.find((room) => room.roomNumber === '104')!.id,
    tenancyId: tenancy104.id,
    enteredByUserId: admin.id,
    month,
    year,
    previousMeterReading: 1280,
    currentMeterReading: 1294,
    roomRentAmount: 9000,
    waterAmount: 350,
    electricityRate: 14,
    amountPaid: 0,
    paymentMode: PaymentMode.CASH,
    paymentDate: new Date(year, now.getMonth(), 9),
    referenceNote: 'unpaid-demo-104',
    receiptNumber: 'RCPT-DEMO-0104',
    shareToken: 'demo-receipt-0104',
    note: 'Bill created, no payment collected yet.',
  });

  await seedRoomCollection({
    roomId: moonlight.rooms.find((room) => room.roomNumber === '201')!.id,
    tenancyId: tenancy201.id,
    enteredByUserId: admin.id,
    month,
    year,
    previousMeterReading: 2262,
    currentMeterReading: 2286,
    roomRentAmount: 15000,
    waterAmount: 600,
    electricityRate: 15,
    amountPaid: 15960,
    paymentMode: PaymentMode.BANK,
    paymentDate: new Date(year, now.getMonth(), 11),
    referenceNote: 'bank-demo-201',
    receiptNumber: 'RCPT-DEMO-0201',
    shareToken: 'demo-receipt-0201',
    note: 'Paid in full by bank transfer.',
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
