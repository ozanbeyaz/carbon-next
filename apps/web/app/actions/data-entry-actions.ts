/**
 * @file Server Actions for generic data entry.
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
 * Creates a new generic data log entry.
 * Requires DATA_ENTRY role or higher and access to the specified facility.
 * @param formData - The form data containing the generic log details.
 * @returns An object indicating success or failure.
 */
export async function createGenericDataLog(
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  const facilityId = formData.get("facilityId") as string;

  // 1. Authorization Check
  const isAuthorized = checkAuthorization({
    session,
    allowedRoles: [UserRole.ADMIN, UserRole.COMPANY_ADMIN, UserRole.FACILITY_MANAGER, UserRole.DATA_ENTRY],
    facilityId: facilityId, // Facility-level check
  });

  if (!isAuthorized || !session?.user) {
    return { success: false, message: "Not authorized for this facility." };
  }

  try {
    const reportId = formData.get("reportId") as string;
    const dataFieldId = formData.get("dataFieldId") as string;
    const emissionFactorId = formData.get("emissionFactorId") as string;
    const value = formData.get("value") as string;

    if (!reportId || !facilityId || !dataFieldId || !emissionFactorId || !value) {
      return { success: false, message: "All fields are required." };
    }

    // 2. Database Operation
    await db.genericDataLog.create({
      data: {
        reportId,
        facilityId,
        dataFieldId,
        emissionFactorId,
        value,
        date: new Date(),
        enteredById: session.user.id,
      },
    });

    // 3. Revalidate Path
    // Revalidate the specific report page where the data was added.
    revalidatePath(`/dashboard/reports/${reportId}`);

    return { success: true, message: "Data logged successfully." };
  } catch (error) {
    console.error("Error creating generic data log:", error);
    return { success: false, message: "An error occurred." };
  }
}
