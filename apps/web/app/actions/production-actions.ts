/**
 * @file Server Actions for production and recipe management.
 */
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@repo/auth";
import { db, UserRole } from "@repo/db";
import { checkAuthorization } from "@repo/utils/auth-helpers";

interface ActionResult {
  success: boolean;
  message: string;
}

/**
 * Creates a new raw material.
 * Requires FACILITY_MANAGER, COMPANY_ADMIN, or ADMIN role.
 * @param formData - The form data containing raw material details.
 * @returns An object indicating success or failure.
 */
export async function createRawMaterial(
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();

  // 1. Authorization Check
  const isAuthorized = checkAuthorization({
    session,
    allowedRoles: [UserRole.ADMIN, UserRole.COMPANY_ADMIN, UserRole.FACILITY_MANAGER],
  });

  if (!isAuthorized) {
    return { success: false, message: "Not authorized." };
  }

  try {
    const name = formData.get("name") as string;
    const unit = formData.get("unit") as string;
    const supplier = formData.get("supplier") as string;

    if (!name || !unit) {
      return { success: false, message: "Material name and unit are required." };
    }

    // 2. Database Operation
    await db.rawMaterial.create({
      data: {
        name,
        unit,
        supplier,
      },
    });

    // 3. Revalidate Path
    revalidatePath("/dashboard/production/materials");

    return { success: true, message: "Raw material created successfully." };
  } catch (error) {
    console.error("Error creating raw material:", error);
    return { success: false, message: "An error occurred." };
  }
}

/**
 * Defines a recipe component for a product.
 * Requires FACILITY_MANAGER, COMPANY_ADMIN, or ADMIN role.
 * @param productId - The ID of the product for which to define the recipe.
 * @param rawMaterialId - The ID of the raw material used in the recipe.
 * @param quantity - The quantity of the raw material.
 * @param unit - The unit of the raw material quantity.
 * @returns An object indicating success or failure.
 */
export async function defineRecipeForProduct(
  productId: string,
  rawMaterialId: string,
  quantity: number,
  unit: string
): Promise<ActionResult> {
  const session = await auth();

  // 1. Authorization Check
  const isAuthorized = checkAuthorization({
    session,
    allowedRoles: [UserRole.ADMIN, UserRole.COMPANY_ADMIN, UserRole.FACILITY_MANAGER],
  });

  if (!isAuthorized) {
    return { success: false, message: "Not authorized." };
  }

  try {
    if (!productId || !rawMaterialId || !quantity || !unit) {
      return { success: false, message: "All recipe fields are required." };
    }

    // 2. Database Operation
    await db.productRecipeComponent.create({
      data: {
        productId,
        rawMaterialId,
        quantity,
        unit,
      },
    });

    // 3. Revalidate Path
    revalidatePath(`/dashboard/production/recipes/${productId}`);

    return { success: true, message: "Recipe component defined successfully." };
  } catch (error) {
    console.error("Error defining recipe component:", error);
    return { success: false, message: "An error occurred." };
  }
}
