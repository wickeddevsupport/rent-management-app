import { PageHeader, Card } from "@/components/ui";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="System rules and operating defaults." />
      <Card>
        <h2 className="text-lg font-semibold text-slate-950">Current rules</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>Family login with admin/viewer role split.</li>
          <li>View mode is the default. Edit mode must be turned on intentionally.</li>
          <li>No hard delete in v1. Archive or deactivate instead.</li>
          <li>Electricity is entered manually per monthly bill.</li>
          <li>Receipts are mobile-first share pages, not printer-first PDFs.</li>
        </ul>
      </Card>
    </div>
  );
}
