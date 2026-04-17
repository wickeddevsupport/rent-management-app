import Link from "next/link";
import { notFound } from "next/navigation";
import { getReceiptById } from "@/lib/data";
import { money, shortDate } from "@/lib/format";
import { Badge, Card, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: Promise<{ receiptId: string }> }) {
  const { receiptId } = await params;
  const receipt = await getReceiptById(receiptId);
  if (!receipt) notFound();
  const payment = receipt.payment;
  const shareUrl = `${process.env.APP_URL || ""}/r/${receipt.shareToken}`;

  return (
    <div className="space-y-6">
      <PageHeader title={`Receipt ${receipt.receiptNumber}`} subtitle="Mobile-friendly receipt page you can share directly or screenshot." action={<Link href={`/rooms/${payment.roomId}`} className="text-sm font-medium text-indigo-600">Back to room</Link>} />
      <Card className="mx-auto max-w-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Property</p>
            <h2 className="text-2xl font-semibold text-slate-950">{payment.room.property.name}</h2>
            <p className="mt-1 text-sm text-slate-500">Room {payment.room.roomNumber}</p>
          </div>
          <Badge tone="green">Paid</Badge>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 text-sm text-slate-700">
          <div><span className="block text-xs uppercase tracking-wide text-slate-400">Tenant</span>{payment.tenancy?.tenant.fullName || "—"}</div>
          <div><span className="block text-xs uppercase tracking-wide text-slate-400">Date</span>{shortDate(payment.paymentDate)}</div>
          <div><span className="block text-xs uppercase tracking-wide text-slate-400">Amount</span><span className="text-xl font-semibold text-slate-950">{money(payment.amount)}</span></div>
          <div><span className="block text-xs uppercase tracking-wide text-slate-400">Mode</span>{payment.paymentMode.toLowerCase()}</div>
          <div><span className="block text-xs uppercase tracking-wide text-slate-400">Reference</span>{payment.referenceNote || "—"}</div>
          <div><span className="block text-xs uppercase tracking-wide text-slate-400">Recorded by</span>{payment.enteredByUser.name}</div>
        </div>
        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-medium text-slate-900">Share link</p>
          <p className="mt-2 break-all">{shareUrl}</p>
          <p className="mt-2 text-xs text-slate-500">Open this link on mobile or send it directly through WhatsApp, Telegram, Messenger, or any chat.</p>
        </div>
      </Card>
    </div>
  );
}
