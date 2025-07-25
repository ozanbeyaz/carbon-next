"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createCustomer } from "@/app/actions/customer-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function NewCustomerPage() {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      const result = await createCustomer(formData);
      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard/crm/customers");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Customer</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <Label htmlFor="name">Customer Name</Label>
          <Input id="name" name="name" required disabled={submitting} />
        </div>
        <div>
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input id="contactEmail" name="contactEmail" type="email" required disabled={submitting} />
        </div>
        <div>
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input id="phone" name="phone" type="tel" disabled={submitting} />
        </div>
        <div>
          <Label htmlFor="address">Address (Optional)</Label>
          <Input id="address" name="address" disabled={submitting} />
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add Customer"}
        </Button>
      </form>
    </div>
  );
}
