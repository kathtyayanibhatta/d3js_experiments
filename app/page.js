// app/page.js
"use client";

import VariableSemiPie from "../app/components/VariableSemiPie";

const chartData = [
  {
    category: "Apples",
    angleValue: 30,
    radiusValue: 80,
    detailData: [
      { month: "Jan", sales: 15 },
      { month: "Feb", sales: 25 },
      { month: "Mar", sales: 40 },
      { month: "Apr", sales: 30 },
      { month: "May", sales: 45 },
    ],
  },
  {
    category: "Bananas",
    angleValue: 50,
    radiusValue: 120,
    detailData: [
      { month: "Jan", sales: 50 },
      { month: "Feb", sales: 30 },
      { month: "Mar", sales: 10 },
      { month: "Apr", sales: 20 },
      { month: "May", sales: 35 },
    ],
  },
  {
    category: "Oranges",
    angleValue: 20,
    radiusValue: 60,
    detailData: [
      { month: "Jan", sales: 5 },
      { month: "Feb", sales: 10 },
      { month: "Mar", sales: 15 },
      { month: "Apr", sales: 12 },
      { month: "May", sales: 18 },
    ],
  },
  {
    category: "Grapes",
    angleValue: 40,
    radiusValue: 100,
    detailData: [
      { month: "Jan", sales: 20 },
      { month: "Feb", sales: 22 },
      { month: "Mar", sales: 30 },
      { month: "Apr", sales: 28 },
      { month: "May", sales: 35 },
    ],
  },
];

export default function HomePage() {
  return (
    <div
      style={{
        padding: "20px",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Interactive Chart Toggle</h1>

      <div style={{ display: "flex", justifyContent: "center" }}>
        {/* The single component that toggles its view */}
        <VariableSemiPie data={chartData} />
      </div>
    </div>
  );
}
