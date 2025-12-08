"use client";

import VariableSemiPie from "../app/components/VariableSemiPie";
import ParliamentChart from "../app/components/RainbowParliamentChart";
import PyramidChart from "../app/components/PyramidChart";
import LollipopChart from "../app/components/LollipopChart";
import GradientColumnChart from "../app/components/GradientColumnChart";
import CompassPieChart from "../app/components/CompassPieChart";
import CappedClusteredColumnChart from "../app/components/CappedClusteredColumnChart";
import MultiLineChart from "../app/components/MultiLineChart";
import React from "react";

// --- DATASETS ---

// Data for the Variable Semi-Pie Chart (Chart 1)
const semiPieData = [
  {
    category: "Apples",
    angleValue: 30,
    radiusValue: 80,
    detailData: [
      { month: "Jan", sales: 15 },
      { month: "Feb", sales: 25 },
    ],
  },
  {
    category: "Bananas",
    angleValue: 50,
    radiusValue: 120,
    detailData: [
      { month: "Jan", sales: 50 },
      { month: "Feb", sales: 30 },
    ],
  },
  {
    category: "Oranges",
    angleValue: 20,
    radiusValue: 60,
    detailData: [
      { month: "Jan", sales: 5 },
      { month: "Feb", sales: 10 },
    ],
  },
  {
    category: "Grapes",
    angleValue: 40,
    radiusValue: 100,
    detailData: [
      { month: "Jan", sales: 20 },
      { month: "Feb", sales: 22 },
    ],
  },
];

// Data for the Parliament Chart (Chart 2)
const parliamentData = [
  { category: "Party A", seats: 200 },
  { category: "Party B", seats: 150 },
  { category: "Party C", seats: 70 },
  { category: "Party D", seats: 40 },
  { category: "Party E", seats: 30 },
  { category: "Party F", seats: 20 },
  { category: "Party G", seats: 15 },
  { category: "Party H", seats: 10 },
  { category: "Party I", seats: 8 },
];
const totalParliamentSeats = 543;

// Data for the Pyramid Chart (Chart 3)
const pyramidData = [
  { group: "0-18", male: 50, female: 45 },
  { group: "19-35", male: 80, female: 75 },
  { group: "36-55", male: 60, female: 65 },
  { group: "56+", male: 30, female: 40 },
];

// Data for the Lollipop Chart (Chart 4)
const lollipopData = [
  { group: "Product A", q1: 45, q2: 60 },
  { group: "Product B", q1: 70, q2: 55 },
  { group: "Product C", q1: 30, q2: 80 },
  { group: "Product D", q1: 55, q2: 75 },
];

// Data for the Gradient Column Chart (Chart 5)
const gradientChartData = [
  { group: "Q1", sales: 120, profit: 85 },
  { group: "Q2", sales: 150, profit: 100 },
  { group: "Q3", sales: 90, profit: 60 },
  { group: "Q4", sales: 180, profit: 130 },
];

// Data for the Capped Clustered Column Chart (Chart 6)
const cappedChartData = [
  { group: "Project X", sliceA: 70, sliceB: 30, capValue: 110 },
  { group: "Project Y", sliceA: 55, sliceB: 45, capValue: 100 },
  { group: "Project Z", sliceA: 90, sliceB: 20, capValue: 120 },
];

// Data for the Compass Pie Chart (Chart 7)
const compassPieData = [
  { category: "Category A", value: 40, size: 100 },
  { category: "Category B", value: 20, size: 60 },
  { category: "Category C", value: 30, size: 80 },
  { category: "Category D", value: 10, size: 40 },
  { category: "Category E", value: 50, size: 120 },
];

// NEW Data for Multi-Line Chart
const mockLineData = [
  { date: "2024-01-01", Sales: 50, Clicks: 300, Revenue: 2500 },
  { date: "2024-02-01", Sales: 55, Clicks: 320, Revenue: 2800 },
  { date: "2024-03-01", Sales: 62, Clicks: 350, Revenue: 3100 },
  { date: "2024-04-01", Sales: 70, Clicks: 410, Revenue: 3500 },
  { date: "2024-05-01", Sales: 81, Clicks: 490, Revenue: 4000 },
  { date: "2024-06-01", Sales: 78, Clicks: 470, Revenue: 3800 },
  { date: "2024-07-01", Sales: 95, Clicks: 550, Revenue: 4800 },
  { date: "2024-08-01", Sales: 105, Clicks: 610, Revenue: 5500 },
  { date: "2024-09-01", Sales: 110, Clicks: 650, Revenue: 5800 },
  { date: "2024-10-01", Sales: 115, Clicks: 680, Revenue: 6000 },
  { date: "2024-11-01", Sales: 125, Clicks: 750, Revenue: 6500 },
  { date: "2024-12-01", Sales: 130, Clicks: 800, Revenue: 7000 },
];
const lineChartKeys = ["Sales", "Clicks", "Revenue"];

export default function HomePage() {
  return (
    <div
      style={{
        padding: "20px",
        textAlign: "center",
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "600",
          marginBottom: "40px",
          color: "#1e3a8a",
        }}
      >
        Interactive Data Visualization Dashboard
      </h1>

      <div style={{ maxWidth: "1600px", margin: "0 auto" }}>
        {/* --- FIRST ROW: 3 Charts --- */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            flexWrap: "wrap",
            gap: "40px",
            marginBottom: "40px",
          }}
        >
          {/* Chart 1: Variable Radius Semi-Pie */}
          <div
            style={{
              flex: "1 1 450px",
              minWidth: "350px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <VariableSemiPie data={semiPieData} />
          </div>

          {/* Chart 2: Parliament Chart */}
          <div
            style={{
              flex: "1 1 450px",
              minWidth: "350px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <ParliamentChart
              data={parliamentData}
              totalSeats={totalParliamentSeats}
            />
          </div>

          {/* Chart 3: Pyramid Chart (Clustered Triangular Column) */}
          <div
            style={{
              flex: "1 1 450px",
              minWidth: "350px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <PyramidChart data={pyramidData} />
          </div>
        </div>

        {/* --- SECOND ROW: 3 Charts --- */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            flexWrap: "wrap",
            gap: "40px",
            marginBottom: "40px",
          }}
        >
          {/* Chart 4: Lollipop Chart */}
          <div
            style={{
              flex: "1 1 450px",
              minWidth: "350px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <LollipopChart data={lollipopData} />
          </div>

          {/* Chart 5: Gradient Column Chart */}
          <div
            style={{
              flex: "1 1 450px",
              minWidth: "350px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <GradientColumnChart data={gradientChartData} />
          </div>

          {/* Chart 6: Capped Clustered Column Chart */}
          <div
            style={{
              flex: "1 1 450px",
              minWidth: "350px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <CappedClusteredColumnChart data={cappedChartData} />
          </div>
        </div>

        {/* --- THIRD ROW: 1 Chart (Compass Pie Chart) --- */}
        <div
          style={{
            display: "flex",
            justifyContent: "center", // Center the single chart
            flexWrap: "wrap",
            gap: "40px",
          }}
        >
          {/* Chart 7: Compass Pie Chart */}
          <div
            style={{
              flex: "0 1 500px", // Fixed width for a single, centered chart
              minWidth: "400px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <CompassPieChart data={compassPieData} />
          </div>

          <div
            style={{
              flex: "1 1 450px",
              minWidth: "350px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Shadow handled in the component div
            }}
          >
            {/* The actual component is now used */}
            <MultiLineChart data={mockLineData} keys={lineChartKeys} />
          </div>
        </div>
      </div>

      {/* Legend/Notes */}
      <div
        style={{
          marginTop: "60px",
          padding: "20px",
          backgroundColor: "#eef2ff",
          borderRadius: "8px",
          maxWidth: "1600px",
          margin: "60px auto 0",
        }}
      ></div>
    </div>
  );
}
