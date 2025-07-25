import { NextResponse } from 'next/server';
import { db } from '@repo/db';
import { auth } from '@repo/auth';

export async function GET(request: Request) {
  // const session = await auth();

  // if (!session?.user) {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }

  const session = { user: { companyId: 'your-company-id' } }; // Mock session

  const { searchParams } = new URL(request.url);
  const facilityId = searchParams.get('facilityId');
  const companyId = session.user.companyId; // Assuming companyId is on the session

  if (!companyId) {
    return NextResponse.json({ message: 'Company ID not found in session' }, { status: 400 });
  }

  try {
    // Fetch reports for the company, optionally filtered by facility
    const reports = await db.report.findMany({
      where: {
        companyId: companyId,
        ...(facilityId && { genericDataLogs: { some: { facilityId: facilityId } } }),
      },
      select: {
        id: true,
        title: true,
        totalEmissions: true,
        createdAt: true,
        genericDataLogs: {
          select: {
            id: true,
            value: true,
            date: true,
            emissionFactor: {
              select: {
                value: true,
                unit: true,
                dataField: { select: { fieldName: true } },
              },
            },
          },
        },
      },
    });

    // Basic aggregation for demonstration
    let totalEmissions = 0;
    const emissionsByScope: { [key: string]: number } = {}; // Placeholder for scope-based aggregation
    const emissionsByCategory: { [key: string]: number } = {};
    const emissionsOverTime: { date: string; emissions: number }[] = [];

    reports.forEach(report => {
      if (report.totalEmissions) {
        totalEmissions += report.totalEmissions;
      }

      report.genericDataLogs.forEach(log => {
        const emission = parseFloat(log.value) * (log.emissionFactor?.value || 0);
        const category = log.emissionFactor?.dataField?.fieldName || 'Other';
        
        emissionsByCategory[category] = (emissionsByCategory[category] || 0) + emission;

        // Simple date aggregation (e.g., by month)
        const month = new Date(log.date).toISOString().substring(0, 7);
        const existingMonth = emissionsOverTime.find(item => item.date === month);
        if (existingMonth) {
          existingMonth.emissions += emission;
        } else {
          emissionsOverTime.push({ date: month, emissions: emission });
        }
      });
    });

    // Sort emissions over time
    emissionsOverTime.sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      totalEmissions,
      emissionsByScope,
      emissionsByCategory,
      emissionsOverTime,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
