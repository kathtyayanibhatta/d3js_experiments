"use client";

import VariableSemiPie from "../app/components/VariableSemiPie";
import ParliamentChart from "../app/components/ParliamentChart";
import RainbowParliamentChart from "../app/components/RainbowParliamentChart"; // Added Rainbow Chart
import React from "react";

// --- DATASETS ---

// Data for the Variable Semi-Pie Chart
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

// Data for the FIRST Parliament Chart (Custom Colors)
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

// Data for the SECOND Parliament Chart (Rainbow Colors)
const rainbowParliamentData = [
  { category: "Coalition Alpha", seats: 250 },
  { category: "Opposition Beta", seats: 180 },
  { category: "Independents P1", seats: 50 },
  { category: "Independents P2", seats: 35 },
  { category: "Minor Group", seats: 18 },
];
const rainbowTotalSeats = 533;

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
        Interactive Radial Charts Dashboard
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly", // Distribute space evenly for three items
          flexWrap: "wrap",
          gap: "40px",
          maxWidth: "1600px", // Increased max width to fit three charts comfortably
          margin: "0 auto",
        }}
      >
        {/* Chart 1: Variable Radius Semi-Pie */}
        <div
          style={{
            flex: "1 1 450px", // Allows up to 3 charts per row on wide screens
            minWidth: "350px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <VariableSemiPie data={semiPieData} />
        </div>

        {/* Chart 2: Parliament Chart (Custom Colors) */}
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

        {/* Chart 3: Second Parliament Chart (Rainbow View) */}
        <div
          style={{
            flex: "1 1 450px",
            minWidth: "350px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <RainbowParliamentChart
            data={rainbowParliamentData}
            totalSeats={rainbowTotalSeats}
          />
        </div>
      </div>

      {/* Legend/Notes */}
      <div
        style={{
          marginTop: "60px",
          padding: "20px",
          backgroundColor: "#eef2ff",
          borderRadius: "8px",
        }}
      >
        <p style={{ fontSize: "1.1em", color: "#333" }}>
          This dashboard compares three types of radial data visualization:
          <br />
          1. **Variable Semi-Pie:** Uses data to control both the angle and the
          radial depth of each slice.
          <br />
          2. **Parliament Chart (Left):** Uses a custom, repeating color palette
          for party representation.
          <br />
          3. **Parliament Chart (Right - Rainbow):** Uses a **D3 Interpolate
          Rainbow** color scale for a continuous, highly contrasting look.
        </p>
      </div>
    </div>
  );
}
