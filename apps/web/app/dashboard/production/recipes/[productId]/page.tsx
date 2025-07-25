"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { defineRecipeForProduct } from "@/app/actions/production-actions";
import { Product, RawMaterial, RecipeComponent } from "@repo/types";

interface RecipePageProps {
  params: {
    productId: string;
  };
}

// Mock data for demonstration
const mockProducts: Product[] = [
  { id: "prod1", name: "Product A" },
  { id: "prod2", name: "Product B" },
];

const mockRawMaterials: RawMaterial[] = [
  { id: "rm1", name: "Raw Material X", unit: "kg" },
  { id: "rm2", name: "Raw Material Y", unit: "liter" },
  { id: "rm3", name: "Raw Material Z", unit: "piece" },
];

const mockRecipes: { [productId: string]: RecipeComponent[] } = {
  prod1: [
    { rawMaterialId: "rm1", quantity: 10 },
    { rawMaterialId: "rm2", quantity: 5 },
  ],
  prod2: [{ rawMaterialId: "rm3", quantity: 20 }],
};

export default function RecipePage({ params }: RecipePageProps) {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [recipeComponents, setRecipeComponents] = useState<RecipeComponent[]>([]);
  const [selectedRawMaterial, setSelectedRawMaterial] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (productId) {
      // In a real application, you would fetch product and recipe data from an API
      const foundProduct = mockProducts.find((p) => p.id === productId);
      setProduct(foundProduct || null);
      setRecipeComponents(mockRecipes[productId as string] || []);
      setLoading(false);
    }
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !selectedRawMaterial || !quantity) {
      toast({
        title: "Error",
        description: "Please fill all fields.",
        variant: "destructive",
      });
      return;
    }

    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      toast({
        title: "Error",
        description: "Quantity must be a positive number.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const rawMaterial = mockRawMaterials.find(rm => rm.id === selectedRawMaterial);
      if (!rawMaterial) {
        toast({
          title: "Error",
          description: "Selected raw material not found.",
          variant: "destructive",
        });
        return;
      }

      const result = await defineRecipeForProduct(
        productId as string,
        selectedRawMaterial,
        parsedQuantity,
        rawMaterial.unit
      );

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        // Optimistically update UI or re-fetch data
        setRecipeComponents((prev) => [
          ...prev,
          { rawMaterialId: selectedRawMaterial, quantity: parsedQuantity },
        ]);
        setSelectedRawMaterial("");
        setQuantity("");
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to define recipe component:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading product recipe...</div>;
  }

  if (!product) {
    return <div className="p-4">Product not found.</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Recipe for {product.name}</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Current Recipe Components</h2>
        {recipeComponents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Raw Material</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipeComponents.map((component, index) => {
                const rawMaterial = mockRawMaterials.find(
                  (rm) => rm.id === component.rawMaterialId
                );
                return (
                  <TableRow key={index}>
                    <TableCell>{rawMaterial?.name || "Unknown"}</TableCell>
                    <TableCell>{component.quantity}</TableCell>
                    <TableCell>{rawMaterial?.unit || ""}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p>No recipe components defined yet.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Add New Recipe Component</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rawMaterial">Raw Material</Label>
            <Select
              value={selectedRawMaterial}
              onValueChange={setSelectedRawMaterial}
              disabled={submitting}
            >
              <SelectTrigger id="rawMaterial">
                <SelectValue placeholder="Select a raw material" />
              </SelectTrigger>
              <SelectContent>
                {mockRawMaterials.map((rm) => (
                  <SelectItem key={rm.id} value={rm.id}>
                    {rm.name} ({rm.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              disabled={submitting}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Define Recipe Component"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}