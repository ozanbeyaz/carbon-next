"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Customer, ConstructionSite } from "@repo/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { createConstructionSite } from "@/app/actions/customer-actions";
import { toast } from "sonner";

// Mock data for demonstration
const mockCustomers: Customer[] = [
  { id: "cust1", name: "ABC Corp", email: "info@abccorp.com", phone: "123-456-7890", address: "123 Main St" },
  { id: "cust2", name: "XYZ Ltd", email: "contact@xyzltd.com", phone: "098-765-4321", address: "456 Oak Ave" },
  { id: "cust3", name: "Acme Inc", email: "sales@acmeinc.com", address: "789 Pine Ln" },
];

const mockConstructionSites: ConstructionSite[] = [
  { id: "cs1", customerId: "cust1", name: "Site Alpha", address: "100 Industrial Rd" },
  { id: "cs2", customerId: "cust1", name: "Site Beta", address: "200 Business Park" },
  { id: "cs3", customerId: "cust2", name: "Site Gamma", address: "300 Tech Blvd" },
];

const mockFacilities = [
  { id: "fac1", name: "Facility A" },
  { id: "fac2", name: "Facility B" },
];

const columns: ColumnDef<ConstructionSite>[] = [
  {
    accessorKey: "name",
    header: "Site Name",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "facilityId",
    header: "Linked Facility",
    cell: ({ row }) => {
      const facility = mockFacilities.find(f => f.id === row.original.facilityId);
      return facility ? facility.name : "N/A";
    }
  },
];

export default function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [constructionSites, setConstructionSites] = useState<ConstructionSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteAddress, setNewSiteAddress] = useState("");
  const [selectedFacility, setSelectedFacility] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (id) {
      // In a real application, fetch customer and construction sites from API
      const foundCustomer = mockCustomers.find((c) => c.id === id);
      setCustomer(foundCustomer || null);
      setConstructionSites(mockConstructionSites.filter((cs) => cs.customerId === id));
      setLoading(false);
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || !newSiteName || !newSiteAddress) {
      toast.error("Please fill all required fields for the new construction site.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("name", newSiteName);
    formData.append("address", newSiteAddress);
    if (selectedFacility) {
      formData.append("facilityId", selectedFacility);
    }

    try {
      const result = await createConstructionSite(id as string, formData);
      if (result.success) {
        toast.success(result.message);
        // Optimistically update UI or re-fetch data
        setConstructionSites((prev) => [
          ...prev,
          { 
            id: `cs${Date.now()}`, // Mock ID
            customerId: id as string,
            name: newSiteName,
            address: newSiteAddress,
            facilityId: selectedFacility
          },
        ]);
        setNewSiteName("");
        setNewSiteAddress("");
        setSelectedFacility(undefined);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error creating construction site:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading customer details...</div>;
  }

  if (!customer) {
    return <div className="p-4">Customer not found.</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Customer Details: {customer.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <p><strong>Email:</strong> {customer.email}</p>
          {customer.phone && <p><strong>Phone:</strong> {customer.phone}</p>}
          {customer.address && <p><strong>Address:</strong> {customer.address}</p>}
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Construction Sites</h2>
        {constructionSites.length > 0 ? (
          <DataTable columns={columns} data={constructionSites} />
        ) : (
          <p>No construction sites found for this customer.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Add New Construction Site</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={newSiteName}
              onChange={(e) => setNewSiteName(e.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <div>
            <Label htmlFor="siteAddress">Address</Label>
            <Input
              id="siteAddress"
              value={newSiteAddress}
              onChange={(e) => setNewSiteAddress(e.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <div>
            <Label htmlFor="facility">Link to Facility (Optional)</Label>
            <Select
              value={selectedFacility}
              onValueChange={setSelectedFacility}
              disabled={submitting}
            >
              <SelectTrigger id="facility">
                <SelectValue placeholder="Select a facility" />
              </SelectTrigger>
              <SelectContent>
                {mockFacilities.map((facility) => (
                  <SelectItem key={facility.id} value={facility.id}>
                    {facility.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add Construction Site"}
          </Button>
        </form>
      </section>
    </div>
  );
}
