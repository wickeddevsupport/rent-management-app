import { notFound } from "next/navigation";
import { Badge, Card } from "@/components/ui";
import { getReceiptByToken } from "@/lib/data";
import { money, shortDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SharedReceiptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const receipt = await getReceiptByToken(token);
  if (!receipt) notFound();
  const payment = receipt.payment;

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="listing-card overflow-hidden p-0">
          <div className="listing-cover px-6 py-6 text-white sm:px-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Payment receipt</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">{receipt.receiptNumber}</h1>
                <p className="mt-2 text-sm text-slate-200">{payment.room.property.name} · Room {payment.room.roomNumber}</p>
              </div>
              <Badge tone="green">Received</Badge>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid gap-4 md:grid-cols-2 text-sm text-slate-700">
              <div><span className="block text-xs uppercase tracking-wide text-slate-400">Resident</span>{payment.tenancy?.tenant.fullName || "—"}</div>
              <div><span className="block text-xs uppercase tracking-wide text-slate-400">Payment date</span>{shortDate(payment.paymentDate)}</div>
              <div><span className="block text-xs uppercase tracking-wide text-slate-400">Amount</span><span className="text-xl font-semibold text-slate-950">{money(payment.amount)}</span></div>
              <div><span className="block text-xs uppercase tracking-wide text-slate-400">Mode</span>{payment.paymentMode.toLowerCase()}</div>
              <div><span className="block text-xs uppercase tracking-wide text-slate-400">Reference</span>{payment.referenceNote || "—"}</div>
              <div><span className="block text-xs uppercase tracking-wide text-slate-400">Recorded by</span>{payment.enteredByUser.name}</div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
