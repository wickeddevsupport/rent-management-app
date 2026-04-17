import Link from "next/link";
import { createPropertyAction } from "@/app/actions";
import { isEditMode } from "@/lib/auth";
import { getPropertiesList } from "@/lib/data";
import { bsMonthLabelFromDate, money } from "@/lib/format";
import { Badge, Button, Card, EmptyState, Field, PageHeader, TextArea, TextInput } from "@/components/ui";

export const dynamic = "force-dynamic";

function propertyHealthTone(property: Awaited<ReturnType<typeof getPropertiesList>>[number]) {
  if (property.pendingReadingCount > 0) return "amber" as const;
  if (property.totalDue > 0) return "red" as const;
  return "green" as const;
}

export default async function PropertiesPage() {
  const properties = await getPropertiesList();
  const editMode = await isEditMode();
  const bsMonth = bsMonthLabelFromDate(new Date());
  const totalUnits = properties.reduce((sum, property) => sum + property.roomCount, 0);
  const totalDue = properties.reduce((sum, property) => sum + property.totalDue, 0);
  const occupiedUnits = properties.reduce((sum, property) => sum + property.occupiedCount, 0);

  return (
    <div className="space-y-6">
      <section className="listing-hero overflow-hidden rounded-[32px] p-6 text-white shadow-[0_30px_90px_-40px_rgba(15,23,42,0.8)] sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Portfolio overview</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Make it feel like real buildings and real units, not admin blocks.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">This month’s collection view is now organized like a small property operating surface: buildings first, units second, money and occupancy always visible.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Month</p>
              <p className="mt-2 text-xl font-semibold text-white">{bsMonth}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Buildings</p>
              <p className="mt-2 text-xl font-semibold text-white">{properties.length}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Units</p>
              <p className="mt-2 text-xl font-semibold text-white">{totalUnits}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Occupied</p>
              <p className="mt-2 text-xl font-semibold text-white">{occupiedUnits}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Portfolio due now</p>
              <p className="mt-2 text-xl font-semibold text-white">{money(totalDue)}</p>
            </div>
          </div>
        </div>
      </section>

      <PageHeader title="Properties" subtitle="Choose a building, see its health instantly, then drop into the unit list." />

      <div className="grid gap-5 xl:grid-cols-2">
        {properties.length ? (
          properties.map((property, index) => (
            <Link key={property.id} href={`/properties/${property.id}`} className="group block">
              <article className="listing-card overflow-hidden rounded-[32px] transition duration-200 group-hover:-translate-y-0.5">
                <div className="listing-cover p-5 text-white sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Building {String(index + 1).padStart(2, "0")}</p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{property.name}</h2>
                      <p className="mt-2 max-w-xl text-sm text-slate-200">{property.address || "Address not added yet"}</p>
                    </div>
                    <Badge tone={propertyHealthTone(property)}>
                      {property.pendingReadingCount > 0
                        ? `${property.pendingReadingCount} need reading`
                        : property.totalDue > 0
                          ? "Needs collection"
                          : "In good shape"}
                    </Badge>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Units</p>
                      <p className="mt-2 text-xl font-semibold text-slate-950">{property.roomCount}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Occupied</p>
                      <p className="mt-2 text-xl font-semibold text-slate-950">{property.occupiedCount}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Due now</p>
                      <p className="mt-2 text-xl font-semibold text-slate-950">{money(property.totalDue)}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Collected</p>
                      <p className="mt-2 text-xl font-semibold text-slate-950">{money(property.collectedThisMonth)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-sm text-slate-600">
                      <span className="font-medium text-slate-900">{property.pendingPaymentCount}</span> units still need attention this month.
                    </div>
                    <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Open building</div>
                  </div>
                </div>
              </article>
            </Link>
          ))
        ) : (
          <EmptyState title="No properties yet" text="Add a property in edit mode to begin." />
        )}
      </div>

      {editMode ? (
        <Card className="listing-card">
          <h2 className="text-lg font-semibold text-slate-950">Add property</h2>
          <p className="mt-1 text-sm text-slate-500">Setup stays separate from the live collection surface.</p>
          <form action={createPropertyAction} className="mt-4 space-y-3">
            <Field label="Property name"><TextInput name="name" required /></Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Code"><TextInput name="code" placeholder="AB" /></Field>
              <Field label="Electricity rate"><TextInput name="defaultElectricityRate" type="number" step="0.01" /></Field>
            </div>
            <Field label="Address"><TextInput name="address" /></Field>
            <Field label="Notes"><TextArea name="notes" /></Field>
            <Button type="submit" className="w-full">Create property</Button>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
