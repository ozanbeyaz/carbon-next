import { auth } from "@repo/auth";
import { db } from "@repo/db";
import { DynamicDataEntryForm } from "@/app/dashboard/_components/dynamic-data-entry-form";

export default async function DataEntryPage() {
  const session = await auth();

  if (!session?.user) {
    return <p>Please sign in to access data entry.</p>;
  }

  // Fetch the company's industry template and its data fields
  // For simplicity, assuming a default template or fetching based on company settings
  const company = await db.company.findUnique({
    where: { id: session.user.companyId },
    include: {
      settings: true, // Assuming settings might point to a default template
    },
  });

  if (!company) {
    return <p>Company not found.</p>;
  }

  // In a real application, you'd determine the active industry template
  // based on company settings or user selection.
  // For now, let's just fetch all data fields with emission factors.
  const dataFields = await db.dataFieldTemplate.findMany({
    include: { emissionFactors: true },
  });

  // For demonstration, we'll use a dummy report ID. In a real app,
  // this would come from a selected report or a new report creation flow.
  const dummyReportId = "clx000000000000000000000"; // Replace with actual report ID logic

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">General Data Entry</h1>
      <p className="mb-4">Active Facility: (Selected from top filter)</p>
      <DynamicDataEntryForm dataFields={dataFields} reportId={dummyReportId} />
    </div>
  );
}
