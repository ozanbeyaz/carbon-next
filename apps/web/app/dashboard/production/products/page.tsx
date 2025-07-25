import { auth } from "@repo/auth";
import { db } from "@repo/db";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  companyId: string;
}

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Link href={`/dashboard/production/recipes/${row.original.id}`}>
        <Button variant="outline">Manage Recipe</Button>
      </Link>
    ),
  },
];

export default async function ProductsPage() {
  const session = await auth();

  if (!session?.user) {
    return <p>Please sign in to view products.</p>;
  }

  // In a real app, filter products by the user's companyId
  const products = await db.product.findMany({
    where: { companyId: session.user.companyId }, // Assuming companyId is available on session.user
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      <DataTable columns={columns} data={products} />
    </div>
  );
}
