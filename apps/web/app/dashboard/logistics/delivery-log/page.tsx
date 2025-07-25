"use client";

import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { logNewDelivery } from "@/app/actions/logistics-actions";
import { Customer, ConstructionSite, Facility, Product } from "@repo/types";

// Mock data for demonstration
const mockCustomers: Customer[] = [
  { id: "cust1", name: "ABC Corp", email: "info@abccorp.com" },
  { id: "cust2", name: "XYZ Ltd", email: "contact@xyzltd.com" },
];

const mockConstructionSites: ConstructionSite[] = [
  { id: "cs1", customerId: "cust1", name: "Site Alpha", address: "100 Industrial Rd" },
  { id: "cs2", customerId: "cust1", name: "Site Beta", address: "200 Business Park" },
  { id: "cs3", customerId: "cust2", name: "Site Gamma", address: "300 Tech Blvd" },
];

const mockFacilities: Facility[] = [
  { id: "fac1", name: "Main Plant", address: "123 Plant Rd" },
  { id: "fac2", name: "Warehouse A", address: "456 Storage St" },
];

const mockProducts: Product[] = [
  { id: "prod1", name: "Concrete Mix" },
  { id: "prod2", name: "Steel Beams" },
];

export default function DeliveryLogPage() {
  const [submitting, setSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [filteredConstructionSites, setFilteredConstructionSites] = useState<ConstructionSite[]>([]);

  useEffect(() => {
    if (selectedCustomer) {
      setFilteredConstructionSites(
        mockConstructionSites.filter((site) => site.customerId === selectedCustomer)
      );
    } else {
      setFilteredConstructionSites([]);
    }
  }, [selectedCustomer]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    // Add mock data for vehicleId, fuelConsumed as they are expected by logNewDelivery
    formData.append("vehicleId", "mock-vehicle-123");
    formData.append("fuelConsumed", "100"); // Mock value

    try {
      const result = await logNewDelivery(formData);
      if (result.success) {
        toast.success(result.message);
        // Reset form or redirect
        e.currentTarget.reset();
        setSelectedCustomer("");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error logging delivery:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Log New Delivery</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" required disabled={submitting} />
        </div>

        <div>
          <Label htmlFor="sourceFacility">Source Facility</Label>
          <Select name="facilityId" required disabled={submitting}>
            <SelectTrigger id="sourceFacility">
              <SelectValue placeholder="Select source facility" />
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

        <div>
          <Label htmlFor="customer">Customer</Label>
          <Select
            value={selectedCustomer}
            onValueChange={setSelectedCustomer}
            name="customerId"
            required
            disabled={submitting}
          >
            <SelectTrigger id="customer">
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {mockCustomers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="constructionSite">Construction Site</Label>
          <Select name="constructionSiteId" required disabled={submitting}>
            <SelectTrigger id="constructionSite">
              <SelectValue placeholder="Select construction site" />
            </SelectTrigger>
            <SelectContent>
              {filteredConstructionSites.length > 0 ? (
                filteredConstructionSites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name} ({site.address})
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  No sites available for selected customer
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="product">Delivered Product</Label>
          <Select name="productId" required disabled={submitting}>
            <SelectTrigger id="product">
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {mockProducts.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            step="0.01"
            required
            disabled={submitting}
          />
        </div>

        <div>
          <Label htmlFor="distance">Distance (km)</Label>
          <Input
            id="distance"
            name="distanceKm"
            type="number"
            step="0.1"
            required
            disabled={submitting}
          />
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? "Logging..." : "Log Delivery"}
        </Button>
      </form>
    </div>
  );
}
