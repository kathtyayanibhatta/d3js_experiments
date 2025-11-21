"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

// Utility function to darken a hex color by a specified percentage
const darkenColor = (hex, percent) => {
  let r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  // Calculate the darker component values
  const factor = (100 - percent) / 100;
  r = Math.floor(r * factor);
  g = Math.floor(g * factor);
  b = Math.floor(b * factor);

  // Ensure values are within 0-255
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  const rgb = (r << 16) + (g << 8) + b;
  return `#${rgb.toString(16).padStart(6, "0")}`;
};

const CompassPieChart = ({
  data,
  totalValue = 342,
  totalLabel = "Total Seats",
}) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    d3.select(svgRef.current).selectAll("*").remove();

    // Chart Dimensions and Configuration
    const width = 500;
    const height = 500;
    const margin = 20;

    // --- Radii Definitions for the Nested Structure ---
    const centerLabelRadius = 100; // Radius for the innermost circle holding text
    const innerRadiusHub = centerLabelRadius + 5; // Start of the darker "hub" ring
    const outerRadiusHub = 125; // End of the darker "hub" ring
    const innerRadiusSlice = outerRadiusHub; // Start of the main colored slices
    const outerRadiusSlice = Math.min(width, height) / 2 - margin; // Outer edge of the chart

    const pointerStartRadius = innerRadiusSlice; // Pointers start at the slice inner edge
    const pointerEndRadius = innerRadiusSlice + 30; // Pointers extend into the slice

    // Setup SVG container
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // --- Data Preparation ---
    const totalSum = d3.sum(data, (d) => d.value);

    const pieData = d3
      .pie()
      .value((d) => d.value)
      .sort(null);

    // --- Custom Color Scheme (Exactly matching the image) ---
    const colors = [
      "#F0D4B2", // Light cream/orange
      "#E7A887", // Peach/light orange
      "#BC858C", // Muted rose/pink
      "#C79D4D", // Gold/brown
      "#AA947C", // Darker brown
    ];
    const customColors = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.category))
      .range(colors);

    // Function to get the darker color for the hub/pointer
    const getDarkColor = (d) => darkenColor(customColors(d.data.category), 30);

    // --- 1. Drawing the Darker Hub Ring (The inner connected circle) ---
    const hubArcGenerator = d3
      .arc()
      .innerRadius(innerRadiusHub)
      .outerRadius(outerRadiusHub);

    const hubArcs = g
      .selectAll(".hub-arc")
      .data(pieData(data))
      .join("g")
      .attr("class", "hub-arc");

    hubArcs
      .append("path")
      .attr("d", hubArcGenerator)
      .attr("fill", getDarkColor) // Use the darkened color
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .style("filter", "drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.05))");

    // --- 2. Drawing Main Pie Slices (The outer ring) ---
    const sliceArcGenerator = d3
      .arc()
      .innerRadius(innerRadiusSlice)
      .outerRadius(outerRadiusSlice);

    const slices = g
      .selectAll(".main-slice")
      .data(pieData(data))
      .join("g")
      .attr("class", "main-slice");

    slices
      .append("path")
      .attr("d", sliceArcGenerator)
      .attr("fill", (d) => customColors(d.data.category))
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .style("filter", "drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.15))");

    // --- 3. Add Percentage and Category Labels within Slices ---
    slices.each(function (d) {
      const sliceCentroid = sliceArcGenerator.centroid(d);
      const percentage = ((d.data.value / totalSum) * 100).toFixed(0);

      // Determine text color based on slice lightness (simple check for contrast)
      const isLightSlice = d.data.category === "7%"; // The lightest slice in the provided example
      const textColor = isLightSlice ? "#8B5A3F" : "#FFF";

      // Percentage text
      g.append("text")
        .attr(
          "transform",
          `translate(${sliceCentroid[0]}, ${sliceCentroid[1] - 12})`
        )
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .style("font-family", "Inter, sans-serif")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .style("fill", textColor)
        .text(`${percentage}%`);

      // Category text
      g.append("text")
        .attr(
          "transform",
          `translate(${sliceCentroid[0]}, ${sliceCentroid[1] + 12})`
        )
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .style("font-family", "Inter, sans-serif")
        .style("font-size", "14px")
        .style("fill", textColor)
        .text(d.data.label || d.data.category);
    });

    // --- 4. Add Compass Pointers (on top of the outer ring) ---
    slices.each(function (d) {
      const midAngle = (d.startAngle + d.endAngle) / 2;
      const pointerWidth = 10; // Base width of the pointer triangle
      const pointerColor = getDarkColor(d); // Match the dark hub color

      // Points for the tapered arrow, using polar coordinates

      // Base points (at the inner edge of the main slice)
      const xStartLeft =
        pointerStartRadius *
        Math.sin(midAngle - pointerWidth / pointerStartRadius / 2);
      const yStartLeft =
        pointerStartRadius *
        -Math.cos(midAngle - pointerWidth / pointerStartRadius / 2);

      const xStartRight =
        pointerStartRadius *
        Math.sin(midAngle + pointerWidth / pointerStartRadius / 2);
      const yStartRight =
        pointerStartRadius *
        -Math.cos(midAngle + pointerWidth / pointerStartRadius / 2);

      // Tip point (further out into the slice)
      const xEnd = pointerEndRadius * Math.sin(midAngle);
      const yEnd = pointerEndRadius * -Math.cos(midAngle);

      // Create a path string for the triangle
      const pointerPath = `M ${xStartLeft},${yStartLeft} L ${xEnd},${yEnd} L ${xStartRight},${yStartRight} Z`;

      g.append("path")
        .attr("d", pointerPath)
        .attr("fill", pointerColor)
        .attr("stroke", pointerColor)
        .attr("stroke-width", 0.5)
        .style("filter", "drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.1))");
    });

    // --- 5. Add Central Circle with Total ---
    g.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", centerLabelRadius)
      .attr("fill", "#D9C8A1") // Center circle background
      .attr("stroke", "#AA947C") // Center circle border
      .attr("stroke-width", 1);

    // Total Value Text
    g.append("text")
      .attr("x", 0)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .style("font-family", "Inter, sans-serif")
      .style("font-size", "30px")
      .style("font-weight", "bold")
      .style("fill", "#8B5A3F") // Dark brown text
      .text(totalValue);

    // Total Label Text
    g.append("text")
      .attr("x", 0)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .style("font-family", "Inter, sans-serif")
      .style("font-size", "16px")
      .style("fill", "#8B5A3F") // Dark brown text
      .text(totalLabel);
  }, [data, totalValue, totalLabel]);

  return (
    <div className="flex justify-center p-4">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap");
      `}</style>
      <div
        className="shadow-2xl rounded-xl"
        style={{
          border: "1px solid #e0e0e0",
          backgroundColor: "#fff",
          maxWidth: "520px",
          overflow: "hidden",
        }}
      >
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
};

export default CompassPieChart;
