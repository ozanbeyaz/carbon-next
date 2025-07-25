/**
 * @file Server Actions for CRM (Customer Relationship Management) related operations.
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
 * Creates a new customer in the database.
 * Requires COMPANY_ADMIN or ADMIN role.
 * @param formData - The form data from the client, expected to contain customer details.
 * @returns An object indicating success or failure.
 */
export async function createCustomer(
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();

  // 1. Authorization Check
  const isAuthorized = checkAuthorization({
    session,
    allowedRoles: [UserRole.ADMIN, UserRole.COMPANY_ADMIN],
  });

  if (!isAuthorized || !session?.user) {
    return { success: false, message: "Not authorized." };
  }

  try {
    const name = formData.get("name") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const companyId = (await db.user.findUnique({where: {id: session.user.id}}))?.companyId;

    if (!name || !companyId) {
      return { success: false, message: "Customer name is required." };
    }

    // 2. Database Operation
    await db.customer.create({
      data: {
        name,
        contactEmail,
        companyId: companyId,
      },
    });

    // 3. Revalidate Path
    // This will trigger a re-fetch of data on the customers page.
    revalidatePath("/dashboard/customers");

    return { success: true, message: "Customer created successfully." };
  } catch (error) {
    console.error("Error creating customer:", error);
    return { success: false, message: "An error occurred." };
  }
}

/**
 * Creates a new construction site for a given customer.
 * Requires COMPANY_ADMIN or ADMIN role.
 * @param customerId - The ID of the customer to whom the construction site belongs.
 * @param formData - The form data containing construction site details.
 * @returns An object indicating success or failure.
 */
export async function createConstructionSite(
  customerId: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();

  // 1. Authorization Check
  const isAuthorized = checkAuthorization({
    session,
    allowedRoles: [UserRole.ADMIN, UserRole.COMPANY_ADMIN],
  });

  if (!isAuthorized) {
    return { success: false, message: "Not authorized." };
  }

  try {
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const facilityId = formData.get("facilityId") as string | null;

    if (!name || !address || !customerId) {
      return { success: false, message: "All fields are required." };
    }

    // 2. Database Operation
    await db.constructionSite.create({
      data: {
        name,
        address,
        customerId,
        facilityId: facilityId || undefined, // Optional facility ID
      },
    });

    // 3. Revalidate Path
    revalidatePath(`/dashboard/crm/customers/${customerId}`);

    return { success: true, message: "Construction site created successfully." };
  } catch (error) {
    console.error("Error creating construction site:", error);
    return { success: false, message: "An error occurred." };
  }
}