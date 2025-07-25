"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Customer } from "@repo/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Mock data for demonstration
const mockCustomers: Customer[] = [
  { id: "cust1", name: "ABC Corp", email: "info@abccorp.com", phone: "123-456-7890", address: "123 Main St" },
  { id: "cust2", name: "XYZ Ltd", email: "contact@xyzltd.com", phone: "098-765-4321", address: "456 Oak Ave" },
  { id: "cust3", name: "Acme Inc", email: "sales@acmeinc.com", address: "789 Pine Ln" },
];

const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link href={`/dashboard/crm/customers/${row.original.id}`} className="text-blue-600 hover:underline">
        {row.getValue("name")}
      </Link>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
];

export default function CustomersPage() {
  // In a real application, you would fetch customers from an API
  const customers = mockCustomers;

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button asChild>
          <Link href="/dashboard/crm/customers/new">Add New Customer</Link>
        </Button>
      </div>
      <DataTable columns={columns} data={customers} />
    </div>
  );
}
