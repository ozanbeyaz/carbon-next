/**
 * @file Server Actions for logistics and fleet management.
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
 * Logs a new delivery.
 * Requires DATA_ENTRY role or higher.
 * This action also performs a facility-specific authorization check.
 * @param formData - The form data containing delivery log details.
 * @returns An object indicating success or failure.
 */
export async function logNewDelivery(
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  const facilityId = formData.get("facilityId") as string;

  // 1. Authorization Check
  const isAuthorized = checkAuthorization({
    session,
    allowedRoles: [UserRole.ADMIN, UserRole.COMPANY_ADMIN, UserRole.FACILITY_MANAGER, UserRole.DATA_ENTRY],
    facilityId: facilityId, // Check if the user has access to this specific facility
  });

  if (!isAuthorized || !session?.user) {
    return { success: false, message: "Not authorized for this facility." };
  }

  try {
    const vehicleId = formData.get("vehicleId") as string;
    const distanceKm = parseFloat(formData.get("distanceKm") as string);
    const fuelConsumed = parseFloat(formData.get("fuelConsumed") as string);

    if (!vehicleId || !facilityId || isNaN(distanceKm) || isNaN(fuelConsumed)) {
      return { success: false, message: "Invalid data provided." };
    }

    // 2. Database Operation
    await db.deliveryLog.create({
      data: {
        vehicleId,
        facilityId,
        distanceKm,
        fuelConsumed,
        date: new Date(),
        driverId: session.user.id, // Log the action to the current user
      },
    });

    // 3. Revalidate Path
    revalidatePath("/dashboard/logistics/logs");

    return { success: true, message: "Delivery logged successfully." };
  } catch (error) {
    console.error("Error logging delivery:", error);
    return { success: false, message: "An error occurred." };
  }
}
