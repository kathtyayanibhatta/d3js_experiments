"use client";

import React from "react";
// Import Recharts components
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * MultiLineChart Component
 * Renders a responsive line chart showing multiple data series over time using Recharts.
 * @param {Object[]} data - Array of data objects, each containing a 'date' key and the series keys.
 * @param {string[]} keys - Array of strings representing the data keys (series names) to plot.
 */
const MultiLineChart = ({ data, keys }) => {
  // Dynamically assign colors for the lines
  const colors = ["#2563eb", "#10b981", "#f59e0b"]; // Blue, Green, Yellow-Orange

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        height: "400px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h3
        style={{
          marginBottom: "15px",
          fontSize: "1.25rem",
          fontWeight: "600",
          color: "#1f2937",
          textAlign: "center",
        }}
      >
        Multi-Series Performance Over Time
      </h3>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart
          data={data}
          // Adjusted margins for better spacing, especially bottom for rotated XAxis labels
          margin={{ top: 10, right: 30, left: 10, bottom: 40 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e0e0e0"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            style={{ fontSize: "10px" }}
            padding={{ left: 10, right: 10 }}
            // Format and rotate ticks to prevent overlap
            tickFormatter={(tick) =>
              new Date(tick).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
              })
            }
            angle={-45}
            textAnchor="end"
            height={40} // Reserve space for rotated labels
            interval={0} // Ensure all points are labeled
          />
          <YAxis style={{ fontSize: "10px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e3a8a",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "10px",
            }}
            labelStyle={{ fontWeight: "bold", color: "#fff" }}
            formatter={(value) => [`${value.toLocaleString()}`, "Value"]}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
          {keys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              // FIX: Set dot to an object to make it visible at all times
              dot={{
                r: 3,
                strokeWidth: 1,
                fill: colors[index % colors.length],
              }}
              activeDot={{
                r: 6,
                strokeWidth: 2,
                fill: colors[index % colors.length],
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MultiLineChart;
