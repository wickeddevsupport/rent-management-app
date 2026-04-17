import bcrypt from 'bcryptjs';
import { PrismaClient, BillingStatus, PaymentMode, RoomStatus, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

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

  const property = await prisma.property.create({
    data: {
      name: 'Sunrise Home',
      code: 'SH',
      address: 'Demo property',
      defaultElectricityRate: 14,
      rooms: {
        create: [
          { roomNumber: '101', currentDefaultRent: 12000, currentDefaultWater: 500, meterLabel: 'Meter 101', status: RoomStatus.OCCUPIED },
          { roomNumber: '102', currentDefaultRent: 10000, currentDefaultWater: 400, meterLabel: 'Meter 102', status: RoomStatus.VACANT },
        ],
      },
    },
    include: { rooms: true },
  });

  const tenant = await prisma.tenant.create({
    data: { fullName: 'Sample Tenant', phone: '9800000000' },
  });

  const tenancy = await prisma.tenancy.create({
    data: {
      roomId: property.rooms[0].id,
      tenantId: tenant.id,
      startDate: new Date(),
      startRent: 12000,
      startWater: 500,
      startMeterReading: 120,
      isActive: true,
    },
  });

  const cycle = await prisma.billingCycle.create({
    data: {
      roomId: property.rooms[0].id,
      tenancyId: tenancy.id,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      openingBalance: 0,
      roomRentAmount: 12000,
      waterAmount: 500,
      previousMeterReading: 120,
      currentMeterReading: 138,
      electricityUnits: 18,
      electricityRate: 14,
      electricityAmount: 252,
      totalChargeAmount: 12752,
      totalPaidAmount: 8000,
      closingBalance: 4752,
      status: BillingStatus.PARTIAL,
    },
  });

  const payment = await prisma.payment.create({
    data: {
      roomId: property.rooms[0].id,
      tenancyId: tenancy.id,
      paymentDate: new Date(),
      amount: 8000,
      paymentMode: PaymentMode.CASH,
      enteredByUserId: admin.id,
      referenceNote: 'demo',
    },
  });

  await prisma.paymentAllocation.create({
    data: {
      paymentId: payment.id,
      billingCycleId: cycle.id,
      allocatedAmount: 8000,
      allocationOrder: 1,
    },
  });

  await prisma.receipt.create({
    data: {
      paymentId: payment.id,
      receiptNumber: 'RCPT-DEMO-0001',
      shareToken: 'demo-receipt-token',
    },
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
