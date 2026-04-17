import { notFound } from "next/navigation";
import { getReceiptByToken } from "@/lib/data";
import { money, shortDate } from "@/lib/format";
import { Badge, Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SharedReceiptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const receipt = await getReceiptByToken(token);
  if (!receipt) notFound();
  const payment = receipt.payment;

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Payment receipt</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{receipt.receiptNumber}</h1>
        </div>
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">{payment.room.property.name}</h2>
              <p className="mt-1 text-sm text-slate-500">Room {payment.room.roomNumber}</p>
            </div>
            <Badge tone="green">Received</Badge>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 text-sm text-slate-700">
            <div><span className="block text-xs uppercase tracking-wide text-slate-400">Tenant</span>{payment.tenancy?.tenant.fullName || "—"}</div>
            <div><span className="block text-xs uppercase tracking-wide text-slate-400">Payment date</span>{shortDate(payment.paymentDate)}</div>
            <div><span className="block text-xs uppercase tracking-wide text-slate-400">Amount</span><span className="text-xl font-semibold text-slate-950">{money(payment.amount)}</span></div>
            <div><span className="block text-xs uppercase tracking-wide text-slate-400">Mode</span>{payment.paymentMode.toLowerCase()}</div>
            <div><span className="block text-xs uppercase tracking-wide text-slate-400">Reference</span>{payment.referenceNote || "—"}</div>
            <div><span className="block text-xs uppercase tracking-wide text-slate-400">Recorded by</span>{payment.enteredByUser.name}</div>
          </div>
        </Card>
      </div>
    </main>
  );
}
