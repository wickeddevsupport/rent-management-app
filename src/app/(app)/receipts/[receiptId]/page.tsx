import { notFound } from "next/navigation";
import { Badge, Card, LinkButton, PageHeader } from "@/components/ui";
import { getReceiptById } from "@/lib/data";
import { money, shortDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: Promise<{ receiptId: string }> }) {
  const { receiptId } = await params;
  const receipt = await getReceiptById(receiptId);
  if (!receipt) notFound();
  const payment = receipt.payment;
  const shareUrl = `${process.env.APP_URL || ""}/r/${receipt.shareToken}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Receipt ${receipt.receiptNumber}`}
        subtitle="Receipt details and share link."
        action={<LinkButton href={`/rooms/${payment.roomId}`} variant="secondary">Back to room</LinkButton>}
      />

      <Card className="listing-card mx-auto max-w-3xl overflow-hidden p-0">
        <div className="listing-cover px-6 py-6 text-white sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Receipt</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">{receipt.receiptNumber}</h2>
              <p className="mt-2 text-sm text-slate-200">{payment.room.property.name} · Room {payment.room.roomNumber}</p>
            </div>
            <Badge tone="green">Received</Badge>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid gap-4 md:grid-cols-2 text-sm text-slate-700">
            <div><span className="block text-xs uppercase tracking-wide text-slate-400">Resident</span>{payment.tenancy?.tenant.fullName || "—"}</div>
            <div><span className="block text-xs uppercase tracking-wide text-slate-400">Date</span>{shortDate(payment.paymentDate)}</div>
            <div><span className="block text-xs uppercase tracking-wide text-slate-400">Amount</span><span className="text-xl font-semibold text-slate-950">{money(payment.amount)}</span></div>
            <div><span className="block text-xs uppercase tracking-wide text-slate-400">Mode</span>{payment.paymentMode.toLowerCase()}</div>
            <div><span className="block text-xs uppercase tracking-wide text-slate-400">Reference</span>{payment.referenceNote || "—"}</div>
            <div><span className="block text-xs uppercase tracking-wide text-slate-400">Recorded by</span>{payment.enteredByUser.name}</div>
          </div>

          <div className="surface-subtle mt-6 rounded-[28px] p-5 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Share link</p>
            <p className="mt-2 break-all">{shareUrl}</p>
            <p className="mt-2 text-xs text-slate-500">Open this on mobile or send it through WhatsApp, Telegram, Messenger, or any chat.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
