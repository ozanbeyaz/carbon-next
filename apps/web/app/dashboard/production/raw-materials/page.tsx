import { auth } from "@repo/auth";
import { db } from "@repo/db";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  supplier: string | null;
}

const columns: ColumnDef<RawMaterial>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "unit",
    header: "Unit",
  },
  {
    accessorKey: "supplier",
    header: "Supplier",
  },
];

export default async function RawMaterialsPage() {
  const session = await auth();

  if (!session?.user) {
    return <p>Please sign in to view raw materials.</p>;
  }

  const rawMaterials = await db.rawMaterial.findMany();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Raw Materials</h1>
      <DataTable columns={columns} data={rawMaterials} />
    </div>
  );
}
