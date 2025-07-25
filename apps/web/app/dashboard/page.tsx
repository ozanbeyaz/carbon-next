/**
 * @file Main Dashboard Client Component.
 */
"use client";

import { useEffect, useState } from "react";
import { useFacilityStore } from "@/app/store/facility-store";
import { Card, Metric, Text, Title, BarList, DonutChart, LineChart } from "@tremor/react";

interface DashboardData {
  totalEmissions: number;
  emissionsByScope: { [key: string]: number };
  emissionsByCategory: { [key: string]: number };
  emissionsOverTime: { date: string; emissions: number }[];
}

export default function DashboardPage() {
  const { activeFacilityId } = useFacilityStore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const url = activeFacilityId
          ? `/api/dashboard-data?facilityId=${activeFacilityId}`
          : `/api/dashboard-data`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: DashboardData = await response.json();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [activeFacilityId]);

  if (loading) {
    return <div className="container mx-auto py-10">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-10 text-red-500">Error: {error}</div>;
  }

  if (!dashboardData || Object.keys(dashboardData).length === 0 || (dashboardData.totalEmissions === 0 && Object.keys(dashboardData.emissionsByCategory).length === 0 && dashboardData.emissionsOverTime.length === 0)) {
    return (
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <Title>Dashboard</Title>
        <Text>Overview of your carbon emissions.</Text>
        <Card className="mt-6">
          <Title>No Data Available</Title>
          <Text className="mt-2">
            It looks like there's no carbon emission data to display yet.
            Please ensure you have entered some data into the system.
          </Text>
        </Card>
      </main>
    );
  }

  const emissionsByCategoryData = Object.entries(dashboardData.emissionsByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Dashboard</Title>
      <Text>Overview of your carbon emissions.</Text>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card>
          <Text>Total Emissions</Text>
          <Metric>{dashboardData.totalEmissions.toFixed(2)} tCO2e</Metric>
        </Card>
        {/* Placeholder for Scope-based distribution */}
        <Card>
          <Text>Emissions by Scope (Placeholder)</Text>
          <Metric>N/A</Metric>
        </Card>
        <Card>
          <Text>Emissions by Category</Text>
          <DonutChart
            data={emissionsByCategoryData}
            category="value"
            index="name"
            variant="pie"
            valueFormatter={(number) => `${number.toFixed(2)} tCO2e`}
            className="w-full h-48"
          />
        </Card>
      </div>

      <Card className="mt-6">
        <Title>Emissions Over Time</Title>
        <LineChart
          className="mt-6"
          data={dashboardData.emissionsOverTime}
          index="date"
          categories={["emissions"]}
          colors={["blue"]}
          valueFormatter={(number) => `${number.toFixed(2)} tCO2e`}
          yAxisWidth={48}
        />
      </Card>
    </main>
  );
}