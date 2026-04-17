import Link from "next/link";
import { createPropertyAction } from "@/app/actions";
import { isEditMode } from "@/lib/auth";
import { getPropertiesList } from "@/lib/data";
import { money } from "@/lib/format";
import { Badge, Button, Card, EmptyState, Field, PageHeader, TextArea, TextInput } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
  const properties = await getPropertiesList();
  const editMode = await isEditMode();

  return (
    <div className="space-y-6">
      <PageHeader title="Properties" subtitle="Each property is grouped by room number and room-level balance history." />
      <div className="grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {properties.length ? (
            properties.map((property) => (
              <Link key={property.id} href={`/properties/${property.id}`}>
                <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-950">{property.name}</h2>
                      <p className="mt-1 text-sm text-slate-500">{property.address || "No address added yet"}</p>
                    </div>
                    <Badge tone={property.totalDue > 0 ? "red" : "green"}>{money(property.totalDue)}</Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <div><span className="block text-xs uppercase tracking-wide text-slate-400">Rooms</span>{property.roomCount}</div>
                    <div><span className="block text-xs uppercase tracking-wide text-slate-400">Occupied</span>{property.occupiedCount}</div>
                    <div><span className="block text-xs uppercase tracking-wide text-slate-400">Collected</span>{money(property.collectedThisMonth)}</div>
                    <div><span className="block text-xs uppercase tracking-wide text-slate-400">Pending bills</span>{property.pendingPaymentCount}</div>
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <EmptyState title="No properties yet" text="Add a property in edit mode to begin." />
          )}
        </div>
        <Card>
          <h2 className="text-lg font-semibold text-slate-950">Add property</h2>
          <p className="mt-1 text-sm text-slate-500">Quick setup for a new house or building.</p>
          {editMode ? (
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
          ) : (
            <div className="mt-4"><EmptyState title="View mode is on" text="Switch to edit mode when you want to add new properties." /></div>
          )}
        </Card>
      </div>
    </div>
  );
}
